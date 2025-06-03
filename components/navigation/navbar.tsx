"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Navbar() {
  const { logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "Mis Fiestas",
      active: pathname === "/dashboard",
    },
    // {
    //   href: "/dashboard/join",
    //   label: "Unirse a Fiesta",
    //   active: pathname === "/dashboard/join",
    // },    
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      active: pathname.includes("/dashboard/notifications"),
    },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      active: pathname.includes("/dashboard/settings"),
    },
  
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl">
            PartyHub
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
        <button className="flex items-center justify-center md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="justify-start px-0">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
