# BimaSetu (बीमा सेतु) — Requirements Document

## 1. Product Overview

BimaSetu is a WhatsApp-native, voice-and-text AI assistant that serves as a personal insurance guardian for Indian users. It transforms how people interact with insurance — from discovering hidden card-based coverage to providing real-time emergency guidance — across four operating modes.

---

## 2. Functional Requirements

### 2.1 Mode 1: Hidden Insurance Discovery

| ID | Requirement | Priority |
|----|------------|----------|
| FR-1.1 | The system shall accept a credit/debit card name as text input (e.g., "HDFC Regalia", "SBI Elite") and return the complete insurance benefit package bundled with that card. | P0 |
| FR-1.2 | The system shall generate a **Hidden Coverage Card** — a visual summary showing all insurance benefits (air accident cover, personal accident, travel insurance, purchase protection, lost card liability, emergency medical abroad) with their respective coverage amounts. | P0 |
| FR-1.3 | The system shall support a **Multi-Card Portfolio View** where users can add 2–3 cards and see combined hidden coverage, overlaps, and unique benefits per card. | P1 |
| FR-1.4 | The system shall perform **Gap Analysis** — identifying what card insurance covers (e.g., travel, accidents) vs. what it does NOT cover (e.g., hospitalization) — and recommend next steps. | P1 |
| FR-1.5 | The system shall send **Proactive Claim Alerts** when detectable claimable events occur (e.g., flight delay triggers for travel insurance claims). | P2 |
| FR-1.6 | The system shall maintain a curated knowledge base covering 200+ card variants across 15+ major Indian banks. | P1 |

### 2.2 Mode 2: BimaSalah (बीमा सलाह) — Insurance Advisory for the Uninsured

| ID | Requirement | Priority |
|----|------------|----------|
| FR-2.1 | The system shall collect user profile data through a conversational flow (voice or text, in Hindi or regional languages): age, family composition, city, approximate income, known health conditions. | P0 |
| FR-2.2 | The system shall generate a **Personalized Risk Assessment** contextualizing insurance need with real hospitalization cost data for the user's city. | P0 |
| FR-2.3 | The system shall calculate an **Insurance Readiness Score** (0–100) that quantifies financial risk if the user faces hospitalization without insurance. | P1 |
| FR-2.4 | The system shall provide **Plan Comparison in Plain Language** — side-by-side comparison of 3 best-fit insurance plans with vernacular pros/cons, not industry jargon. | P0 |
| FR-2.5 | The system shall perform **Ayushman Bharat (PM-JAY) Eligibility Check** — instant verification of whether the user qualifies for the government health scheme covering up to ₹5L per family. | P1 |
| FR-2.6 | The system shall support **Expert Handoff** — one-tap connection to IRDAI-certified advisors for complex cases, with an AI-generated brief so the expert starts informed. | P2 |

### 2.3 Mode 3: BimaGuru (बीमा गुरु) — Policy Decoder for the Insured

| ID | Requirement | Priority |
|----|------------|----------|
| FR-3.1 | The system shall accept insurance policy PDFs or photographs of physical policy documents and parse the full document. | P0 |
| FR-3.2 | The system shall generate a **My Coverage Card** — a single-screen summary showing: what's covered (with ₹ limits), what's NOT covered, active waiting periods, room rent sub-limits, co-pay clauses, network hospital count, and riders. | P0 |
| FR-3.3 | The system shall support **Natural Language Q&A** — users can ask questions in voice or text (e.g., "Meri policy mein knee replacement covered hai kya?") and get answers with specific clause references from their policy. | P0 |
| FR-3.4 | The system shall send **Proactive Alerts** for: waiting period expirations, upcoming policy renewals, and changes in coverage status. | P1 |
| FR-3.5 | The system shall perform **Coverage Gap Analysis** — identifying what the policy doesn't cover and recommending specific top-up/super-top-up plans to fill gaps. | P1 |
| FR-3.6 | The system shall provide **Policy Portability Advice** — comparing the current policy with alternatives and guiding portability without losing waiting period credits (per IRDAI rules). | P2 |
| FR-3.7 | The system shall maintain a **Family Health Vault** — storing medical history, past prescriptions, allergies, and blood group for the entire family, integrated with India's ABHA (Ayushman Bharat Health Account) where available. | P1 |

