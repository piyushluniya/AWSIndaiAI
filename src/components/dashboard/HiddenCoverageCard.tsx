import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plane, User, Globe, ShoppingBag, CreditCard, Heart, AlertCircle, Lightbulb
} from "lucide-react"

interface CoverageDetail {
  amount: number
  description: string
  conditions?: string[]
}

interface HiddenCoverageData {
  cardName: string
  bankName: string
  cardType: string
  airAccident: CoverageDetail
  personalAccident: CoverageDetail
  travelInsurance: CoverageDetail
  purchaseProtection: CoverageDetail
  lostCardLiability: { amount: number; description: string }
  emergencyMedical: { amount: number; description: string }
  totalHiddenValue: number
  keyAlerts: string[]
  usageTips?: string[]
}

interface Props {
  data: HiddenCoverageData
}

const coverageSections = [
  { key: "airAccident", icon: Plane, label: "Air Accident Cover", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "personalAccident", icon: User, label: "Personal Accident", color: "text-green-600", bg: "bg-green-50" },
  { key: "travelInsurance", icon: Globe, label: "Travel Insurance", color: "text-purple-600", bg: "bg-purple-50" },
  { key: "purchaseProtection", icon: ShoppingBag, label: "Purchase Protection", color: "text-orange-600", bg: "bg-orange-50" },
  { key: "lostCardLiability", icon: CreditCard, label: "Lost Card Liability", color: "text-red-600", bg: "bg-red-50" },
  { key: "emergencyMedical", icon: Heart, label: "Emergency Medical", color: "text-rose-600", bg: "bg-rose-50" }
]

export default function HiddenCoverageCard({ data }: Props) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Card Header — looks like a credit card */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                {data.bankName}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{data.cardName}</h2>
              <p className="text-xs text-gray-400 mt-1">{data.cardType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Hidden Value</p>
              <p className="text-2xl font-bold text-yellow-400">
                ₹{data.totalHiddenValue.toLocaleString("en-IN")}L
              </p>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {coverageSections.map(({ key, label }) => {
              const coverage = data[key as keyof HiddenCoverageData] as CoverageDetail
              if (!coverage?.amount) return null
              return (
                <Badge key={key} className="text-xs bg-white/10 text-white border-white/20 hover:bg-white/20">
                  {label}: ₹{coverage.amount}L
                </Badge>
              )
            })}
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Coverage Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {coverageSections.map(({ key, icon: Icon, label, color, bg }) => {
            const coverage = data[key as keyof HiddenCoverageData] as CoverageDetail
            if (!coverage) return null
            return (
              <div key={key} className={`rounded-lg p-3 ${bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
                <p className={`text-lg font-bold ${color}`}>
                  ₹{coverage.amount?.toLocaleString("en-IN") || "0"}L
                </p>
                {coverage.description && (
                  <p className="text-xs text-gray-600 mt-0.5">{coverage.description}</p>
                )}
                {coverage.conditions && coverage.conditions.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {coverage.conditions.slice(0, 2).map((cond, i) => (
                      <li key={i} className="text-xs text-gray-500 flex gap-1">
                        <span className="shrink-0">•</span>
                        {cond}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Key Alerts */}
        {data.keyAlerts && data.keyAlerts.length > 0 && (
          <>
            <Separator className="mb-4" />
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="font-medium text-gray-900 text-sm">Key Alerts</h4>
              </div>
              <ul className="space-y-1">
                {data.keyAlerts.map((alert, i) => (
                  <li key={i} className="text-sm text-amber-800 bg-amber-50 rounded px-3 py-1.5 flex gap-2">
                    <span className="shrink-0 font-medium">{i + 1}.</span>
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Usage Tips */}
        {data.usageTips && data.usageTips.length > 0 && (
          <>
            <Separator className="mb-4" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900 text-sm">Pro Tips</h4>
              </div>
              <ul className="space-y-1">
                {data.usageTips.map((tip, i) => (
                  <li key={i} className="text-sm text-blue-800 bg-blue-50 rounded px-3 py-1.5 flex gap-2">
                    <span className="shrink-0">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
