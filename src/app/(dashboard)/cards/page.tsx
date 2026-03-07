"use client"

import { useState, useEffect } from "react"
import { generateClient } from "aws-amplify/data"
import { getCurrentUser } from "aws-amplify/auth"
import type { Schema } from "../../../../amplify/data/resource"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import HiddenCoverageCard from "@/components/dashboard/HiddenCoverageCard"
import { Search, Loader2, CreditCard, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const client = generateClient<Schema>()

const POPULAR_CARDS = [
  "HDFC Regalia", "HDFC Infinia", "HDFC Diners Black",
  "SBI Elite", "ICICI Sapphiro", "Axis Magnus",
  "Amex Platinum", "IndusInd Pinnacle"
]

export default function CardsPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [savedCards, setSavedCards] = useState<Schema["UserCard"]["type"][]>([])
  const [selectedCard, setSelectedCard] = useState<Schema["UserCard"]["type"] | null>(null)

  useEffect(() => {
    loadSavedCards()
  }, [])

  async function loadSavedCards() {
    const res = await client.models.UserCard.list()
    setSavedCards(res.data)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/card-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName: query })
      })
      if (!response.ok) throw new Error("Discovery failed")
      const data = await response.json()
      setResult(data)
    } catch {
      toast({ title: "Card discovery failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveCard() {
    if (!result) return
    try {
      const user = await getCurrentUser()
      const coverage = result as { cardName: string; bankName: string; cardType: string; totalHiddenValue: number }
      await client.models.UserCard.create({
        userId: user.userId,
        cardName: coverage.cardName,
        bankName: coverage.bankName,
        cardType: coverage.cardType,
        coverageData: JSON.stringify(result),
        hiddenValue: coverage.totalHiddenValue
      })
      toast({ title: "Card saved!", description: `${coverage.cardName} added to your portfolio.` })
      setResult(null)
      setQuery("")
      loadSavedCards()
    } catch {
      toast({ title: "Failed to save card", variant: "destructive" })
    }
  }

  async function handleDeleteCard(id: string) {
    await client.models.UserCard.delete({ id })
    setSavedCards((prev) => prev.filter((c) => c.id !== id))
    if (selectedCard?.id === id) setSelectedCard(null)
    toast({ title: "Card removed" })
  }

  const totalHiddenValue = savedCards.reduce((sum, c) => sum + (c.hiddenValue || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Card Discovery</h1>
        <p className="text-gray-500 mt-1">Find hidden insurance worth lakhs in your credit cards</p>
      </div>

      {/* Search */}
      <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Discover Hidden Coverage</CardTitle>
          <CardDescription>Enter your credit card name to reveal its insurance benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="e.g. HDFC Regalia, Axis Magnus, Amex Platinum..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Discover"}
            </Button>
          </form>

          {/* Popular cards */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-gray-500 self-center">Try:</span>
            {POPULAR_CARDS.map((card) => (
              <button
                key={card}
                onClick={() => setQuery(card)}
                className="text-xs px-3 py-1 rounded-full border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {card}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discovery Result */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Analyzing card benefits with AI...</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Coverage Found!</h2>
            <Button
              onClick={handleSaveCard}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save to My Cards
            </Button>
          </div>
          <HiddenCoverageCard data={result as unknown as Parameters<typeof HiddenCoverageCard>[0]["data"]} />
        </div>
      )}

      {/* Saved Cards Portfolio */}
      {savedCards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Card Portfolio</h2>
              <p className="text-sm text-gray-500">
                Total hidden coverage: <span className="font-semibold text-blue-600">₹{totalHiddenValue.toLocaleString("en-IN")}L</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCards.map((card) => {
              const coverage = card.coverageData ? JSON.parse(card.coverageData) : null
              return (
                <Card
                  key={card.id}
                  className={`cursor-pointer transition-all ${selectedCard?.id === card.id ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}
                  onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{card.cardName}</p>
                          <p className="text-xs text-gray-500">{coverage?.bankName || card.bankName}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id) }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Hidden value</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        ₹{(card.hiddenValue || 0).toLocaleString("en-IN")}L
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Expanded view of selected card */}
          {selectedCard && selectedCard.coverageData && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedCard.cardName} — Full Details
              </h3>
              <HiddenCoverageCard
                data={JSON.parse(selectedCard.coverageData) as Parameters<typeof HiddenCoverageCard>[0]["data"]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
