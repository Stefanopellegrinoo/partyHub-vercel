"use client";

import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import { Zap, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-[#7c3aed]/40 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- NOISE & GLOW --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- BACK LINK --- */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-[#7c3aed] transition-colors z-10">
        <ArrowLeft className="w-4 h-4" />
        Volver al Home
      </Link>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 bg-[#7c3aed] flex items-center justify-center rounded-sm rotate-[-10deg] mb-6">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-[-0.05em] italic">Unite</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">Crear nueva identidad</p>
        </div>

        <div className="bg-[#080808] border border-white/5 border-t-[#7c3aed] border-t-4 p-8 shadow-2xl">
          <RegisterForm />
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              ¿Ya sos parte?{" "}
              <Link href="/login" className="text-[#7c3aed] hover:underline underline-offset-4 ml-1">
                Entrar
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.3em] text-center mt-12">
          © 2026 // NODE ACCESS: GRANTED
        </p>
      </div>
    </main>
  )
}
