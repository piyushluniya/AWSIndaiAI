"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, Shield, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  confidence?: "high" | "medium" | "low"
  disclaimer?: string
  timestamp: Date
}

interface Props {
  policyContext: string
  cardContext: string
}

const SUGGESTED_QUESTIONS = [
  "Is knee replacement surgery covered?",
  "What is my ICU room rent limit?",
  "How do I file a cashless claim?",
  "What are the documents needed for a claim?",
  "Is my card's air accident cover active?",
  "What is the waiting period for heart surgery?"
]

export default function ChatInterface({ policyContext, cardContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Namaste! Main BimaSetu AI hoon. I can answer questions about your insurance coverage.

${policyContext ? "I can see your uploaded policy. " : "You haven't uploaded a policy yet — upload one for personalized answers. "}${cardContext ? "Your credit card benefits are also available." : ""}

What would you like to know about your coverage?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(question?: string) {
    const text = question || input.trim()
    if (!text || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const recentMessages = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      // Bedrock requires conversation to start with a user message — drop any leading assistant messages
      const firstUserIdx = recentMessages.findIndex((m) => m.role === "user")
      const history = firstUserIdx >= 0 ? recentMessages.slice(firstUserIdx) : []

      const response = await fetch("/api/coverage-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          policyContext,
          cardContext,
          conversationHistory: history
        })
      })

      if (!response.ok) throw new Error("Chat failed")
      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        confidence: data.confidence,
        disclaimer: data.disclaimer,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm sorry, I couldn't process your question. Please try again in a moment.",
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function getConfidenceColor(confidence?: "high" | "medium" | "low") {
    if (confidence === "high") return "bg-green-100 text-green-700 border-green-200"
    if (confidence === "medium") return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-gray-100 text-gray-600 border-gray-200"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "")}
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback
                className={
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              >
                {message.role === "assistant" ? <Shield className="w-4 h-4" /> : "U"}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn("max-w-[80%] space-y-1", message.role === "user" ? "items-end" : "")}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "assistant" && message.confidence && (
                <Badge className={`${getConfidenceColor(message.confidence)} text-xs`}>
                  {message.confidence === "high" ? "High confidence" :
                   message.confidence === "medium" ? "Medium confidence" : "General answer"}
                </Badge>
              )}

              {message.disclaimer && (
                <div className="flex gap-1.5 items-start bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {message.disclaimer}
                </div>
              )}

              <p className="text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <Shield className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your coverage..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
