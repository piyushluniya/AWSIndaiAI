"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../../../amplify/data/resource"
import { Button } from "@/components/ui/button"
import { MessageSquare, X, Minimize2 } from "lucide-react"
import ChatInterface from "./ChatInterface"

const client = generateClient<Schema>()

export default function FloatingChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [policyContext, setPolicyContext] = useState("")
  const [cardContext, setCardContext] = useState("")
  const [contextLoaded, setContextLoaded] = useState(false)
  const loadedRef = useRef(false)

  // Hide on the full chat page
  if (pathname === "/chat") return null

  async function loadContext() {
    if (loadedRef.current) return
    loadedRef.current = true

    try {
      const [policiesRes, cardsRes] = await Promise.all([
        client.models.UserPolicy.list(),
        client.models.UserCard.list()
      ])

      const readyPolicies = policiesRes.data.filter((p) => p.status === "ready" && p.parsedCoverage)
      if (readyPolicies.length > 0) {
        const parsed = JSON.parse(readyPolicies[0].parsedCoverage!)
        setPolicyContext(
          `Insurer: ${parsed.insurer}, Type: ${parsed.policyType}, Sum Insured: ₹${parsed.sumInsured}L, ` +
          `Exclusions: ${parsed.exclusions?.slice(0, 3).join(", ") || "N/A"}`
        )
      }

      if (cardsRes.data.length > 0) {
        const cardSummaries = cardsRes.data.map((c) => {
          try {
            const cov = JSON.parse(c.coverageData || "{}")
            return `${c.cardName} (₹${c.hiddenValue || 0}L coverage)`
          } catch {
            return c.cardName
          }
        })
        setCardContext(cardSummaries.join(", "))
      }
    } catch {
      // Context not critical
    } finally {
      setContextLoaded(true)
    }
  }

  function handleOpen() {
    setIsOpen(true)
    loadContext()
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          aria-label="Open BimaSalah chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium">BimaSalah</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold text-sm">BimaSalah</span>
              {!contextLoaded && (
                <span className="text-xs text-blue-200">Loading context...</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              policyContext={policyContext}
              cardContext={cardContext}
            />
          </div>
        </div>
      )}
    </>
  )
}
