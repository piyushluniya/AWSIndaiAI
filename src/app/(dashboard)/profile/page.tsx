"use client"

import { useState, useEffect } from "react"
import { generateClient } from "aws-amplify/data"
import { getCurrentUser, signOut, deleteUser } from "aws-amplify/auth"
import { useRouter } from "next/navigation"
import type { Schema } from "../../../../amplify/data/resource"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User, Mail, Shield, Loader2, CheckCircle2, LogOut,
  MapPin, Calendar, MessageSquare, ExternalLink, Smartphone,
  Trash2, Unlink
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"

const client = generateClient<Schema>()

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Kalyan", "Vasai-Virar", "Varanasi", "Srinagar", "Other"
]

const TWILIO_WHATSAPP_NUMBER = "+14155238886"
const TWILIO_JOIN_CODE = "join type-combine"
const WA_LINK = `https://wa.me/14155238886?text=${encodeURIComponent(TWILIO_JOIN_CODE)}`

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ cards: 0, policies: 0, policiesReady: 0 })

  // Personal info
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [city, setCity] = useState("")
  const [savedState, setSavedState] = useState({ name: "", age: "", city: "" })

  // WhatsApp
  const [waNumber, setWaNumber] = useState("+91")
  const [waSaved, setWaSaved] = useState("")
  const [savingWa, setSavingWa] = useState(false)
  const [showWaInstructions, setShowWaInstructions] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => { loadProfile() }, [])



  async function loadProfile() {
    try {
      const user = await getCurrentUser()
      setEmail(user.signInDetails?.loginId || user.username)

      const [profileRes, cardsRes, policiesRes] = await Promise.all([
        client.models.UserProfile.list(),
        client.models.UserCard.list(),
        client.models.UserPolicy.list()
      ])

      if (profileRes.data.length > 0) {
        const p = profileRes.data[0]
        const n = p.name || ""
        const a = p.age?.toString() || ""
        const c = p.city || ""
        const wn = p.whatsappNumber || "+91"

        setName(n); setAge(a); setCity(c)
        setSavedState({ name: n, age: a, city: c })
        setProfileId(p.id)
        setWaNumber(wn)
        setWaSaved(wn)
        setShowWaInstructions(wn !== "+91" && wn.length > 4)
      }

      setStats({
        cards: cardsRes.data.length,
        policies: policiesRes.data.length,
        policiesReady: policiesRes.data.filter((p) => p.status === "ready").length
      })
    } catch {
      // not logged in
    } finally {
      setLoading(false)
    }
  }

  const hasInfoChanges =
    name !== savedState.name || age !== savedState.age || city !== savedState.city

  async function handleSaveInfo() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        age: parseInt(age) || undefined,
        city: city || undefined
      }
      if (profileId) {
        await client.models.UserProfile.update({ id: profileId, ...payload })
      } else {
        const user = await getCurrentUser()
        const res = await client.models.UserProfile.create({
          userId: user.userId,
          createdAt: new Date().toISOString(),
          ...payload
        })
        if (res.data) setProfileId(res.data.id)
      }
      setSavedState({ name: name.trim(), age, city })
      toast({ title: "Profile updated" })
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const waNumberValid = waNumber.length >= 10 && waNumber !== "+91"

  async function handleSaveWhatsApp() {
    if (!waNumberValid || !profileId) return
    setSavingWa(true)
    try {
      // Use DynamoDB API route directly — bypasses AppSync schema so the field
      // is written even before sandbox redeploy with the new schema.
      const res = await fetch("/api/whatsapp/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, phone: waNumber })
      })
      if (!res.ok) throw new Error("Link failed")
      setWaSaved(waNumber)
      setShowWaInstructions(true)
      toast({ title: "WhatsApp number saved" })
    } catch {
      toast({ title: "Failed to save number", variant: "destructive" })
    } finally {
      setSavingWa(false)
    }
  }

  async function handleUnlinkWhatsApp() {
    if (!profileId) return
    if (!window.confirm("Unlink WhatsApp? You will stop receiving BimaSetu messages on WhatsApp.")) return
    setUnlinking(true)
    try {
      const res = await fetch("/api/whatsapp/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId })
      })
      if (!res.ok) throw new Error("Unlink failed")
      setWaNumber("+91")
      setWaSaved("")
      setShowWaInstructions(false)
      toast({ title: "WhatsApp unlinked" })
    } catch {
      toast({ title: "Failed to unlink", variant: "destructive" })
    } finally {
      setUnlinking(false)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your account? This permanently removes all your policies, cards, and data. This cannot be undone.")) return
    if (!window.confirm("Are you absolutely sure? All data will be deleted immediately.")) return
    setDeletingAccount(true)
    try {
      const user = await getCurrentUser()
      // Delete all DynamoDB data first
      await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId })
      })
      // Then delete the Cognito user
      await deleteUser()
      router.push("/login")
    } catch (err) {
      toast({ title: "Failed to delete account", variant: "destructive" })
      setDeletingAccount(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account and WhatsApp connection</p>
      </div>

      {/* Avatar + stats */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold">
              {(name || email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{name || "No name set"}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </p>
              <div className="flex gap-3 mt-1">
                {age && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {age} yrs
                  </span>
                )}
                {city && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.cards}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cards Added</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.policies}</p>
              <p className="text-xs text-gray-500 mt-0.5">Policies Uploaded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.policiesReady}</p>
              <p className="text-xs text-gray-500 mt-0.5">Policies Parsed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </CardTitle>
          <CardDescription>Used to personalize your coverage analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="32"
                min="18"
                max="99"
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Select city</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
            onClick={handleSaveInfo}
            disabled={saving || !name.trim() || !hasInfoChanges}
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
          {!hasInfoChanges && name && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </p>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Connect */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" /> BimaSetu on WhatsApp
          </CardTitle>
          <CardDescription>
            Get insurance alerts, emergency assistance, and coverage Q&A directly on WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Number input */}
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <div className="flex gap-2">
              <Input
                value={waNumber}
                onChange={(e) => {
                  let v = e.target.value
                  if (!v.startsWith("+91")) v = "+91" + v.replace(/^\+91/, "")
                  setWaNumber(v)
                }}
                placeholder="+91 98765 43210"
                className="flex-1"
                maxLength={13}
              />
              <Button
                onClick={handleSaveWhatsApp}
                disabled={savingWa || !waNumberValid || waNumber === waSaved}
                className="bg-green-600 hover:bg-green-700 text-white shrink-0"
              >
                {savingWa ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>

          {/* Instructions — shown after saving number */}
          {showWaInstructions && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-green-900">Activate your WhatsApp connection</p>

              <div className="flex gap-4 items-start">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="bg-white rounded-xl p-2.5 border border-green-200 shadow-sm">
                    <QRCodeSVG
                      value={WA_LINK}
                      size={110}
                      bgColor="#ffffff"
                      fgColor="#111827"
                      level="M"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                    <Smartphone className="w-3 h-3" />
                    Scan on mobile
                  </div>
                </div>

                {/* Manual steps */}
                <div className="flex-1 space-y-2.5">
                  <p className="text-xs text-green-800">Or send this message manually:</p>
                  <div className="bg-white rounded-lg border border-green-200 px-3 py-2 space-y-1.5">
                    <div>
                      <p className="text-xs text-gray-400">Send to</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">{TWILIO_WHATSAPP_NUMBER}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-1.5">
                      <p className="text-xs text-gray-400">Message</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">{TWILIO_JOIN_CODE}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-9 text-sm"
                    onClick={() => window.open(WA_LINK, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open WhatsApp
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Scan the QR with your phone camera, or tap Open WhatsApp — the message is pre-filled, just hit Send.
              </p>
            </div>
          )}


          {/* Unlink button — shown when a number is saved */}
          {waSaved && waSaved !== "+91" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 gap-2"
              onClick={handleUnlinkWhatsApp}
              disabled={unlinking}
            >
              {unlinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
              Unlink WhatsApp
            </Button>
          )}

          {/* Note */}
          <p className="text-xs text-gray-400">
            Your number is used only to connect your BimaSetu account. We never share it or use it for marketing.
          </p>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Verified</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Account type</p>
              <p className="text-sm text-gray-500">Free plan</p>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 mb-3"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      <Button
        variant="ghost"
        className="w-full text-red-400 hover:text-red-600 hover:bg-red-50 gap-2 text-sm"
        onClick={handleDeleteAccount}
        disabled={deletingAccount}
      >
        {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        {deletingAccount ? "Deleting account..." : "Delete Account"}
      </Button>
      <p className="text-xs text-gray-400 text-center mt-1">
        Permanently removes all your data. Cannot be undone.
      </p>
    </div>
  )
}
