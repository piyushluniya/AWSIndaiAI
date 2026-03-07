# BimaSetu — System Design Document

## 1. Architecture Overview

BimaSetu is a serverless, cloud-native application built on AWS using Amplify Gen 2. The frontend is a Next.js 14 App Router application. All AI inference is handled by Google Gemini API (gemini-2.5-flash-lite). AWS services handle auth, storage, data, and document processing.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│         Next.js 14 App Router (TypeScript + Tailwind)        │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │
│  │Dashboard │ │  Cards   │ │ Policies  │ │ Claim Center │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐                    │
│  │  Chat    │ │ Profile  │ │Floating   │                    │
│  │(BimaSalah│ │ + WA Link│ │Chat Widget│                    │
│  └──────────┘ └──────────┘ └───────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            │
                    Next.js API Routes
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   AWS Lambda          Gemini API         Twilio API
  (via SDK)       (direct fetch)       (WhatsApp)
        │
   ┌────┴────────────────────────────┐
   │         AWS Services            │
   │  Cognito │ AppSync │ DynamoDB   │
   │  S3      │ Textract│ SSM        │
   └─────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Auth | AWS Cognito (via Amplify) |
| Database | AWS DynamoDB (via AppSync GraphQL) |
| File storage | AWS S3 (via Amplify Storage) |
| Document OCR | AWS Textract |
| AI inference | Google Gemini API (gemini-2.5-flash-lite) |
| Serverless functions | AWS Lambda (Node.js 20, via Amplify Gen 2) |
| Backend framework | AWS Amplify Gen 2 (CDK-based) |
| WhatsApp messaging | Twilio WhatsApp API (Sandbox) |
| Secret management | AWS SSM Parameter Store |
| QR code generation | qrcode.react |

---

## 3. Data Models

### 3.1 UserProfile
```
id            String (PK, auto-generated)
userId        String (Cognito userId)
name          String
age           Integer
city          String
familyMembers String (JSON: { hasSpouse, children, hasParents, hasInLaws })
whatsappNumber String (E.164 format, e.g. +919876543210)
whatsappConnected Boolean
waSessionState String (e.g. "emergency_awaiting_location")
createdAt     String (ISO timestamp)
owner         String (Cognito identity, auto-set by Amplify)
```

### 3.2 UserCard
```
id            String (PK)
userId        String
cardName      String
bankName      String
cardType      String
coverageData  String (JSON: full coverage breakdown)
hiddenValue   Integer (coverage value in lakhs)
owner         String
```

### 3.3 UserPolicy
```
id            String (PK)
userId        String
fileName      String
s3Key         String
parsedCoverage String (JSON: full parsed coverage)
insurer       String
status        String ("uploading" | "parsing" | "ready" | "error")
owner         String
```

### 3.4 ChatMessage
```
id            String (PK)
sessionId     String
userId        String
role          String ("user" | "assistant")
content       String
timestamp     String
owner         String
```

All models use owner-based authorization — users can only access their own records.

---

## 4. System Components

### 4.1 Lambda Functions

#### cardDiscovery
- **Trigger:** Next.js API route (`POST /api/card-discovery`)
- **Input:** `{ cardName: string }`
- **Process:** Checks internal knowledge base first, then calls Gemini if not found
- **Output:** JSON coverage breakdown + hidden value estimate
- **Timeout:** 30 seconds

#### policyParser
- **Trigger:** Next.js API route (`POST /api/policy-parser`) via async invocation
- **Input:** `{ s3Key, userId, s3Bucket, policyId }`
- **Process:**
  1. Start Textract async job on S3 PDF
  2. Poll Textract until complete (5s intervals)
  3. Concatenate extracted text (truncated at 50,000 chars)
  4. Send to Gemini with structured extraction prompt
  5. Write parsed JSON + status "ready" to DynamoDB
- **Output:** ParsedCoverage JSON
- **Timeout:** 300 seconds (5 minutes)
- **IAM permissions:** Textract (start/get), S3 (read), DynamoDB (UpdateItem)

#### coverageQA
- **Trigger:** Next.js API route (`POST /api/coverage-qa`)
- **Input:** `{ question, policyContext, cardContext, conversationHistory[] }`
- **Process:** Calls Gemini with system prompt + conversation history + question
- **Output:** `{ answer, confidence, disclaimer }`
- **Timeout:** 60 seconds

### 4.2 Next.js API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/card-discovery` | POST | Invokes cardDiscovery Lambda |
| `/api/policy-parser` | POST | Invokes policyParser Lambda (async) |
| `/api/coverage-qa` | POST | Invokes coverageQA Lambda |
| `/api/claim-analysis` | POST | Calls Gemini directly for claim rejection analysis |
| `/api/whatsapp/webhook` | POST | Twilio webhook — handles all incoming WhatsApp messages |
| `/api/whatsapp/link` | POST | Saves WhatsApp number to DynamoDB (bypasses AppSync) |
| `/api/whatsapp/unlink` | POST | Clears WhatsApp fields from DynamoDB |
| `/api/whatsapp/status` | GET | Reads whatsappConnected from DynamoDB directly |
| `/api/account/delete` | POST | Deletes all DynamoDB records for a userId |

### 4.3 Shared Gemini Helper
`amplify/functions/shared/gemini.ts` — used by all three Lambda functions:
- `callGemini({ prompt, systemPrompt, conversationHistory, maxTokens, temperature })` — makes the API call, logs token usage and latency
- `testGeminiConnection(functionName)` — runs on Lambda cold start to verify connectivity

---

## 5. Key Flows

### 5.1 Policy Upload & Parse Flow
```
User uploads PDF
    → S3 (via Amplify Storage, identity-scoped path)
    → DynamoDB record created (status: "uploading")
    → POST /api/policy-parser
    → Lambda invoked async (InvocationType: "Event")
    → DynamoDB updated to status: "parsing"
    → Lambda: Textract StartDocumentTextDetection
    → Lambda: Poll GetDocumentTextDetection (every 5s)
    → Lambda: Send text to Gemini
    → Lambda: DynamoDB UpdateItem (parsedCoverage, insurer, status: "ready")
    → UI polls policy status and shows parsed results
```

### 5.2 WhatsApp Connection Flow
```
User enters phone number on Profile page
    → POST /api/whatsapp/link → DynamoDB UpdateItem (whatsappNumber)
    → UI shows QR code + wa.me link
User scans QR / taps Open WhatsApp
    → Sends "join type-combine" to +1 415 523 8886
    → Twilio → POST /api/whatsapp/webhook
    → Webhook scans DynamoDB for whatsappNumber match
    → DynamoDB UpdateItem (whatsappConnected: true)
    → Twilio reply: welcome message
```

### 5.3 WhatsApp Emergency Flow
```
User sends panic message ("my husband had a heart attack")
    → Webhook detects emergency keywords
    → Gemini classifies emergency type (1 sentence)
    → findHospitalsByCity() or findNearestHospitals() based on GPS/city
    → Hospital list filtered by user's insurer from parsed policy
    → DynamoDB UpdateItem (waSessionState: "emergency_awaiting_location")
    → Reply: triage + top 3 hospitals + simulated 108 dispatch + pre-alert
If user shares WhatsApp location:
    → Twilio sends Latitude + Longitude params
    → Haversine distance calculated for all hospitals
    → Sorted results returned
    → DynamoDB: waSessionState cleared
```

### 5.4 Claim Analysis Flow
```
User selects policy + enters claim type + rejection reason
    → POST /api/claim-analysis
    → Policy context extracted from parsedCoverage
    → Gemini prompt with IRDAI expert persona
    → Returns JSON: { verdict, confidence, summary, reasoning,
                      keyArguments, irdaiReferences, nextSteps, grievanceLetter }
    → UI renders results + download button for grievance letter
```

---

## 6. Security Design

### Authentication
- AWS Cognito User Pool manages user identities
- JWT tokens handled by Amplify client SDK
- `middleware.ts` checks for Cognito session cookies on every protected route (fast, no async API call)

### Data Authorization
- All DynamoDB models use `allow.owner()` — AppSync enforces that users only read/write their own records
- S3 paths are scoped to `{identityId}/*` — users cannot access each other's files

### Secrets Management
- Gemini API key stored in AWS SSM Parameter Store, referenced via `secret("GEMINI_API_KEY")` in Amplify resource definitions
- Twilio credentials stored in `.env.local` (gitignored), accessed as `process.env` in Next.js API routes
- `.env.local` is never committed to version control

### WhatsApp Webhook Security
- Twilio signature validation (`X-Twilio-Signature` HMAC-SHA1) enabled in production
- Skipped in development (local ngrok testing)

---

## 7. Hospital Database

Pre-loaded static dataset of 28 major hospitals across 10 Indian cities:
Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, NCR/Noida, Jaipur, Lucknow

Each hospital record:
```typescript
{
  name: string
  address: string
  city: string
  lat: number
  lng: number
  specialties: string[]   // e.g. ["Cardiac", "Neuro", "Ortho"]
  insurers: string[]      // e.g. ["Star Health", "HDFC ERGO"]
  phone: string
}
```

**Distance calculation:** Haversine formula — accurate to ~0.5% for distances under 100km, sufficient for city-level hospital lookup.

**Insurer matching:** Case-insensitive partial match — "Star Health and Allied Insurance" in a parsed policy matches "Star Health" in the hospital database.

---

## 8. Frontend Architecture

### Route Structure
```
app/
  page.tsx                    ← Landing page
  (auth)/
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    layout.tsx                ← Sidebar + FloatingChatWidget wrapper
    dashboard/page.tsx
    cards/page.tsx
    policies/page.tsx
    chat/page.tsx
    claims/page.tsx
    profile/page.tsx
    onboarding/page.tsx
  api/                        ← Server-side API routes
    card-discovery/route.ts
    coverage-qa/route.ts
    policy-parser/route.ts
    claim-analysis/route.ts
    whatsapp/
      webhook/route.ts
      link/route.ts
      unlink/route.ts
      status/route.ts
    account/
      delete/route.ts
```

### Key Components
- `Sidebar` — navigation with all routes, sign out
- `ChatInterface` — reusable chat UI used by both the full chat page and the floating widget
- `FloatingChatWidget` — fixed bottom-right button that opens a slide-up chat panel; hidden on `/chat`
- `CircularProgress` — SVG-based ring progress indicator for profile completeness

### State Management
No global state manager — each page manages its own state with `useState`/`useEffect`. The floating chat widget loads context lazily on open.
