import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white -z-10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          AI-Powered Insurance Intelligence
        </Badge>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Discover{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            ₹1 Crore
          </span>{" "}
          in Insurance
          <br />
          You Didn&apos;t Know You Had
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Most Indians are sitting on lakhs of rupees in unused insurance benefits hidden in their
          credit cards and policies. BimaSetu reveals, simplifies, and activates it all — in
          minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6 text-lg"
          >
            <Link href="/signup">
              Discover My Coverage
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Free to use · No credit card required · Your data is private
        </p>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "₹3.2 Cr", label: "Avg. hidden coverage found" },
            { value: "20+", label: "Credit cards supported" },
            { value: "2 min", label: "To discover your coverage" }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
