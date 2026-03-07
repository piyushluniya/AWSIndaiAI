"use client"

import { useState, useEffect } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../../../../amplify/data/resource"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle, CheckCircle2, XCircle, Loader2, FileText,
  Download, Scale, BookOpen, ListChecks, ArrowRight, ChevronDown, ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"

const client = generateClient<Schema>()

const CLAIM_TYPES = [
  "Health / Hospitalization",
  "Pre-authorization / Cashless Denial",
  "Maternity",
  "Critical Illness",
  "Accidental Hospitalization",
  "Pre-existing Disease",
  "Domiciliary Treatment",
  "Day-care Procedure",
  "Reimbursement",
  "Life Insurance Death Claim",
  "Motor Insurance",
  "Travel Insurance",
  "Other"
]

interface ClaimResult {
  verdict: "contestable" | "valid"
  confidence: "high" | "medium" | "low"
  summary: string
  reasoning: string
  keyArguments: string[]
  irdaiReferences: Array<{ regulation: string; description: string }>
  nextSteps: string[]
  grievanceLetter: string
}

export default function ClaimsPage() {
  const [policies, setPolicies] = useState<Schema["UserPolicy"]["type"][]>([])
  const [selectedPolicyId, setSelectedPolicyId] = useState("")
  const [claimType, setClaimType] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [showLetter, setShowLetter] = useState(false)

  useEffect(() => {
    client.models.UserPolicy.list().then((res) => {
      const ready = res.data.filter((p) => p.status === "ready")
      setPolicies(ready)
    }).catch(() => {})
  }, [])

  function getPolicyContext(): string {
    if (!selectedPolicyId) return ""
    const policy = policies.find((p) => p.id === selectedPolicyId)
    if (!policy?.parsedCoverage) return ""
    try {
      const parsed = JSON.parse(policy.parsedCoverage)
      return `Insurer: ${parsed.insurer}
Policy Type: ${parsed.policyType}
Sum Insured: ₹${parsed.sumInsured} Lakhs
Exclusions: ${parsed.exclusions?.join(", ") || "None listed"}
Waiting Periods: ${parsed.waitingPeriods?.map((w: { condition: string; period: string }) => `${w.condition} - ${w.period}`).join(", ") || "None"}
Co-pay: ${parsed.coPay || 0}%
Key Highlights: ${parsed.keyHighlights?.join("; ") || "N/A"}`
    } catch {
      return ""
    }
  }

  async function handleAnalyze() {
    if (!claimType || !rejectionReason.trim()) return
    setLoading(true)
    setResult(null)
    setShowLetter(false)

    try {
      const response = await fetch("/api/claim-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimType,
          rejectionReason: rejectionReason.trim(),
          policyContext: getPolicyContext()
        })
      })

      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      setResult(data)
    } catch {
      setResult(null)
      alert("Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function downloadLetter() {
    if (!result?.grievanceLetter) return
    const blob = new Blob([result.grievanceLetter], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "grievance-letter.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const confidenceColor = {
    high: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-gray-100 text-gray-600 border-gray-200"
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Claim Center</h1>
        <p className="text-gray-500 mt-1">
          AI-powered claim rejection analysis with IRDAI regulation references
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Claim Details</CardTitle>
              <CardDescription>Tell us about your rejected claim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Policy selector */}
              <div className="space-y-1.5">
                <Label>Policy (optional)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                >
                  <option value="">No policy selected (general analysis)</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.insurer || p.fileName}
                    </option>
                  ))}
                </select>
                {policies.length === 0 && (
                  <p className="text-xs text-gray-400">
                    Upload and parse a policy for more accurate analysis
                  </p>
                )}
              </div>

              {/* Claim type */}
              <div className="space-y-1.5">
                <Label>Claim Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                >
                  <option value="">Select claim type</option>
                  {CLAIM_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Rejection reason */}
              <div className="space-y-1.5">
                <Label>Rejection Reason</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Paste the rejection reason from your insurer's letter or describe what they told you..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                onClick={handleAnalyze}
                disabled={!claimType || !rejectionReason.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4 mr-2" />
                    Analyze Claim
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="border-0 bg-blue-50 shadow-none">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">About this tool</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Our AI analyzes your claim rejection against IRDAI regulations and your policy terms.
                    This is informational guidance — consult a licensed advisor for legal decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertCircle className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium">Analysis will appear here</p>
              <p className="text-xs mt-1">Fill in the form and click Analyze</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
              <Loader2 className="w-10 h-10 mb-3 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600">Analyzing your claim...</p>
              <p className="text-xs text-gray-400 mt-1">Checking IRDAI regulations</p>
            </div>
          )}

          {result && (
            <>
              {/* Verdict */}
              <Card className={cn(
                "border-0 shadow-sm",
                result.verdict === "contestable" ? "bg-green-50" : "bg-red-50"
              )}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    {result.verdict === "contestable" ? (
                      <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-base font-bold",
                          result.verdict === "contestable" ? "text-green-800" : "text-red-800"
                        )}>
                          {result.verdict === "contestable" ? "Rejection is Contestable" : "Rejection Appears Valid"}
                        </span>
                        <Badge className={confidenceColor[result.confidence]}>
                          {result.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 leading-relaxed text-gray-700">{result.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Arguments */}
              {result.keyArguments?.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-blue-600" />
                      Key Arguments in Your Favour
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.keyArguments.map((arg, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* IRDAI References */}
              {result.irdaiReferences?.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      IRDAI Regulation References
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.irdaiReferences.map((ref, i) => (
                        <div key={i} className="bg-indigo-50 rounded-lg px-3 py-2.5">
                          <p className="text-xs font-semibold text-indigo-800">{ref.regulation}</p>
                          <p className="text-xs text-indigo-600 mt-1">{ref.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              {result.nextSteps?.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      Recommended Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Grievance Letter */}
              {result.grievanceLetter && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        Grievance Letter
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setShowLetter((v) => !v)}
                        >
                          {showLetter ? (
                            <><ChevronUp className="w-3 h-3 mr-1" />Hide</>
                          ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" />Preview</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={downloadLetter}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {showLetter && (
                    <CardContent>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                        {result.grievanceLetter}
                      </pre>
                    </CardContent>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