### 2.4 Mode 4: BimaRakshak (बीमा रक्षक) — Emergency Insurance Guardian

| ID | Requirement | Priority |
|----|------------|----------|
| **Step 1: Panic Triage (0–30 seconds)** | | |
| FR-4.1 | The system shall accept emergency voice notes in Hindi and regional languages and extract: emergency type (accident/cardiac/stroke/burns/breathing difficulty), location (GPS or voice description), and severity cues. | P0 |
| FR-4.2 | The system shall ask at most ONE follow-up question if critical information is missing (e.g., "Are they conscious?"). | P0 |
| FR-4.3 | The system shall NOT provide medical advice — only classify emergency type to match hospital specialty. | P0 |
| **Step 2: Smart Hospital Match (30–60 seconds)** | | |
| FR-4.4 | The system shall cross-reference three databases simultaneously: (1) nearest hospitals with relevant emergency facilities (trauma center, cath lab, stroke unit, etc.), (2) which hospitals are cashless under the user's specific insurance policy, (3) real-time bed/ER availability where data is accessible. | P0 |
| FR-4.5 | The system shall present ranked hospital options with: name, distance, cashless status under user's policy, and available specialty facilities. | P0 |
| **Step 3: Ambulance & Hospital Pre-Alert (60–90 seconds)** | | |
| FR-4.6 | On user confirmation, the system shall initiate ambulance dispatch via 108 government ambulance or private aggregator API. | P0 |
| FR-4.7 | The system shall send a pre-arrival digital brief to the selected hospital containing: patient insurance details, policy number, TPA contact, known medical history (from Family Health Vault), nature and severity of emergency, and estimated arrival time. | P0 |
| **Step 4: Bedside Companion (During Hospitalization)** | | |
| FR-4.8 | The system shall answer real-time coverage questions during hospitalization (e.g., "Doctor ne MRI aur 3 din ICU bola hai. Ye covered hai?") by checking against the parsed policy, including sub-limits, co-pays, and room rent caps. | P0 |
| FR-4.9 | The system shall proactively identify cost-saving opportunities (e.g., Restore Benefit, shared room options, in-network alternatives). | P1 |
| **Step 5: Claims Documentation Assistant (Post-Treatment)** | | |
| FR-4.10 | The system shall generate an insurer-specific claim checklist (each insurer has different documentation requirements). | P0 |
| FR-4.11 | The system shall remind users to collect discharge summary, itemized bill, prescription copies, and diagnostic reports before leaving the hospital. | P0 |
| FR-4.12 | The system shall pre-fill claim forms with known data from the user profile and parsed policy. | P1 |
| FR-4.13 | The system shall track claim status and send progress alerts. | P1 |
| FR-4.14 | If claim is delayed beyond insurer's SLA, the system shall generate an escalation letter. | P2 |

### 2.5 Claim Rejection Fighter

| ID | Requirement | Priority |
|----|------------|----------|
| FR-5.1 | The system shall analyze claim rejection reasons against IRDAI guidelines and the user's specific policy terms. | P0 |
| FR-5.2 | The system shall identify whether a rejection is valid or contestable. | P0 |
| FR-5.3 | The system shall draft a formal grievance letter with relevant IRDAI circular references and policy clause citations. | P0 |
| FR-5.4 | The system shall guide the user through the escalation path: insurer grievance cell -> IRDAI IGMS portal -> Insurance Ombudsman. | P1 |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|----|------------|--------|
| NFR-1.1 | Emergency mode end-to-end response (triage to hospital recommendation) | < 90 seconds |
| NFR-1.2 | Voice note transcription latency | < 3 seconds |
| NFR-1.3 | Policy PDF parsing and Coverage Card generation | < 30 seconds |
| NFR-1.4 | Card insurance discovery and Hidden Coverage Card generation | < 5 seconds |
| NFR-1.5 | Natural language Q&A response time | < 5 seconds |
| NFR-1.6 | Database read latency (DynamoDB) | Single-digit milliseconds |

