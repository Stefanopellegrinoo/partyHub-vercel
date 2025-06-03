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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>
      </div>
    </AuthGuard>
  )
}
