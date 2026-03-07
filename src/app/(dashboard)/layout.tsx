import Sidebar from "@/components/dashboard/Sidebar"
import FloatingChatWidget from "@/components/chat/FloatingChatWidget"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <FloatingChatWidget />
    </div>
  )
}
