"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "aws-amplify/auth"
import { cn } from "@/lib/utils"
import { Shield, LayoutDashboard, CreditCard, FileText, MessageSquare, User, LogOut, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cards", icon: CreditCard, label: "Card Discovery" },
  { href: "/policies", icon: FileText, label: "My Policies" },
  { href: "/chat", icon: MessageSquare, label: "BimaSalah" },
  { href: "/claims", icon: AlertCircle, label: "Claim Center" },
  { href: "/profile", icon: User, label: "Profile" }
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  async function handleSignOut() {
    try {
      await signOut()
      router.push("/login")
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" })
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold">BimaSetu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-gray-700 pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
