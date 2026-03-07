import { callGemini, testGeminiConnection } from "../shared/gemini"

// Run once at cold start to verify Gemini connectivity
let startupTestDone = false
async function ensureStartupTest() {
  if (!startupTestDone) {
    startupTestDone = true
    await testGeminiConnection("coverageQA")
  }
}

interface CoverageQAEvent {
  question: string
  policyContext: string
  cardContext: string
  conversationHistory?: Array<{ role: string; content: string }>
}

interface CoverageQAResponse {
  answer: string
  confidence: "high" | "medium" | "low"
  disclaimer?: string
}

export const handler = async (event: CoverageQAEvent): Promise<CoverageQAResponse> => {
  console.log("[coverageQA] Handler invoked")
  console.log(`[coverageQA] Question: "${event.question?.substring(0, 100)}"`)
  console.log(`[coverageQA] policyContext length: ${event.policyContext?.length ?? 0}`)
  console.log(`[coverageQA] cardContext length: ${event.cardContext?.length ?? 0}`)
  console.log(`[coverageQA] conversationHistory entries: ${event.conversationHistory?.length ?? 0}`)

  await ensureStartupTest()

  const { question, policyContext, cardContext, conversationHistory = [] } = event

  if (!question) {
    console.error("[coverageQA] Missing question in event")
    throw new Error("question is required")
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

  // Determine confidence based on context availability
  let confidence: "high" | "medium" | "low" = "medium"
  if (policyContext && policyContext.length > 100) {
    confidence = "high"
  } else if (!policyContext && !cardContext) {
    confidence = "low"
  }
  console.log(`[coverageQA] Determined confidence: ${confidence}`)

  console.log("[coverageQA] Calling Gemini for QA response...")
  const answerText = await callGemini({
    systemPrompt,
    conversationHistory,
    prompt: question,
    maxTokens: 1024,
    temperature: 0.3
  })

  console.log(`[coverageQA] Answer generated (length: ${answerText.length} chars)`)

  return {
    answer: answerText,
    confidence,
    disclaimer:
      confidence === "low"
        ? "This answer is based on general knowledge. Upload your policy documents for personalized answers."
        : undefined
  }
}
