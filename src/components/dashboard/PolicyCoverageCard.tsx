import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Clock, Building2, Shield } from "lucide-react"

interface CoveredProcedure {
  name: string
  limit: number
  notes: string
}

interface WaitingPeriod {
  condition: string
  period: string
}

interface ParsedPolicy {
  insurer: string
  policyNumber: string
  policyType: string
  sumInsured: number
  deductible: number
  premium: number
  policyPeriod: { from: string; to: string }
  coveredProcedures: CoveredProcedure[]
  exclusions: string[]
  waitingPeriods: WaitingPeriod[]
  roomRentLimit: number
  coPay: number
  networkHospitalCount: number
  riders: string[]
  keyHighlights: string[]
}

interface Props {
  data: ParsedPolicy
  fileName: string
}

export default function PolicyCoverageCard({ data, fileName }: Props) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 rounded-full w-96 h-96 -top-20 -right-20" />
        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-green-100 uppercase tracking-widest font-medium">
                {data.insurer}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{data.policyType || fileName}</h2>
              <p className="text-xs text-green-200 mt-1">Policy No: {data.policyNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-100">Sum Insured</p>
              <p className="text-2xl font-bold">
                ₹{(data.sumInsured || 0).toLocaleString("en-IN")}L
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4 text-xs">
            {data.policyPeriod?.from && (
              <span className="bg-white/10 px-2 py-1 rounded">
                {data.policyPeriod.from} → {data.policyPeriod.to}
              </span>
            )}
            {data.coPay > 0 && (
              <span className="bg-white/10 px-2 py-1 rounded">Co-pay: {data.coPay}%</span>
            )}
            {data.networkHospitalCount > 0 && (
              <span className="bg-white/10 px-2 py-1 rounded">
                {data.networkHospitalCount.toLocaleString()} Network Hospitals
              </span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Key Highlights */}
        {data.keyHighlights && data.keyHighlights.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Key Highlights
            </h3>
            <ul className="space-y-1.5">
              {data.keyHighlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coverage Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Sum Insured", value: `₹${data.sumInsured}L`, color: "text-green-700" },
            { label: "Deductible", value: data.deductible > 0 ? `₹${data.deductible.toLocaleString()}` : "Nil", color: "text-gray-700" },
            { label: "Room Rent", value: data.roomRentLimit > 0 ? `₹${data.roomRentLimit.toLocaleString()}/day` : "Unlimited", color: "text-gray-700" },
            { label: "Premium", value: data.premium > 0 ? `₹${data.premium.toLocaleString()}/yr` : "—", color: "text-gray-700" }
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`font-semibold ${color} mt-0.5`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Covered Procedures */}
        {data.coveredProcedures && data.coveredProcedures.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Covered ({data.coveredProcedures.length})
              </h3>
              <div className="space-y-2">
                {data.coveredProcedures.slice(0, 8).map((proc, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-sm text-gray-700">{proc.name}</span>
                    </div>
                    <div className="text-right">
                      {proc.limit > 0 && (
                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                          ₹{proc.limit.toLocaleString()}
                        </Badge>
                      )}
                      {proc.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">{proc.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Waiting Periods */}
        {data.waitingPeriods && data.waitingPeriods.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Waiting Periods
              </h3>
              <div className="space-y-2">
                {data.waitingPeriods.map((wp, i) => (
                  <div key={i} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{wp.condition}</span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                      {wp.period}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Exclusions */}
        {data.exclusions && data.exclusions.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Exclusions ({data.exclusions.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {data.exclusions.slice(0, 10).map((exc, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-600 bg-red-50 rounded px-3 py-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    {exc}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Riders */}
        {data.riders && data.riders.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Riders / Add-ons
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.riders.map((rider, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {rider}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
