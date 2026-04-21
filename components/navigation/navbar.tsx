"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, Menu, X, Zap, Bell, Settings as SettingsIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "FIESTAS",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/notifications",
      label: "AVISOS",
      active: pathname.includes("/dashboard/notifications"),
      icon: Bell
    },
    {
      href: "/dashboard/settings",
      label: "AJUSTES",
      active: pathname.includes("/dashboard/settings"),
      icon: SettingsIcon
    },
  ]

  return (
    <header className="sticky top-0 z-[120] w-full border-b border-white/5 bg-black">
      <div className="container flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#7c3aed] flex items-center justify-center rounded-sm rotate-[-10deg] group-hover:rotate-0 transition-transform shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">PartyHub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#7c3aed]",
                  route.active ? "text-[#7c3aed]" : "text-zinc-500",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/5 font-bold uppercase tracking-widest text-[10px]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>

        <button 
          className="flex items-center justify-center md:hidden w-10 h-10 bg-white/5 rounded-full" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5 text-[#7c3aed]" /> : <Menu className="h-5 w-5 text-zinc-400" />}
        </button>
      </div>

      {/* --- MOBILE NAV --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-20 z-[130] bg-black p-6 md:hidden animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-8">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-4xl font-black uppercase tracking-tighter italic",
                  route.active ? "text-[#7c3aed]" : "text-zinc-800",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            <div className="mt-auto pt-12 border-t border-white/5">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={logout} 
                className="w-full justify-start px-0 text-red-500 font-black uppercase tracking-widest italic"
              >
                <LogOut className="h-6 w-6 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
