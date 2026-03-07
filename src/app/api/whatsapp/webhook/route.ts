import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb"
import crypto from "crypto"
import { findNearestHospitals, findHospitalsByCity } from "@/data/hospitals"

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" })

const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE!
const POLICY_TABLE = process.env.DYNAMODB_POLICY_TABLE!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!

// ---------------------------------------------------------------------------
// Keyword sets
// ---------------------------------------------------------------------------
const EMERGENCY_KEYWORDS = [
  "accident", "cardiac arrest", "heart attack", "stroke", "unconscious",
  "emergency", "ambulance", "bleeding", "chest pain", "breathless",
  "seizure", "collapsed", "critical", "icu",
  "दुर्घटना", "हार्ट अटैक", "दिल का दौरा", "आपातकाल", "एम्बुलेंस",
  "बेहोश", "खून", "सांस नहीं", "हादसा"
]

const HOSPITAL_KEYWORDS = [
  "nearest hospital", "cashless hospital", "network hospital", "hospital near",
  "hospital kahan", "hospital paas", "cashless near", "empanelled hospital",
  "नजदीकी अस्पताल", "पास का अस्पताल", "कैशलेस अस्पताल", "नेटवर्क अस्पताल",
  "hospital dhundho", "hospital batao"
]

function isEmergency(msg: string): boolean {
  const lower = msg.toLowerCase()
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))
}

function isHospitalQuery(msg: string): boolean {
  const lower = msg.toLowerCase()
  return HOSPITAL_KEYWORDS.some((kw) => lower.includes(kw))
}

// ---------------------------------------------------------------------------
// Twilio signature validation
// ---------------------------------------------------------------------------
function validateTwilioSignature(req: NextRequest, body: string): boolean {
  const signature = req.headers.get("x-twilio-signature") || ""
  const url = req.url
  const hmac = crypto.createHmac("sha1", TWILIO_AUTH_TOKEN)
  hmac.update(url)
  const params = new URLSearchParams(body)
  const sorted = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const [key, value] of sorted) hmac.update(key + value)
  const expected = hmac.digest("base64")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// TwiML helpers
// ---------------------------------------------------------------------------
function twiml(message: string): NextResponse {
  const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  )
}

function twimlEmpty(): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  )
}

// ---------------------------------------------------------------------------
// DynamoDB helpers
// ---------------------------------------------------------------------------
type DdbItem = Record<string, { S?: string; N?: string; BOOL?: boolean }>

async function findProfileByPhone(phone: string): Promise<DdbItem | null> {
  const result = await dynamo.send(new ScanCommand({
    TableName: PROFILE_TABLE,
    FilterExpression: "whatsappNumber = :phone",
    ExpressionAttributeValues: { ":phone": { S: phone } }
  }))
  return (result.Items?.[0] as DdbItem) || null
}

async function markConnected(profileId: string): Promise<void> {
  await dynamo.send(new UpdateItemCommand({
    TableName: PROFILE_TABLE,
    Key: { id: { S: profileId } },
    UpdateExpression: "SET whatsappConnected = :t, waSessionState = :ns, updatedAt = :ua",
    ExpressionAttributeValues: {
      ":t": { BOOL: true },
      ":ns": { S: "" },
      ":ua": { S: new Date().toISOString() }
    }
  }))
}

async function setSessionState(profileId: string, state: string): Promise<void> {
  await dynamo.send(new UpdateItemCommand({
    TableName: PROFILE_TABLE,
    Key: { id: { S: profileId } },
    UpdateExpression: "SET waSessionState = :s",
    ExpressionAttributeValues: { ":s": { S: state } }
  }))
}

async function clearSessionState(profileId: string): Promise<void> {
  await setSessionState(profileId, "")
}

