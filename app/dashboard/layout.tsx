import type React from "react"
import { Navbar } from "@/components/navigation/navbar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-[#020202]">
        <Navbar />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
