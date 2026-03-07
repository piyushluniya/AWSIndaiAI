// Shared Gemini API helper for all Lambda functions

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

interface GeminiPart {
  text: string
}

interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
}

interface GeminiRequest {
  systemInstruction?: { parts: GeminiPart[] }
  contents: GeminiContent[]
  generationConfig?: {
    maxOutputTokens?: number
    temperature?: number
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: GeminiPart[]; role: string }
    finishReason: string
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
  error?: { code: number; message: string; status: string }
}

export interface GeminiCallParams {
  prompt?: string
  systemPrompt?: string
  conversationHistory?: Array<{ role: string; content: string }>
  maxTokens?: number
  temperature?: number
}

export async function callGemini(params: GeminiCallParams): Promise<string> {
  const { prompt, systemPrompt, conversationHistory = [], maxTokens = 1024, temperature = 0.7 } = params

  if (!GEMINI_API_KEY) {
    console.error("[Gemini] FATAL: GEMINI_API_KEY environment variable is not set")
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  // Build contents from conversation history + current prompt
  const contents: GeminiContent[] = []

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    })
  }

  if (prompt) {
    contents.push({ role: "user", parts: [{ text: prompt }] })
  }

  const requestBody: GeminiRequest = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature }
  }

  if (systemPrompt) {
    requestBody.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  console.log(`[Gemini] Model: ${GEMINI_MODEL}`)
  console.log(`[Gemini] Messages: ${contents.length} | maxTokens: ${maxTokens} | temperature: ${temperature}`)
  console.log(`[Gemini] Has system prompt: ${!!systemPrompt}`)

  const startTime = Date.now()

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
  } catch (networkErr) {
    console.error("[Gemini] Network error calling API:", networkErr)
    throw new Error(`Gemini API network error: ${networkErr}`)
  }

  const elapsed = Date.now() - startTime
  console.log(`[Gemini] HTTP ${response.status} in ${elapsed}ms`)

  const rawText = await response.text()

  if (!response.ok) {
    console.error(`[Gemini] API error ${response.status}: ${rawText}`)
    throw new Error(`Gemini API error ${response.status}: ${rawText}`)
  }

  let data: GeminiResponse
  try {
    data = JSON.parse(rawText) as GeminiResponse
  } catch (parseErr) {
    console.error("[Gemini] Failed to parse response JSON:", rawText)
    throw new Error("Failed to parse Gemini response JSON")
  }

  if (data.usageMetadata) {
    console.log(
      `[Gemini] Tokens — prompt: ${data.usageMetadata.promptTokenCount}, ` +
      `output: ${data.usageMetadata.candidatesTokenCount}, ` +
      `total: ${data.usageMetadata.totalTokenCount}`
    )
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  const finishReason = data.candidates?.[0]?.finishReason
  console.log(`[Gemini] Finish reason: ${finishReason}`)

  if (!text) {
    console.error("[Gemini] Empty response candidates:", JSON.stringify(data))
    throw new Error("Empty response from Gemini")
  }

  return text
}

// Call this once at Lambda cold start to verify the API key and model are working
export async function testGeminiConnection(functionName: string): Promise<void> {
  console.log(`[Gemini] [${functionName}] Running startup connection test...`)
  try {
    const result = await callGemini({
      prompt: 'Reply with exactly this JSON and nothing else: {"status":"ok","service":"gemini"}',
      maxTokens: 30,
      temperature: 0
    })
    console.log(`[Gemini] [${functionName}] Startup test PASSED. Response: ${result.trim()}`)
  } catch (err) {
    console.error(`[Gemini] [${functionName}] Startup test FAILED:`, err)
    // Don't throw — Lambda should still start; the real call will fail with a clear error if needed
  }
}
