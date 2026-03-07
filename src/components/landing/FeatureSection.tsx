import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, FileText, MessageSquare, ShieldCheck, Search } from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Card Discovery",
    emoji: "💳",
    description:
      "Enter your credit card name and instantly reveal hidden insurance benefits worth lakhs — air accident, travel insurance, purchase protection and more.",
    highlight: "Up to ₹3 Cr per card",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: FileText,
    title: "BimaGuru — Policy Parser",
    emoji: "📄",
    description:
      "Upload your health or life insurance PDF. Our AI uses AWS Textract + Claude to extract every coverage detail, exclusion, and waiting period in seconds.",
    highlight: "PDF → Insight in 60s",
    color: "from-green-500 to-green-600"
  },
  {
    icon: MessageSquare,
    title: "BimaSalah — AI Chat",
    emoji: "🤖",
    description:
      "Ask anything about your coverage. 'Will my policy cover knee replacement?' 'What is my ICU limit?' Get precise, clause-cited answers in plain Hindi/English.",
    highlight: "Powered by Claude AI",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: ShieldCheck,
    title: "BimaRakshak — Coverage Guard",
    emoji: "🛡️",
    description:
      "Real-time alerts when a coverage is about to expire, renewal reminders, and proactive notifications when a new benefit becomes active.",
    highlight: "Never miss a benefit",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Search,
    title: "BimaCheck — Claim Analyzer",
    emoji: "🔍",
    description:
      "Before filing a claim, run it through BimaCheck. Understand exact payable amounts, required documents, time limits, and the fastest claim route.",
    highlight: "Maximize claim success",
    color: "from-rose-500 to-rose-600"
  }
]

export default function FeatureSection() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to own your insurance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            BimaSetu brings together card benefits discovery, policy parsing, and AI-powered
            coverage Q&A in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(0, 3).map((feature) => (
            <Card
              key={feature.title}
              className="border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="pt-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl mb-2">{feature.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border">
                  {feature.highlight}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-2xl mx-auto lg:max-w-none lg:grid-cols-2">
          {features.slice(3).map((feature) => (
            <Card
              key={feature.title}
              className="border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="pt-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl mb-2">{feature.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border">
                  {feature.highlight}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
