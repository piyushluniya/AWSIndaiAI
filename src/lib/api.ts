import { post } from "aws-amplify/api"

// Card Discovery Lambda
export async function discoverCard(cardName: string) {
  const response = await fetch("/api/card-discovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardName })
  })
  if (!response.ok) throw new Error("Card discovery failed")
  return response.json()
}

// Policy Parser Lambda
export async function parsePolicy(s3Key: string, userId: string) {
  const response = await fetch("/api/policy-parser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ s3Key, userId })
  })
  if (!response.ok) throw new Error("Policy parsing failed")
  return response.json()
}

// Coverage Q&A Lambda
export async function askCoverageQuestion(params: {
  question: string
  policyContext: string
  cardContext: string
  conversationHistory?: Array<{ role: string; content: string }>
}) {
  const response = await fetch("/api/coverage-qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  })
  if (!response.ok) throw new Error("Coverage Q&A failed")
  return response.json()
}
