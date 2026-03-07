export interface CardBenefits {
  cardName: string
  bankName: string
  cardType: string
  airAccident: number // INR in lakhs
  personalAccident: number
  travelInsurance: number
  purchaseProtection: number
  lostCardLiability: number
  emergencyMedical: number
  totalHiddenValue: number
  keyAlerts: string[]
}

export const CARD_KNOWLEDGE_BASE: Record<string, CardBenefits> = {
  "hdfc regalia": {
    cardName: "HDFC Regalia",
    bankName: "HDFC Bank",
    cardType: "Premium Travel",
    airAccident: 1000, // 1 Crore
    personalAccident: 50,
    travelInsurance: 15,
    purchaseProtection: 2,
    lostCardLiability: 3,
    emergencyMedical: 25,
    totalHiddenValue: 1095,
    keyAlerts: [
      "Air accident cover only for tickets purchased on card",
      "Travel insurance valid for international trips booked via card",
      "Purchase protection limited to 90 days from purchase"
    ]
  },
  "hdfc diners black": {
    cardName: "HDFC Diners Black",
    bankName: "HDFC Bank",
    cardType: "Super Premium",
    airAccident: 2000,
    personalAccident: 100,
    travelInsurance: 50,
    purchaseProtection: 5,
    lostCardLiability: 9,
    emergencyMedical: 50,
    totalHiddenValue: 2214,
    keyAlerts: [
      "Highest air accident cover among Indian cards",
      "Golf accident insurance included",
      "Comprehensive travel insurance for entire trip"
    ]
  },
  "sbi elite": {
    cardName: "SBI Elite",
    bankName: "State Bank of India",
    cardType: "Premium Lifestyle",
    airAccident: 150,
    personalAccident: 50,
    travelInsurance: 10,
    purchaseProtection: 1,
    lostCardLiability: 1,
    emergencyMedical: 10,
    totalHiddenValue: 222,
    keyAlerts: [
      "Air accident cover for supplementary cardholders too",
      "Fraud liability waiver up to Rs 1 lakh"
    ]
  },
  "sbi prime": {
    cardName: "SBI Prime",
    bankName: "State Bank of India",
    cardType: "Premium Rewards",
    airAccident: 50,
    personalAccident: 20,
    travelInsurance: 5,
    purchaseProtection: 0.5,
    lostCardLiability: 1,
    emergencyMedical: 5,
    totalHiddenValue: 81.5,
    keyAlerts: [
      "Personal accident cover requires card to be active",
      "Travel insurance for international travel only"
    ]
  },
  "icici sapphiro": {
    cardName: "ICICI Sapphiro",
    bankName: "ICICI Bank",
    cardType: "Super Premium",
    airAccident: 300,
    personalAccident: 100,
    travelInsurance: 25,
    purchaseProtection: 3,
    lostCardLiability: 5,
    emergencyMedical: 25,
    totalHiddenValue: 458,
    keyAlerts: [
      "Travel insurance includes trip cancellation up to Rs 10,000",
      "Purchase protection covers theft and accidental damage"
    ]
  },
  "axis magnus": {
    cardName: "Axis Magnus",
    bankName: "Axis Bank",
    cardType: "Super Premium Travel",
    airAccident: 500,
    personalAccident: 100,
    travelInsurance: 30,
    purchaseProtection: 2,
    lostCardLiability: 5,
    emergencyMedical: 30,
    totalHiddenValue: 667,
    keyAlerts: [
      "Complimentary golf sessions at partner courses",
      "Emergency hospitalization cover while traveling abroad",
      "Lost baggage cover up to Rs 50,000"
    ]
  },
  "amex platinum": {
    cardName: "Amex Platinum",
    bankName: "American Express",
    cardType: "Charge Card - Ultra Premium",
    airAccident: 1000,
    personalAccident: 200,
    travelInsurance: 100,
    purchaseProtection: 10,
    lostCardLiability: 10,
    emergencyMedical: 100,
    totalHiddenValue: 1420,
    keyAlerts: [
      "Purchase protection covers up to Rs 2.5 lakh per claim",
      "Travel insurance covers up to 90 days per trip",
      "Return protection allows returns even if merchant refuses"
    ]
  },
  "indusind pinnacle": {
    cardName: "IndusInd Pinnacle",
    bankName: "IndusInd Bank",
    cardType: "Ultra Premium",
    airAccident: 2500,
    personalAccident: 100,
    travelInsurance: 40,
    purchaseProtection: 3,
    lostCardLiability: 5,
    emergencyMedical: 40,
    totalHiddenValue: 2688,
    keyAlerts: [
      "Highest air accident cover in India at Rs 2.5 Cr",
      "Personal concierge available 24/7",
      "International lounge access unlimited"
    ]
  },
  "yes first exclusive": {
    cardName: "YES First Exclusive",
    bankName: "YES Bank",
    cardType: "Super Premium",
    airAccident: 300,
    personalAccident: 50,
    travelInsurance: 25,
    purchaseProtection: 2,
    lostCardLiability: 3,
    emergencyMedical: 25,
    totalHiddenValue: 405,
    keyAlerts: [
      "Travel insurance for international trips booked via YATRA",
      "Emergency hospitalization while abroad covered"
    ]
  },
  "kotak royale signature": {
    cardName: "Kotak Royale Signature",
    bankName: "Kotak Mahindra Bank",
    cardType: "Premium",
    airAccident: 25,
    personalAccident: 10,
    travelInsurance: 5,
    purchaseProtection: 0.5,
    lostCardLiability: 1,
    emergencyMedical: 5,
    totalHiddenValue: 46.5,
    keyAlerts: [
      "Air accident cover for economy class tickets",
      "Personal accident cover for primary cardholder only"
    ]
  },
  "hdfc millennia": {
    cardName: "HDFC Millennia",
    bankName: "HDFC Bank",
    cardType: "Entry Premium",
    airAccident: 30,
    personalAccident: 10,
    travelInsurance: 2,
    purchaseProtection: 0.5,
    lostCardLiability: 1,
    emergencyMedical: 0,
    totalHiddenValue: 43.5,
    keyAlerts: [
      "Air accident cover Rs 30 lakh - underutilized by most",
      "Zero lost card liability if reported within 3 days"
    ]
  },
  "sbi simplycash": {
    cardName: "SBI SimplyCash",
    bankName: "State Bank of India",
    cardType: "Cashback",
    airAccident: 0,
    personalAccident: 2,
    travelInsurance: 0,
    purchaseProtection: 0,
    lostCardLiability: 1,
    emergencyMedical: 0,
    totalHiddenValue: 3,
    keyAlerts: ["Limited insurance benefits on this entry-level card"]
  },
  "icici amazon pay": {
    cardName: "ICICI Amazon Pay",
    bankName: "ICICI Bank",
    cardType: "Co-branded Cashback",
    airAccident: 10,
    personalAccident: 5,
    travelInsurance: 0,
    purchaseProtection: 1,
    lostCardLiability: 1,
    emergencyMedical: 0,
    totalHiddenValue: 17,
    keyAlerts: [
      "Purchase protection for Amazon purchases only",
      "Fraud liability cover up to Rs 1 lakh"
    ]
  },
  "axis flipkart": {
    cardName: "Axis Flipkart",
    bankName: "Axis Bank",
    cardType: "Co-branded Cashback",
    airAccident: 10,
    personalAccident: 5,
    travelInsurance: 0,
    purchaseProtection: 1,
    lostCardLiability: 1,
    emergencyMedical: 0,
    totalHiddenValue: 17,
    keyAlerts: [
      "Basic insurance benefits",
      "Zero lost card liability if reported within 7 days"
    ]
  },
  "rbl world safari": {
    cardName: "RBL World Safari",
    bankName: "RBL Bank",
    cardType: "Premium Travel",
    airAccident: 100,
    personalAccident: 25,
    travelInsurance: 15,
    purchaseProtection: 1,
    lostCardLiability: 2,
    emergencyMedical: 15,
    totalHiddenValue: 158,
    keyAlerts: [
      "Travel insurance requires trip booking via card",
      "International emergency medical evacuation covered"
    ]
  },
  "citi prestige": {
    cardName: "Citi Prestige",
    bankName: "Citibank",
    cardType: "Ultra Premium",
    airAccident: 500,
    personalAccident: 100,
    travelInsurance: 50,
    purchaseProtection: 5,
    lostCardLiability: 5,
    emergencyMedical: 50,
    totalHiddenValue: 710,
    keyAlerts: [
      "Unlimited airport lounge access globally",
      "Fourth night hotel stay complimentary",
      "Comprehensive travel insurance for family"
    ]
  },
  "hdfc infinia": {
    cardName: "HDFC Infinia",
    bankName: "HDFC Bank",
    cardType: "Invite-only Super Premium",
    airAccident: 3000,
    personalAccident: 200,
    travelInsurance: 75,
    purchaseProtection: 5,
    lostCardLiability: 9,
    emergencyMedical: 75,
    totalHiddenValue: 3364,
    keyAlerts: [
      "Rs 3 Crore air accident cover - highest among HDFC cards",
      "Comprehensive family travel insurance",
      "Unlimited domestic and international lounge access"
    ]
  },
  "standard chartered ultimate": {
    cardName: "Standard Chartered Ultimate",
    bankName: "Standard Chartered",
    cardType: "Premium Travel",
    airAccident: 100,
    personalAccident: 25,
    travelInsurance: 20,
    purchaseProtection: 1,
    lostCardLiability: 2,
    emergencyMedical: 20,
    totalHiddenValue: 168,
    keyAlerts: [
      "1% forex mark-up waiver saves on international spends",
      "Travel insurance for international trips via card"
    ]
  },
  "bob eterna": {
    cardName: "BOB Eterna",
    bankName: "Bank of Baroda",
    cardType: "Premium",
    airAccident: 50,
    personalAccident: 15,
    travelInsurance: 8,
    purchaseProtection: 0.5,
    lostCardLiability: 1,
    emergencyMedical: 8,
    totalHiddenValue: 82.5,
    keyAlerts: [
      "Complimentary domestic airport lounge access",
      "Travel insurance valid for trips booked via card"
    ]
  },
  "idfc first wealth": {
    cardName: "IDFC FIRST Wealth",
    bankName: "IDFC FIRST Bank",
    cardType: "Premium Lifestyle",
    airAccident: 100,
    personalAccident: 30,
    travelInsurance: 15,
    purchaseProtection: 1,
    lostCardLiability: 2,
    emergencyMedical: 15,
    totalHiddenValue: 163,
    keyAlerts: [
      "Zero annual fee premium card",
      "Comprehensive travel insurance on international trips",
      "Personal accident cover active from day 1"
    ]
  }
}

export function findCard(query: string): CardBenefits | null {
  const normalized = query.toLowerCase().trim()

  // Direct match
  if (CARD_KNOWLEDGE_BASE[normalized]) {
    return CARD_KNOWLEDGE_BASE[normalized]
  }

  // Partial match
  for (const [key, value] of Object.entries(CARD_KNOWLEDGE_BASE)) {
    if (key.includes(normalized) || normalized.includes(key) ||
        value.cardName.toLowerCase().includes(normalized)) {
      return value
    }
  }

  return null
}
