# BimaSetu — Product Requirements Document

## 1. Overview

BimaSetu ("Insurance Bridge") is an AI-powered insurance intelligence platform for the Indian market. It helps users discover hidden insurance coverage in their credit cards, understand their health insurance policies, analyze claim rejections, and get emergency assistance — all through a web portal and a WhatsApp companion.

**Target Users:** Indian consumers with health insurance policies and premium credit cards who are unaware of the full extent of their coverage.

**Core Problem:** Indians are chronically underinsured not because they lack policies, but because they don't understand what they have. Claim rejections go uncontested. Hidden credit card insurance goes unclaimed. Emergencies happen without knowledge of the nearest cashless hospital.

---

## 2. Functional Requirements

### 2.1 Authentication

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | Users can register with email and password |
| FR-AUTH-02 | Users can log in with email and password |
| FR-AUTH-03 | All dashboard routes are protected; unauthenticated users are redirected to login |
| FR-AUTH-04 | Email verification is not required (disabled for ease of onboarding) |
| FR-AUTH-05 | Users can sign out from any dashboard page |

### 2.2 Onboarding

| ID | Requirement |
|----|-------------|
| FR-ONB-01 | New users complete a 3-step onboarding: personal info → family → confirmation |
| FR-ONB-02 | Personal info collects: name, age, city (from a list of Indian cities) |
| FR-ONB-03 | Family info collects: spouse, children count, parents, in-laws |
| FR-ONB-04 | Profile is created in DynamoDB on completion |
| FR-ONB-05 | User is redirected to dashboard after onboarding |

### 2.3 Dashboard

| ID | Requirement |
|----|-------------|
| FR-DASH-01 | Dashboard shows a time-based greeting with the user's name |
| FR-DASH-02 | Three stat cards: Hidden Card Coverage (total ₹ value), Insurance Policies count, Profile Completeness |
| FR-DASH-03 | Profile Completeness shows a circular progress ring with 4 criteria: profile info filled, card added, policy parsed, WhatsApp linked |
| FR-DASH-04 | Insurance Coverage card shows parsed policy summary (insurer, sum insured, room rent, co-pay) |
| FR-DASH-05 | Card Portfolio card shows all added cards with individual hidden coverage values |
| FR-DASH-06 | Alerts & Reminders card shows waiting periods and policy expiry dates from parsed policies |
| FR-DASH-07 | Quick Actions card provides shortcuts to: add card, upload policy, ask BimaSalah, analyze claim |
| FR-DASH-08 | Empty state prompts users to add a card or upload a policy |

### 2.4 Card Discovery

| ID | Requirement |
|----|-------------|
| FR-CARD-01 | Users can add a credit/debit card by entering the card name and bank |
| FR-CARD-02 | AI (Gemini) identifies hidden insurance benefits for the entered card |
| FR-CARD-03 | Coverage data includes: personal accident cover, air accident cover, purchase protection, travel insurance, lounge access |
| FR-CARD-04 | Discovered coverage is stored in DynamoDB with a calculated hidden value (in lakhs) |
| FR-CARD-05 | Users can view all added cards with their coverage details |
| FR-CARD-06 | Users can delete a card |

### 2.5 Policy Management

| ID | Requirement |
|----|-------------|
| FR-POL-01 | Users can upload a health insurance policy PDF |
| FR-POL-02 | PDF is stored in S3 under the user's identity folder |
| FR-POL-03 | A Lambda function (policyParser) is invoked asynchronously after upload |
| FR-POL-04 | policyParser uses AWS Textract to extract text from the PDF |
| FR-POL-05 | Extracted text is sent to Gemini for structured analysis |
| FR-POL-06 | Parsed fields include: insurer, policy number, policy type, sum insured, deductible, premium, policy period, covered procedures, exclusions, waiting periods, room rent limit, co-pay, network hospital count, riders, key highlights |
| FR-POL-07 | Parsed results are written back to DynamoDB and policy status is set to "ready" |
| FR-POL-08 | Policy status progresses: uploading → parsing → ready (or error) |
| FR-POL-09 | Users can view the full parsed coverage breakdown for each policy |
| FR-POL-10 | Users can delete a policy |

### 2.6 BimaSalah Chat (Coverage Q&A)

