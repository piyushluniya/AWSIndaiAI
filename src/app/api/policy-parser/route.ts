import { NextRequest, NextResponse } from "next/server"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../../../../amplify/data/resource"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { s3Key, userId, policyId } = body

    if (!s3Key || !userId) {
      return NextResponse.json({ error: "s3Key and userId are required" }, { status: 400 })
    }

    // Get S3 bucket name from environment (set during Amplify deployment)
    const s3Bucket = process.env.STORAGE_BIMASETU_BUCKET_NAME || ""

    const lambdaFunctionName = process.env.POLICY_PARSER_FUNCTION_NAME
    if (!lambdaFunctionName) throw new Error("POLICY_PARSER_FUNCTION_NAME not set")

    const lambda = new LambdaClient({ region: "us-east-1" })

    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: lambdaFunctionName,
        InvocationType: "Event", // Async invocation
        Payload: JSON.stringify({ s3Key, userId, s3Bucket, policyId })
      })
    )

    // Update DynamoDB status to "parsing" (the Lambda will update to "ready" when done)
    // This is handled optimistically

    return NextResponse.json({ success: true, message: "Policy parsing started" })
  } catch (error) {
    console.error("Policy parser error:", error)
    return NextResponse.json(
      { error: "Policy parsing failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
