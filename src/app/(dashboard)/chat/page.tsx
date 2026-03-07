"use client"

import { useEffect, useState } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../../../../amplify/data/resource"
import ChatInterface from "@/components/chat/ChatInterface"
import { Badge } from "@/components/ui/badge"
import { FileText, CreditCard } from "lucide-react"

const client = generateClient<Schema>()

export default function ChatPage() {
  const [policyContext, setPolicyContext] = useState("")
  const [cardContext, setCardContext] = useState("")
  const [contextLoaded, setContextLoaded] = useState(false)
  const [policyCount, setPolicyCount] = useState(0)
  const [cardCount, setCardCount] = useState(0)

  useEffect(() => {
    async function loadContext() {
      try {
        const [policiesRes, cardsRes] = await Promise.all([
          client.models.UserPolicy.list(),
          client.models.UserCard.list()
        ])

        // Build policy context
        const readyPolicies = policiesRes.data.filter((p) => p.status === "ready" && p.parsedCoverage)
        setPolicyCount(readyPolicies.length)

        if (readyPolicies.length > 0) {
          const policyContextStr = readyPolicies
            .slice(0, 3)
            .map((p) => {
              const parsed = JSON.parse(p.parsedCoverage || "{}")
              return `POLICY: ${p.fileName} (${p.insurer})
Sum Insured: ₹${parsed.sumInsured}L
Covered: ${parsed.coveredProcedures?.slice(0, 5).map((c: { name: string }) => c.name).join(", ")}
Exclusions: ${parsed.exclusions?.slice(0, 5).join(", ")}
Waiting Periods: ${parsed.waitingPeriods?.map((w: { condition: string; period: string }) => `${w.condition}: ${w.period}`).join(", ")}`
            })
            .join("\n\n")
          setPolicyContext(policyContextStr)
        }

        // Build card context
        setCardCount(cardsRes.data.length)

        if (cardsRes.data.length > 0) {
          const cardContextStr = cardsRes.data
            .slice(0, 5)
            .map((c) => {
              const coverage = c.coverageData ? JSON.parse(c.coverageData) : {}
              return `CARD: ${c.cardName} (${coverage.bankName})
Air Accident: ₹${coverage.airAccident?.amount}L
Personal Accident: ₹${coverage.personalAccident?.amount}L
Travel Insurance: ₹${coverage.travelInsurance?.amount}L
Emergency Medical: ₹${coverage.emergencyMedical?.amount}L
Total Hidden: ₹${c.hiddenValue}L`
            })
            .join("\n\n")
          setCardContext(cardContextStr)
        }
      } catch {
        // Context not available
      } finally {
        setContextLoaded(true)
      }
    }

    loadContext()
  }, [])

  if (!contextLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">BimaSalah</h1>
            <p className="text-sm text-gray-500">AI-powered insurance Q&A</p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${policyCount > 0 ? "border-green-200 bg-green-50 text-green-700" : "text-gray-400"}`}
            >
              <FileText className="w-3 h-3 mr-1" />
              {policyCount} {policyCount === 1 ? "policy" : "policies"}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${cardCount > 0 ? "border-blue-200 bg-blue-50 text-blue-700" : "text-gray-400"}`}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {cardCount} {cardCount === 1 ? "card" : "cards"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <ChatInterface policyContext={policyContext} cardContext={cardContext} />
      </div>
    </div>
  )
}
