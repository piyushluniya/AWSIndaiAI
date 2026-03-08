"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">BimaSetu</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#features" className="hover:text-gray-900 transition-colors">
          Features
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <Link href="/signup">Get Started Free</Link>
        </Button>
      </div>
    </nav>
  )
}