async function getLatestReadyPolicy(userId: string): Promise<DdbItem | null> {
  const result = await dynamo.send(new ScanCommand({
    TableName: POLICY_TABLE,
    FilterExpression: "#s = :ready AND userId = :uid",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":ready": { S: "ready" }, ":uid": { S: userId } }
  }))
  return (result.Items?.[0] as DdbItem) || null
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------
async function callGemini(prompt: string, maxTokens = 512): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
    })
  })
  if (!res.ok) throw new Error("Gemini " + res.status)
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that."
}

// ---------------------------------------------------------------------------
// Policy context builder
// ---------------------------------------------------------------------------
function buildPolicyContext(item: DdbItem): { text: string; insurer: string; city: string } {
  const raw = item["parsedCoverage"]?.S || ""
  let insurer = "General"
  let city = ""
  let text = ""
  try {
    const p = JSON.parse(raw)
    insurer = p.insurer || "General"
    text = [
      `Insurer: ${p.insurer}`,
      `Policy type: ${p.policyType}`,
      `Sum insured: ₹${p.sumInsured} lakhs`,
      `Room rent limit: ₹${p.roomRentLimit || 0}/day`,
      `Co-pay: ${p.coPay || 0}%`,
      `Network hospitals: ${p.networkHospitalCount || "unknown"}`,
      `Exclusions: ${p.exclusions?.slice(0, 4).join(", ") || "none"}`,
      `Waiting periods: ${p.waitingPeriods?.map((w: { condition: string; period: string }) => `${w.condition} (${w.period})`).join(", ") || "none"}`
    ].join("\n")
  } catch {}
  return { text, insurer, city }
}

// ---------------------------------------------------------------------------
// Format hospital list for WhatsApp
// ---------------------------------------------------------------------------
function formatHospitals(
  hospitals: Array<{ name: string; address: string; distanceKm?: number; specialties: string[]; phone: string }>,
  insurer: string,
  isEmergencyCtx = false
): string {
  if (hospitals.length === 0) {
    return `I couldn't find cashless hospitals for ${insurer} nearby. Please call your insurer's helpline for the nearest network hospital.`
  }

  const header = isEmergencyCtx
    ? `🚨 Nearest cashless hospitals under your ${insurer} policy:\n\n`
    : `🏥 Cashless hospitals under your ${insurer} policy nearby:\n\n`

  const list = hospitals.map((h, i) => {
    const dist = h.distanceKm !== undefined ? ` — ${h.distanceKm.toFixed(1)} km` : ""
    return `${i + 1}. ${h.name}${dist}\n   ${h.address}\n   Specialties: ${h.specialties.slice(0, 3).join(", ")}\n   📞 ${h.phone}`
  }).join("\n\n")

  return header + list
}

// ---------------------------------------------------------------------------
// Emergency response builder
// ---------------------------------------------------------------------------
async function handleEmergency(
  userName: string,
  body: string,
  insurer: string,
  userCity: string,
  lat: number | null,
  lng: number | null,
  profileId: string
): Promise<string> {
  let hospitalMsg = ""

  if (lat !== null && lng !== null) {
    const hospitals = findNearestHospitals(lat, lng, insurer)
    hospitalMsg = formatHospitals(hospitals, insurer, true)
    await clearSessionState(profileId)
  } else if (userCity) {
    const hospitals = findHospitalsByCity(userCity, insurer)
    const withDist = hospitals.map((h) => ({ ...h, distanceKm: undefined as number | undefined }))
    hospitalMsg = formatHospitals(withDist, insurer, true)
    hospitalMsg += "\n\nFor more accurate results, share your live location on WhatsApp."
    await setSessionState(profileId, "emergency_awaiting_location")
  } else {
    await setSessionState(profileId, "emergency_awaiting_location")
    hospitalMsg = "Please share your location so I can find the nearest cashless hospitals for you."
  }

  const triage = await callGemini(
    `Emergency situation detected. User message: "${body}"
In 1 short sentence, classify the emergency type (cardiac/accident/stroke/other) and the most critical first action.
Reply in plain text, no markdown. Keep it under 15 words.`
  )

  return (
    `🚨 EMERGENCY DETECTED — Stay calm, ${userName}!\n\n` +
    `${triage}\n\n` +
    `📞 CALL 108 (Ambulance) immediately!\n\n` +
    `${hospitalMsg}\n\n` +
    `✅ Hospital Pre-Alert Sent (simulation) — The selected hospital has been notified with your insurance details.\n` +
    `✅ Ambulance Dispatch Initiated (simulation) — 108 has been alerted to your location.`
  )
}

