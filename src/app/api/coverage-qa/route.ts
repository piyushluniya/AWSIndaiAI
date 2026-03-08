import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"

async function callGemini(params: {
  prompt?: string
  systemPrompt?: string
  conversationHistory?: Array<{ role: string; content: string }>
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  const { prompt, systemPrompt, conversationHistory = [], maxTokens = 1024, temperature = 0.3 } = params
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured")

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = []
  for (const msg of conversationHistory) {
    contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] })
  }
  if (prompt) contents.push({ role: "user", parts: [{ text: prompt }] })

  const body: Record<string, unknown> = { contents, generationConfig: { maxOutputTokens: maxTokens, temperature } }
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] }

  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${JSON.stringify(data)}`)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Empty response from Gemini")
  return text
}

export async function POST(request: NextRequest) {
  try {
    const { question, policyContext, cardContext, conversationHistory } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 })
    }

    const systemPrompt = `You are BimaSetu AI, an expert insurance assistant helping Indian users understand their insurance coverage.

Your role:
- Help users understand exactly what their policies and credit cards cover
- Answer questions about claims, coverage limits, exclusions, and processes
- Use simple, clear language that any Indian user can understand
- Naturally mix in Hindi terms where helpful (e.g., "premi" for premium, "daawa" for claim, "bima" for insurance)
- Always cite specific clause numbers or policy sections when available
- Be empathetic — insurance queries often arise during stressful situations

IMPORTANT RULES:
1. Never give medical advice — always recommend consulting a doctor
2. For claim amounts, provide the calculated amount based on policy terms
3. If information is not in the provided context, clearly say so
4. Always mention if the coverage requires pre-authorization (cashless) vs reimbursement
5. Highlight any time-sensitive actions the user needs to take

USER'S INSURANCE CONTEXT:
${policyContext ? `--- HEALTH/INSURANCE POLICY ---\n${policyContext}` : "No insurance policy uploaded yet."}

${cardContext ? `--- CREDIT CARD INSURANCE BENEFITS ---\n${cardContext}` : "No credit cards added yet."}`

    let confidence: "high" | "medium" | "low" = "medium"
    if (policyContext && policyContext.length > 100) confidence = "high"
    else if (!policyContext && !cardContext) confidence = "low"

    const answer = await callGemini({ systemPrompt, conversationHistory, prompt: question, maxTokens: 1024, temperature: 0.3 })

    return NextResponse.json({
      answer,
      confidence,
      disclaimer: confidence === "low"
        ? "This answer is based on general knowledge. Upload your policy documents for personalized answers."
        : undefined
    })
  } catch (error) {
    console.error("Coverage QA error:", error)
    return NextResponse.json(
      { error: "Coverage Q&A failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
