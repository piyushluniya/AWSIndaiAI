"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../../../../amplify/data/resource"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard, FileText, MessageSquare, ShieldCheck,
  ArrowRight, Bell, AlertCircle, Calendar, CheckCircle2
} from "lucide-react"

const client = generateClient<Schema>()

type ParsedCoverage = {
  insurer: string
  policyType: string
  sumInsured: number
  policyPeriod?: { from: string; to: string }
  waitingPeriods?: Array<{ condition: string; period: string }>
  exclusions?: string[]
  roomRentLimit?: number
  coPay?: number
}

// Circular progress SVG component
function CircularProgress({ percent, size = 80 }: { percent: number; size?: number }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - percent / 100)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={percent === 100 ? "#16a34a" : "#2563eb"}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  )
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("there")
  const [profileComplete, setProfileComplete] = useState(false)
  const [waConnected, setWaConnected] = useState(false)
  const [cards, setCards] = useState<Schema["UserCard"]["type"][]>([])
  const [policies, setPolicies] = useState<Schema["UserPolicy"]["type"][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, cardsRes, policiesRes] = await Promise.all([
          client.models.UserProfile.list(),
          client.models.UserCard.list(),
          client.models.UserPolicy.list()
        ])

        if (profileRes.data.length > 0) {
          const p = profileRes.data[0]
          setUserName(p.name || "there")
          setProfileComplete(!!(p.name && p.age && p.city))
          setWaConnected(p.whatsappConnected || false)
        }

        setCards(cardsRes.data)
        setPolicies(policiesRes.data)
      } catch {
        // User not onboarded yet
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalCardCoverage = cards.reduce((sum, c) => sum + (c.hiddenValue || 0), 0)
  const readyPolicies = policies.filter((p) => p.status === "ready")

  // Parse coverage from first ready policy
  let parsedCoverage: ParsedCoverage | null = null
  if (readyPolicies.length > 0 && readyPolicies[0].parsedCoverage) {
    try { parsedCoverage = JSON.parse(readyPolicies[0].parsedCoverage) } catch {}
  }

  // Alerts from waiting periods & policy expiry
  const alerts: Array<{ type: "warning" | "info"; message: string }> = []
  if (parsedCoverage?.waitingPeriods && parsedCoverage.waitingPeriods.length > 0) {
    parsedCoverage.waitingPeriods.slice(0, 2).forEach((wp) => {
      alerts.push({ type: "info", message: `Waiting period: ${wp.condition} — ${wp.period}` })
    })
  }
  if (parsedCoverage?.policyPeriod?.to && parsedCoverage.policyPeriod.to !== "Not specified") {
    alerts.push({ type: "warning", message: `Policy expires: ${parsedCoverage.policyPeriod.to}` })
  }
  if (alerts.length === 0 && readyPolicies.length > 0) {
    alerts.push({ type: "info", message: "No urgent alerts — your coverage looks active" })
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {userName}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your insurance intelligence summary.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Hidden Card Coverage</span>
              <CreditCard className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-3xl font-bold">
              {totalCardCoverage > 0 ? `₹${totalCardCoverage.toLocaleString("en-IN")} L` : "₹0"}
            </div>
            <p className="text-blue-100 text-xs mt-1">
              {cards.length} card{cards.length !== 1 ? "s" : ""} added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Insurance Policies</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{policies.length}</div>
            <p className="text-gray-500 text-xs mt-1">
              {readyPolicies.length} parsed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">Profile Completeness</span>
            </div>
            {(() => {
              const steps = [
                { label: "Profile info", done: profileComplete },
                { label: "Card added", done: cards.length > 0 },
                { label: "Policy parsed", done: policies.some((p) => p.status === "ready") },
                { label: "WhatsApp linked", done: waConnected }
              ]
              const doneCount = steps.filter((s) => s.done).length
              const pct = doneCount * 25
              return (
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <CircularProgress percent={pct} size={72} />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                      {pct}%
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    {steps.map((s) => (
                      <div key={s.label} className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${s.done ? "text-green-500" : "text-gray-200"}`} />
                        <span className={s.done ? "text-gray-700" : "text-gray-400"}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* 5-card section grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

        {/* Card 1: Insurance Policy Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Insurance Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedCoverage ? (
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-900 text-base">{parsedCoverage.insurer}</p>
                  <Badge variant="secondary" className="text-xs mt-0.5">{parsedCoverage.policyType}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-700">₹{parsedCoverage.sumInsured}L</p>
                    <p className="text-xs text-green-600">Sum Insured</p>
                  </div>
                  {parsedCoverage.roomRentLimit !== undefined && parsedCoverage.roomRentLimit > 0 ? (
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-blue-700">₹{parsedCoverage.roomRentLimit.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-blue-600">Room Rent/day</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-blue-700">{parsedCoverage.coPay || 0}%</p>
                      <p className="text-xs text-blue-600">Co-pay</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" asChild>
                  <Link href="/policies">View Policy Details</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <ShieldCheck className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No policy parsed yet</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs" asChild>
                  <Link href="/policies">Upload Policy</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Hidden Card Insurance */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <CreditCard className="w-4 h-4 text-blue-500" /> Card Insurance Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cards.length > 0 ? (
              <div className="space-y-2">
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-blue-700">₹{totalCardCoverage.toLocaleString("en-IN")}L</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total hidden coverage</p>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {cards.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 truncate flex-1">{c.cardName}</span>
                      <span className="text-blue-600 font-semibold ml-2">₹{(c.hiddenValue || 0)}L</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <Link href="/cards">Manage Cards</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No cards added yet</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs" asChild>
                  <Link href="/cards">Add a Card</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Alerts & Reminders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Bell className="w-4 h-4 text-amber-500" /> Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                      alert.type === "warning"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {alert.type === "warning" ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Upload a policy to get alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Quick Actions */}
        <Card className="border-0 shadow-sm md:col-span-2 xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { href: "/cards", icon: CreditCard, label: "Discover card insurance", sub: "Find hidden benefits", color: "blue" },
                { href: "/policies", icon: FileText, label: "Upload a policy", sub: "AI-powered parsing", color: "green" },
                { href: "/chat", icon: MessageSquare, label: "Ask about my coverage", sub: "Coverage Q&A", color: "purple" },
                { href: "/claims", icon: AlertCircle, label: "Analyze a claim rejection", sub: "IRDAI-backed analysis", color: "amber" }
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-${action.color}-200 hover:bg-${action.color}-50 transition-colors cursor-pointer group`}>
                    <div className={`w-8 h-8 rounded-lg bg-${action.color}-50 group-hover:bg-${action.color}-100 flex items-center justify-center shrink-0 transition-colors`}>
                      <action.icon className={`w-4 h-4 text-${action.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.sub}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {cards.length === 0 && policies.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start discovering your coverage
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Add your credit cards to find hidden insurance, or upload a policy PDF to get AI-parsed insights.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <Link href="/cards">Add a Card</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/policies">Upload Policy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