// ---------------------------------------------------------------------------
// Main webhook handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (process.env.NODE_ENV === "production") {
    try {
      if (!validateTwilioSignature(req, rawBody)) {
        console.warn("[whatsapp/webhook] Invalid signature")
        return new NextResponse("Forbidden", { status: 403 })
      }
    } catch {}
  }

  const params = new URLSearchParams(rawBody)
  const from = params.get("From") || ""
  const body = (params.get("Body") || "").trim()
  const msgLower = body.toLowerCase()

  // WhatsApp location share — Twilio sends Latitude/Longitude params
  const latParam = params.get("Latitude")
  const lngParam = params.get("Longitude")
  const incomingLat = latParam ? parseFloat(latParam) : null
  const incomingLng = lngParam ? parseFloat(lngParam) : null
  const isLocationShare = incomingLat !== null && incomingLng !== null

  console.log(`[whatsapp/webhook] From: ${from} | Body: "${body.substring(0, 80)}" | Location: ${isLocationShare ? `${incomingLat},${incomingLng}` : "none"}`)

  const phone = from.replace(/^whatsapp:/, "")
  if (!phone) return twimlEmpty()

  // ------------------------------------------------------------------
  // 1. Find user profile
  // ------------------------------------------------------------------
  let profile: DdbItem | null = null
  try {
    profile = await findProfileByPhone(phone)
  } catch (err) {
    console.error("[whatsapp/webhook] Profile lookup error:", err)
  }

  const userName = profile?.["name"]?.S || "there"
  const profileId = profile?.["id"]?.S
  const userId = profile?.["userId"]?.S
  const userCity = profile?.["city"]?.S || ""
  const alreadyConnected = profile?.["whatsappConnected"]?.BOOL === true
  const sessionState = profile?.["waSessionState"]?.S || ""

  // ------------------------------------------------------------------
  // 2. Join code — connect account
  // ------------------------------------------------------------------
  if (msgLower.includes("join") && msgLower.includes("type") && msgLower.includes("combine")) {
    if (profileId && !alreadyConnected) {
      try {
        await markConnected(profileId)
        console.log(`[whatsapp/webhook] Connected profileId: ${profileId}`)
      } catch (err) {
        console.error("[whatsapp/webhook] markConnected failed:", err)
      }
    }
    if (profile) {
      return twiml(
        `🛡️ Welcome to BimaSetu, ${userName}!\n\n` +
        `Your WhatsApp is now connected.\n\n` +
        `You can:\n` +
        `• Ask anything about your coverage\n` +
        `• Find nearest cashless hospitals\n` +
        `• Get help with claim rejections\n` +
        `• Send SOS in an emergency\n\n` +
        `I speak Hindi & Hinglish too — बस पूछो! 🙏`
      )
    } else {
      return twiml(
        `🛡️ Welcome to BimaSetu!\n\n` +
        `To link your account, visit BimaSetu → Profile → add this WhatsApp number.\n\n` +
        `Once linked, I can answer questions about your specific policy.`
      )
    }
  }

  // ------------------------------------------------------------------
  // 3. Unlinked user
  // ------------------------------------------------------------------
  if (!profile) {
    return twiml(
      `Hello! I'm BimaSetu AI.\n\n` +
      `I couldn't find an account linked to this number.\n` +
      `Please visit BimaSetu → Profile → add this WhatsApp number to connect.`
    )
  }

  // ------------------------------------------------------------------
  // 4. Load policy
  // ------------------------------------------------------------------
  let policyContext = ""
  let insurer = "General"
  try {
    if (userId) {
      const policyItem = await getLatestReadyPolicy(userId)
      if (policyItem) {
        const ctx = buildPolicyContext(policyItem)
        policyContext = ctx.text
        insurer = ctx.insurer
      }
    }
  } catch (err) {
    console.error("[whatsapp/webhook] Policy fetch error:", err)
  }

  // ------------------------------------------------------------------
  // 5. Handle location share (could be from emergency or hospital flow)
  // ------------------------------------------------------------------
  if (isLocationShare) {
    const isEmergencySession = sessionState === "emergency_awaiting_location"
    const hospitals = findNearestHospitals(incomingLat!, incomingLng!, insurer)

    if (profileId) await clearSessionState(profileId)

    if (isEmergencySession) {
      const hospitalMsg = formatHospitals(hospitals, insurer, true)
      return twiml(
        `📍 Location received!\n\n` +
        `${hospitalMsg}\n\n` +
        `📞 CALL 108 immediately!\n` +
        `✅ Ambulance dispatch initiated (simulation)\n` +
        `✅ Hospital pre-alert sent (simulation)`
      )
    } else {
      const hospitalMsg = formatHospitals(hospitals, insurer, false)
      return twiml(`📍 Location received!\n\n${hospitalMsg}`)
    }
  }

  // ------------------------------------------------------------------
  // 6. Emergency detection
  // ------------------------------------------------------------------
  if (isEmergency(msgLower)) {
    try {
      const msg = await handleEmergency(userName, body, insurer, userCity, null, null, profileId!)
      return twiml(msg)
    } catch (err) {
      console.error("[whatsapp/webhook] Emergency handler error:", err)
      return twiml(
        `🚨 Emergency detected! Please CALL 108 immediately for an ambulance.\n\n` +
        `Stay on the line with 108 — they will guide you.`
      )
    }
  }

  // ------------------------------------------------------------------
  // 7. Hospital finder
  // ------------------------------------------------------------------
  if (isHospitalQuery(msgLower)) {
    if (profileId) await setSessionState(profileId, "hospital_awaiting_location")

    const cityHospitals = userCity ? findHospitalsByCity(userCity, insurer) : []

    if (cityHospitals.length > 0) {
      const hospitalMsg = formatHospitals(
        cityHospitals.map((h) => ({ ...h, distanceKm: undefined as number | undefined })),
        insurer
      )
      return twiml(
        `${hospitalMsg}\n\n` +
        `Share your live location on WhatsApp for distance-sorted results.`
      )
    } else {
      return twiml(
        `🏥 To find cashless hospitals under your ${insurer} policy, please share your location.\n\n` +
        `Tap the 📎 icon → Location → Share Current Location.`
      )
    }
  }

  // ------------------------------------------------------------------
  // 8. Coverage Q&A via Gemini
  // ------------------------------------------------------------------
  if (profileId) await clearSessionState(profileId)

  const systemContext = policyContext
    ? `The user has this insurance policy:\n${policyContext}`
    : `The user has not uploaded a policy. Provide general Indian insurance guidance.`

  const prompt = `You are BimaSetu AI — a friendly Indian insurance advisor on WhatsApp.
Keep your reply SHORT (max 5-6 lines). Plain text only — no asterisks, no markdown, no bullet symbols.
Use simple line breaks. Be warm and accurate.

${systemContext}

User's name: ${userName}
Message: ${body}

Reply in the same language as the user (Hindi/English/Hinglish). Keep it brief.`

  try {
    const answer = await callGemini(prompt)
    return twiml(answer)
  } catch (err) {
    console.error("[whatsapp/webhook] Gemini error:", err)
    return twiml("Sorry, I'm having trouble right now. Please try again. 🙏")
  }
}