### 3.2 Scalability

| ID | Requirement |
|----|------------|
| NFR-2.1 | The system shall support 500M+ potential WhatsApp users in India. |
| NFR-2.2 | The system shall use serverless auto-scaling (AWS Lambda) to handle emergency load spikes. |
| NFR-2.3 | Hospital network mappings shall be pre-computed and updated daily to avoid real-time computation bottlenecks. |

### 3.3 Security & Privacy

| ID | Requirement |
|----|------------|
| NFR-3.1 | All health data shall be encrypted at rest using AWS KMS (AES-256). |
| NFR-3.2 | All data in transit shall use TLS 1.3 encryption. |
| NFR-3.3 | The system shall comply with India's Digital Personal Data Protection (DPDP) Act 2023: explicit consent, purpose limitation, data minimization, right to erasure. |
| NFR-3.4 | Raw policy PDFs shall be deleted after parsing — only structured extracted data retained. |
| NFR-3.5 | Users shall be able to request complete data deletion at any time. |
| NFR-3.6 | The system shall never store or transmit card numbers, CVVs, or banking credentials. Only card type/name is used for benefit lookup. |

### 3.4 Language & Accessibility

| ID | Requirement |
|----|------------|
| NFR-4.1 | The system shall support voice input and text input in Hindi, English, and Hinglish (code-mixed). |
| NFR-4.2 | The system shall support regional languages: Tamil, Telugu, Bengali, Marathi (Phase 1), with expansion to 8+ languages. |
| NFR-4.3 | All output shall be available in the user's preferred vernacular language. |
| NFR-4.4 | The system shall handle panicked, emotionally charged, and fragmented speech during emergencies. |

### 3.5 Reliability & Availability

| ID | Requirement |
|----|------------|
| NFR-5.1 | The emergency mode (BimaRakshak) shall target 99.9% uptime. |
| NFR-5.2 | CloudWatch alarms shall trigger if emergency response exceeds 3-second SLA at any stage. |
| NFR-5.3 | The system shall degrade gracefully — if one agent fails, others continue operating. |

### 3.6 Compliance & Legal

| ID | Requirement |
|----|------------|
| NFR-6.1 | The system shall provide ZERO medical advice. Triage classifies emergency type for hospital specialty matching only. |
| NFR-6.2 | All medical decisions remain with doctors. The system shall include explicit disclaimers. |
| NFR-6.3 | Card benefit information shall be presented with "verify with your bank" disclaimers. |
| NFR-6.4 | Policy parsing below 85% confidence shall flag the clause and ask the user to verify. |
| NFR-6.5 | High-value card insurance claims shall be flagged with direct bank helpline numbers. |

---

## 4. Data Requirements

### 4.1 Data Sources (All Publicly Available)

| Data Type | Source | Access Method |
|-----------|--------|---------------|
| Hospital network data | NHA hospital registry, state health department databases, Google Maps Places API | Public APIs / scraping |
| Insurer network lists | Published by every insurer on their website (IRDAI mandated) | Public / structured ingestion |
| IRDAI regulations & circulars | irdai.gov.in — regulations, master circulars, consumer guidelines | Public |
| Insurance policy documents | User-uploaded (their own policy PDFs) | User-provided |
| Credit/debit card benefits | Bank websites, card brochures, terms & conditions documents | Public |
| Ayushman Bharat eligibility | PM-JAY beneficiary eligibility API | Government API |
| Medical cost benchmarks | CGHS rate lists, NHA package rates | Public |
| Drug formularies | Published insurer formulary lists | Public |

### 4.2 User Data Stored

