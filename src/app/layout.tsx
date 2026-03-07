import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ConfigureAmplify from "@/components/ConfigureAmplify"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BimaSetu — Your AI Insurance Intelligence Portal",
  description:
    "Discover hidden insurance in your credit cards, parse policies with AI, and get personalized coverage advice in minutes."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplify />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