| ID | Requirement |
|----|-------------|
| FR-CHAT-01 | Users can ask natural language questions about their insurance coverage |
| FR-CHAT-02 | AI answers using the user's parsed policy as context |
| FR-CHAT-03 | AI also incorporates credit card coverage data in answers |
| FR-CHAT-04 | Conversation history is maintained within the session (last 10 messages) |
| FR-CHAT-05 | AI responses include a confidence level (high/medium/low) |
| FR-CHAT-06 | AI responses include a disclaimer for medical/legal decisions |
| FR-CHAT-07 | Suggested questions are shown at the start of the conversation |
| FR-CHAT-08 | A floating chat widget is available on all dashboard pages except the full chat page |
| FR-CHAT-09 | The floating widget lazily loads policy and card context when opened |

### 2.7 Claim Center

| ID | Requirement |
|----|-------------|
| FR-CLAIM-01 | Users can enter a claim rejection reason and claim type |
| FR-CLAIM-02 | Users can optionally select a parsed policy for context |
| FR-CLAIM-03 | AI (Gemini) analyzes whether the rejection is contestable or valid |
| FR-CLAIM-04 | Analysis includes: verdict, confidence level, summary, detailed reasoning |
| FR-CLAIM-05 | Analysis includes key arguments in the policyholder's favour |
| FR-CLAIM-06 | Analysis includes relevant IRDAI regulation references |
| FR-CLAIM-07 | Analysis includes recommended next steps |
| FR-CLAIM-08 | AI generates a ready-to-send formal grievance letter |
| FR-CLAIM-09 | User can preview and download the grievance letter as a .txt file |

### 2.8 Profile Management

| ID | Requirement |
|----|-------------|
| FR-PROF-01 | Users can update their name, age, and city |
| FR-PROF-02 | Users can view their account stats (cards added, policies uploaded, policies parsed) |
| FR-PROF-03 | Users can enter their WhatsApp number (+91 pre-filled) to connect BimaSetu on WhatsApp |
| FR-PROF-04 | After saving, UI shows a QR code and wa.me link pre-filled with the Twilio sandbox join code |
| FR-PROF-05 | Users can unlink their WhatsApp number, clearing all associated session state |
| FR-PROF-06 | Users can delete their account — removes all DynamoDB records and the Cognito user |
| FR-PROF-07 | Account deletion requires double confirmation |

### 2.9 WhatsApp Companion

| ID | Requirement |
|----|-------------|
| FR-WA-01 | Users connect by sending "join type-combine" to the Twilio sandbox number (+1 415 523 8886) |
| FR-WA-02 | Backend matches the incoming phone number to the user's profile and confirms connection |
| FR-WA-03 | Users can ask coverage questions in English, Hindi, or Hinglish |
| FR-WA-04 | AI answers using the user's parsed policy and card context |
| FR-WA-05 | Emergency keywords (accident, heart attack, दुर्घटना, etc.) trigger BimaRakshak emergency mode |
| FR-WA-06 | Emergency mode: classifies emergency type via AI, shows top 3 nearest cashless hospitals under the user's policy, simulates ambulance dispatch and hospital pre-alert |
| FR-WA-07 | Hospital queries ("nearest cashless hospital", "नजदीकी अस्पताल") return hospitals filtered by the user's insurer |
| FR-WA-08 | If the user shares WhatsApp location (GPS), hospitals are sorted by actual distance using Haversine formula |
| FR-WA-09 | Session state tracks whether the system is awaiting a location response |
| FR-WA-10 | Unlinked users are prompted to connect via the profile page |
| FR-WA-11 | All WhatsApp responses are plain text optimised for mobile readability |

---

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | **Performance:** Web pages load within 2 seconds on a standard connection |
| NFR-02 | **AI Latency:** Gemini responses for chat Q&A complete within 5 seconds |
| NFR-03 | **Policy Parsing:** End-to-end pipeline (upload → Textract → Gemini → DynamoDB) completes within 5 minutes |
| NFR-04 | **Security:** No API keys hardcoded in source code; all secrets stored in AWS SSM Parameter Store |
| NFR-05 | **Security:** All user data is owner-scoped in DynamoDB via Amplify authorization rules |
| NFR-06 | **Security:** Twilio webhook signature validated in production |
| NFR-07 | **Availability:** Deployed on AWS with Amplify Gen 2 managed infrastructure |
| NFR-08 | **Scalability:** Lambda functions scale automatically with demand |
| NFR-09 | **Accessibility:** UI is responsive on desktop and tablet |
| NFR-10 | **Data Privacy:** WhatsApp numbers used only for account linking, never for marketing |

---

## 4. Out of Scope (Current Version)

- Real ambulance dispatch integration (108 API)
- Real hospital pre-authorization API integration
- Proactive WhatsApp alerts (waiting period expiry, renewal reminders)
- Voice note processing for WhatsApp audio messages
- Multi-policy comparison
- Mobile app (iOS/Android)
