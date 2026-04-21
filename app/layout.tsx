import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { SocketProvider } from "@/context/socket-context"
import { NotificationProvider } from "@/context/notification-context"
import { Toaster } from "@/components/ui/toaster"
// import { ThemeProvider } from "@/components/theme-provider" // Removed duplicate import
import { cn } from "@/lib/utils"

// Añadir estas importaciones
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Cargar dinámicamente componentes no críticos
const ThemeProvider = dynamic(() => import("@/components/theme-provider").then((mod) => mod.ThemeProvider), {
  ssr: true,
})

// Cargar dinámicamente el contexto de notificaciones
// const NotificationProvider = dynamic(
//   () => import("@/context/notification-context").then((mod) => mod.NotificationProvider),
//   { ssr: false },
// )

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "PartyHub - Gestión de Eventos y Venta de Entradas",
    template: "%s | PartyHub",
  },
  description: "Organiza tus fiestas y gestiona la venta de entradas de forma sencilla y eficiente",
  keywords: ["eventos", "fiestas", "entradas", "tickets", "gestión", "organizador", "venta"],
  authors: [{ name: "PartyHub Team" }],
  creator: "PartyHub",
  publisher: "PartyHub",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://partyhub.com",
    title: "PartyHub - Gestión de Eventos y Venta de Entradas",
    description: "Organiza tus fiestas y gestiona la venta de entradas de forma sencilla y eficiente",
    siteName: "PartyHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "PartyHub - Gestión de Eventos y Venta de Entradas",
    description: "Organiza tus fiestas y gestiona la venta de entradas de forma sencilla y eficiente",
    creator: "@partyhub",
  },
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },
  // manifest: "/site.webmanifest",
}

// En el componente RootLayout, modificar para usar Suspense
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="bg-[#020202]">
      <body className={cn("min-h-screen bg-[#020202] font-sans antialiased text-white")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Suspense fallback={<div className="p-8">Cargando...</div>}>
            
                <SocketProvider>
                  <NotificationProvider>
                    {children}
                    <div className="relative z-[9999]">
                      <Toaster />
                    </div>
                  </NotificationProvider>
                </SocketProvider>
           
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
