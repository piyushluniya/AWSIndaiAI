import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand
} from "@aws-sdk/client-textract"
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb"
import { callGemini, testGeminiConnection } from "../shared/gemini"

const textract = new TextractClient({ region: "us-east-1" })
const dynamo = new DynamoDBClient({ region: "us-east-1" })

// Run once at cold start to verify Gemini connectivity
let startupTestDone = false
async function ensureStartupTest() {
  if (!startupTestDone) {
    startupTestDone = true
    await testGeminiConnection("policyParser")
  }
}

interface PolicyParserEvent {
  s3Key: string
  userId: string
  s3Bucket: string
  policyId?: string
}

interface ParsedCoverage {
  insurer: string
  policyNumber: string
  policyType: string
  sumInsured: number
  deductible: number
  premium: number
  policyPeriod: { from: string; to: string }
  coveredProcedures: Array<{ name: string; limit: number; notes: string }>
  exclusions: string[]
  waitingPeriods: Array<{ condition: string; period: string }>
  roomRentLimit: number
  coPay: number
  networkHospitalCount: number
  riders: string[]
  keyHighlights: string[]
}

async function pollTextract(jobId: string): Promise<string> {
  console.log(`[policyParser] Polling Textract job: ${jobId}`)
  let text = ""
  let nextToken: string | undefined
  let pollCount = 0

  while (true) {
    pollCount++
    const params: { JobId: string; NextToken?: string } = { JobId: jobId }
    if (nextToken) params.NextToken = nextToken

    const response = await textract.send(new GetDocumentTextDetectionCommand(params))
    console.log(`[policyParser] Textract poll #${pollCount} — status: ${response.JobStatus}`)

    if (response.JobStatus === "FAILED") {
      console.error("[policyParser] Textract job FAILED")
      throw new Error("Textract job failed")
    }

    if (response.JobStatus === "SUCCEEDED") {
      for (const block of response.Blocks || []) {
        if (block.BlockType === "LINE" && block.Text) {
          text += block.Text + "\n"
        }
      }

      if (response.NextToken) {
        nextToken = response.NextToken
        console.log("[policyParser] Textract has more pages, continuing...")
      } else {
        console.log(`[policyParser] Textract complete — extracted ${text.length} chars of text`)
        break
      }
    } else {
      // Still in progress — wait 5 seconds
      console.log("[policyParser] Textract still in progress, waiting 5s...")
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  return text
}

export const handler = async (event: PolicyParserEvent): Promise<ParsedCoverage> => {
  console.log("[policyParser] Handler invoked with event:", JSON.stringify({ s3Key: event.s3Key, userId: event.userId, s3Bucket: event.s3Bucket, policyId: event.policyId }))

  await ensureStartupTest()

  const { s3Key, s3Bucket, policyId } = event

  if (!s3Key || !s3Bucket) {
    console.error("[policyParser] Missing s3Key or s3Bucket")
    throw new Error("s3Key and s3Bucket are required")
  }

  // Start Textract job
  console.log(`[policyParser] Starting Textract job for s3://${s3Bucket}/${s3Key}`)
  const startResponse = await textract.send(
    new StartDocumentTextDetectionCommand({
      DocumentLocation: {
        S3Object: { Bucket: s3Bucket, Name: s3Key }
      }
    })
  )

  const jobId = startResponse.JobId
  if (!jobId) {
    console.error("[policyParser] Textract did not return a JobId")
    throw new Error("Failed to start Textract job")
  }
  console.log(`[policyParser] Textract job started: ${jobId}`)

  // Poll for results
  const extractedText = await pollTextract(jobId)

  // Truncate text if too long (Gemini has context limits)
  const truncatedText = extractedText.length > 50000
    ? extractedText.substring(0, 50000) + "\n...[truncated]"
    : extractedText
  console.log(`[policyParser] Text length after truncation: ${truncatedText.length} chars`)

  const prompt = `You are an expert Indian insurance policy analyst. Parse the following insurance policy document and extract key information.

POLICY DOCUMENT TEXT:
${truncatedText}

Extract and return a JSON object with this exact structure:
{
  "insurer": "<insurance company name>",
  "policyNumber": "<policy number or 'Not found'>",
  "policyType": "<type: health/life/term/motor/travel/etc>",
  "sumInsured": <sum insured in lakhs, number>,
  "deductible": <deductible/excess amount in rupees, 0 if none>,
  "premium": <annual premium in rupees>,
  "policyPeriod": {
    "from": "<DD/MM/YYYY or 'Not specified'>",
    "to": "<DD/MM/YYYY or 'Not specified'>"
  },
  "coveredProcedures": [
    {"name": "<procedure/benefit name>", "limit": <limit in rupees, 0 if unlimited>, "notes": "<sub-limits or conditions>"}
  ],
  "exclusions": ["<exclusion 1>", "<exclusion 2>"],
  "waitingPeriods": [
    {"condition": "<condition name>", "period": "<duration like 2 years, 30 days>"}
  ],
  "roomRentLimit": <room rent limit per day in rupees, 0 if no limit>,
  "coPay": <co-pay percentage, 0 if none>,
  "networkHospitalCount": <number of network hospitals, 0 if unknown>,
  "riders": ["<rider 1>", "<rider 2>"],
  "keyHighlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"]
}

Return ONLY the JSON, no markdown, no explanation. Fill in "Not found" or 0 for fields that cannot be determined.`

  console.log("[policyParser] Calling Gemini for policy analysis...")
  const content = await callGemini({ prompt, maxTokens: 2048, temperature: 0.1 })

  console.log("[policyParser] Raw Gemini response (first 200 chars):", content.substring(0, 200))

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error("[policyParser] Failed to extract JSON from Gemini response:", content)
    throw new Error("Failed to extract JSON from Gemini response")
  }

  let parsed: ParsedCoverage
  try {
    parsed = JSON.parse(jsonMatch[0]) as ParsedCoverage
  } catch (err) {
    console.error("[policyParser] JSON parse error:", err, "| Raw JSON:", jsonMatch[0])
    throw new Error("Failed to parse JSON from Gemini response")
  }

  console.log(`[policyParser] Successfully parsed policy — insurer: ${parsed.insurer} | type: ${parsed.policyType} | sumInsured: ₹${parsed.sumInsured} lakhs`)

  // Write parsed results back to DynamoDB
  if (policyId) {
    const tableName = process.env.DYNAMODB_POLICY_TABLE
    if (!tableName) {
      console.error("[policyParser] DYNAMODB_POLICY_TABLE env var not set — skipping DynamoDB update")
    } else {
      try {
        console.log(`[policyParser] Updating DynamoDB record: ${policyId}`)
        await dynamo.send(new UpdateItemCommand({
          TableName: tableName,
          Key: { id: { S: policyId } },
          UpdateExpression: "SET parsedCoverage = :pc, insurer = :ins, #st = :st, updatedAt = :ua",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":pc": { S: JSON.stringify(parsed) },
            ":ins": { S: parsed.insurer },
            ":st": { S: "ready" },
            ":ua": { S: new Date().toISOString() }
          }
        }))
        console.log(`[policyParser] DynamoDB updated successfully — status: ready`)
      } catch (dbErr) {
        console.error("[policyParser] Failed to update DynamoDB:", dbErr)
        // Don't throw — parsing succeeded, DB update failure is non-fatal for logging purposes
      }
    }
  } else {
    console.warn("[policyParser] No policyId provided — skipping DynamoDB update")
  }

  return parsed
}