| Data | Purpose | Retention |
|------|---------|-----------|
| Card type/name (NOT card numbers) | Hidden insurance discovery | Until user deletes |
| Parsed policy data (structured) | Coverage Q&A, emergency matching | Until user deletes |
| Family medical history | Emergency pre-alerts, coverage checks | Until user deletes |
| Conversation history | Context for multi-turn interactions | 90 days rolling |
| Location data (during emergency) | Hospital proximity matching | Session only — not persisted |

---

## 5. User Stories

### 5.1 Hidden Insurance Discovery

> **As a** credit card holder,
> **I want to** type my card name into WhatsApp and instantly see all insurance benefits bundled with my card,
> **So that** I can discover and use coverage I'm already paying for but didn't know existed.

> **As a** user with multiple cards,
> **I want to** see my combined hidden insurance portfolio across all my cards,
> **So that** I understand my total coverage and can identify gaps.

### 5.2 Insurance Advisory (Uninsured)

> **As an** uninsured individual,
> **I want to** have a simple conversation in Hindi about my family's situation and get personalized insurance recommendations,
> **So that** I can understand what coverage I need without navigating complex comparison websites.

> **As a** low-income user,
> **I want to** check if I qualify for Ayushman Bharat (PM-JAY),
> **So that** I can access free government health coverage if eligible.

### 5.3 Policy Understanding (Insured)

> **As an** insured person,
> **I want to** upload my policy PDF and get a simple one-screen summary of what's covered and what's not,
> **So that** I don't have to read 60+ pages of legal jargon.

> **As an** insured person,
> **I want to** ask questions about my coverage in my own language (e.g., "Meri policy mein knee replacement covered hai kya?"),
> **So that** I can make informed decisions about medical treatments.

### 5.4 Emergency Response

> **As a** family member in a medical emergency,
> **I want to** send a panicked voice note in Hindi and get the nearest cashless hospital with the right specialty within 90 seconds,
> **So that** my loved one gets treatment at the right hospital without unnecessary out-of-pocket costs.

> **As a** patient admitted to a hospital,
> **I want to** ask BimaSetu whether a recommended procedure is covered under my policy,
> **So that** I can understand my financial exposure before agreeing to treatment.

### 5.5 Claims Support

> **As a** policyholder filing a claim,
> **I want to** get an insurer-specific checklist of required documents and pre-filled claim forms,
> **So that** my claim is not rejected due to missing paperwork.

> **As a** policyholder whose claim was rejected,
> **I want to** get an AI analysis of whether the rejection is contestable and a drafted grievance letter,
> **So that** I can fight back against invalid rejections with proper IRDAI references.

---

## 6. Platform Requirements

| Requirement | Detail |
|-------------|--------|
| Primary interface | WhatsApp Business API |
| Input types | Text, voice notes, PDF uploads, image uploads (photographed documents) |
| Output types | Text messages, visual cards (images), voice responses, document attachments |
| No app download required | Entire experience runs within WhatsApp |
| Device support | Any smartphone or feature phone with WhatsApp |

---

## 7. Phased Feature Rollout

### Phase 1 — MVP (Hackathon)
- Hidden Insurance Discovery for top 20 cards
- Policy PDF parsing for top 5 insurers
- Hindi voice triage and emergency hospital matching (Delhi NCR)
- Coverage Q&A against parsed policy
- Claim rejection analysis and grievance letter generation

### Phase 2 — Pilot
- Expand to top 50 cards and top 10 insurers
- Live ambulance API integration
- Hospital pre-alert pilot (50 hospitals, Delhi NCR)
- Card issuer partnership pilot (1–2 banks)
- Beta with 10,000 users

### Phase 3 — National Rollout
- All 33+ insurers, 200+ card variants
- 8 regional languages
- Pan-India hospital coverage
- Insurer API integrations for claim tracking
- IRDAI distribution license

### Phase 4 — Ecosystem Integration
- Bima Sugam API integration
- ABHA (Ayushman Bharat Health Account) sync
- WhatsApp Pay integration for premium/claim payments
- Predictive health alerts
- International expansion (Southeast Asia, Africa, Latin America)
