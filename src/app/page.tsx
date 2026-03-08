import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import FeatureSection from "@/components/landing/FeatureSection"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <FeatureSection />

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to discover your hidden coverage?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of Indians who have already uncovered lakhs in insurance they didn&apos;t
            know they had.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
          >
            <Link href="/signup">Start for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold">BimaSetu</span>
          </div>
          <p className="text-sm">© 2025 BimaSetu. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
