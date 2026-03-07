import { findCard, type CardBenefits } from "./cardKnowledgeBase"
import { callGemini, testGeminiConnection } from "../shared/gemini"

// Run once at cold start to verify Gemini connectivity
let startupTestDone = false
async function ensureStartupTest() {
  if (!startupTestDone) {
    startupTestDone = true
    await testGeminiConnection("cardDiscovery")
  }
}

interface CardDiscoveryEvent {
  cardName: string
}

interface HiddenCoverageOutput {
  cardName: string
  bankName: string
  cardType: string
  airAccident: { amount: number; description: string; conditions: string[] }
  personalAccident: { amount: number; description: string; conditions: string[] }
  travelInsurance: { amount: number; description: string; conditions: string[] }
  purchaseProtection: { amount: number; description: string; conditions: string[] }
  lostCardLiability: { amount: number; description: string }
  emergencyMedical: { amount: number; description: string }
  totalHiddenValue: number
  keyAlerts: string[]
  usageTips: string[]
}

export const handler = async (event: CardDiscoveryEvent): Promise<HiddenCoverageOutput> => {
  console.log("[cardDiscovery] Handler invoked with event:", JSON.stringify(event))

  await ensureStartupTest()

  const { cardName } = event
  if (!cardName) {
    console.error("[cardDiscovery] Missing cardName in event")
    throw new Error("cardName is required")
  }

  // Look up known card data
  const knownData: CardBenefits | null = findCard(cardName)
  console.log(`[cardDiscovery] Card lookup for "${cardName}": ${knownData ? "FOUND in knowledge base" : "NOT FOUND, using AI estimation"}`)

  const prompt = knownData
    ? `You are an expert Indian insurance analyst. Based on the following known benefits data for the ${knownData.cardName}, generate a detailed Hidden Coverage Card JSON.

Known data:
- Air Accident Cover: ₹${knownData.airAccident} lakhs
- Personal Accident: ₹${knownData.personalAccident} lakhs
- Travel Insurance: ₹${knownData.travelInsurance} lakhs
- Purchase Protection: ₹${knownData.purchaseProtection} lakhs
- Lost Card Liability: ₹${knownData.lostCardLiability} lakhs
- Emergency Medical: ₹${knownData.emergencyMedical} lakhs
- Total Hidden Value: ₹${knownData.totalHiddenValue} lakhs
- Key Alerts: ${knownData.keyAlerts.join(", ")}

Generate a JSON response with this exact structure:
{
  "cardName": "${knownData.cardName}",
  "bankName": "${knownData.bankName}",
  "cardType": "${knownData.cardType}",
  "airAccident": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition 1>", "<condition 2>"]
  },
  "personalAccident": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "travelInsurance": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "purchaseProtection": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "lostCardLiability": {
    "amount": <number in lakhs>,
    "description": "<brief description>"
  },
  "emergencyMedical": {
    "amount": <number in lakhs>,
    "description": "<brief description>"
  },
  "totalHiddenValue": <total in lakhs>,
  "keyAlerts": ["<alert 1>", "<alert 2>", "<alert 3>"],
  "usageTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY the JSON, no markdown, no explanation.`
    : `You are an expert Indian insurance analyst. The user is asking about the "${cardName}" credit card.

Based on your knowledge of Indian credit cards and their typical insurance benefits, generate a Hidden Coverage Card JSON for this card.

If you don't know the specific card, generate reasonable estimates based on similar cards in the same tier.

Generate a JSON response with this exact structure:
{
  "cardName": "<card name>",
  "bankName": "<bank name>",
  "cardType": "<card type>",
  "airAccident": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition 1>", "<condition 2>"]
  },
  "personalAccident": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "travelInsurance": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "purchaseProtection": {
    "amount": <number in lakhs>,
    "description": "<brief description>",
    "conditions": ["<condition>"]
  },
  "lostCardLiability": {
    "amount": <number in lakhs>,
    "description": "<brief description>"
  },
  "emergencyMedical": {
    "amount": <number in lakhs>,
    "description": "<brief description>"
  },
  "totalHiddenValue": <total in lakhs>,
  "keyAlerts": ["<alert 1>", "<alert 2>"],
  "usageTips": ["<tip 1>", "<tip 2>"]
}

Return ONLY the JSON, no markdown, no explanation.`

  console.log("[cardDiscovery] Calling Gemini for card coverage data...")
  const content = await callGemini({ prompt, maxTokens: 1024, temperature: 0.3 })

  console.log("[cardDiscovery] Raw Gemini response (first 200 chars):", content.substring(0, 200))

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error("[cardDiscovery] Failed to extract JSON from Gemini response:", content)
    throw new Error("Failed to extract JSON from Gemini response")
  }

  let parsed: HiddenCoverageOutput
  try {
    parsed = JSON.parse(jsonMatch[0]) as HiddenCoverageOutput
  } catch (err) {
    console.error("[cardDiscovery] JSON parse error:", err, "| Raw JSON:", jsonMatch[0])
    throw new Error("Failed to parse JSON from Gemini response")
  }

  console.log(`[cardDiscovery] Successfully parsed coverage for card: ${parsed.cardName} | totalHiddenValue: ₹${parsed.totalHiddenValue} lakhs`)
  return parsed
}
