"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateClient } from "aws-amplify/data"
import { getCurrentUser } from "aws-amplify/auth"
import type { Schema } from "../../../../amplify/data/resource"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Shield, User, Users, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const client = generateClient<Schema>()

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan", "Vasai-Virar", "Varanasi", "Srinagar", "Other"
]

type FamilyData = {
  hasSpouse: boolean
  children: number
  hasParents: boolean
  hasInLaws: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1 data
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [city, setCity] = useState("")

  // Step 2 data
  const [family, setFamily] = useState<FamilyData>({
    hasSpouse: false,
    children: 0,
    hasParents: false,
    hasInLaws: false
  })

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100

  async function handleComplete() {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      await client.models.UserProfile.create({
        userId: user.userId,
        name,
        age: parseInt(age) || 0,
        city,
        familyMembers: JSON.stringify(family),
        createdAt: new Date().toISOString()
      })
      toast({ title: "Profile saved!", description: "Welcome to BimaSetu, " + name + "!" })
      router.push("/dashboard")
    } catch (error) {
      toast({ title: "Failed to save profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BimaSetu</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of 3</span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-blue-600" />
                <CardTitle>Tell us about you</CardTitle>
              </div>
              <CardDescription>This helps us personalize your coverage analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="32"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="99"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select your city</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white mt-2"
                onClick={() => setStep(2)}
                disabled={!name || !age || !city}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Family */}
        {step === 2 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle>Your family</CardTitle>
              </div>
              <CardDescription>Family members affect your coverage needs and benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "hasSpouse", label: "Spouse / Partner" },
                { key: "hasParents", label: "Parents (dependent)" },
                { key: "hasInLaws", label: "In-laws (dependent)" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">{label}</span>
                  <button
                    onClick={() => setFamily((f) => ({ ...f, [key]: !f[key as keyof FamilyData] }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      family[key as keyof FamilyData] ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        family[key as keyof FamilyData] ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Children</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFamily((f) => ({ ...f, children: Math.max(0, f.children - 1) }))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-medium">{family.children}</span>
                  <button
                    onClick={() => setFamily((f) => ({ ...f, children: f.children + 1 }))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <CardTitle>All set, {name}!</CardTitle>
              </div>
              <CardDescription>We&apos;re ready to discover your hidden insurance coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age</span>
                  <span className="font-medium">{age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City</span>
                  <span className="font-medium">{city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Family</span>
                  <span className="font-medium">
                    {[
                      family.hasSpouse && "Spouse",
                      family.children > 0 && `${family.children} child${family.children > 1 ? "ren" : ""}`,
                      family.hasParents && "Parents"
                    ].filter(Boolean).join(", ") || "Just you"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Discover My Coverage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
