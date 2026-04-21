"use client";

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight, Zap, Shield, Users, Smartphone, CircleDollarSign, Check } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans selection:bg-[#7c3aed]/40 overflow-x-hidden relative">
      
      {/* --- NOISE OVERLAY --- */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* --- VIOLET GLOWS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/5 blur-[120px] rounded-full" />
      </div>

      {/* --- MINIMAL HEADER --- */}
      <header className="relative z-[110] flex items-center justify-between p-6 md:p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7c3aed] flex items-center justify-center rounded-sm rotate-[-10deg]">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase tracking-[-0.08em]">PartyHub</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold uppercase tracking-widest hover:text-[#7c3aed] transition-colors">Entrar</Link>
          <Button asChild className="hidden sm:flex bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-none rounded-none font-bold uppercase tracking-widest px-8">
            <Link href="/register">Crear</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-[110]">
        
        {/* --- HERO: THE STATEMENT --- */}
        <section className="px-6 py-20 md:px-12 lg:px-24 flex flex-col items-start max-w-[1400px] mx-auto">
          <div className="space-y-4 mb-12">
            <div className="inline-block bg-[#7c3aed]/10 border border-[#7c3aed]/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed]">
              Platform v2.0 // Staging Ready
            </div>
            <h1 className="text-[14vw] md:text-[10vw] lg:text-[150px] font-black leading-[0.8] tracking-[-0.06em] uppercase">
              Chau <br />
              <span className="text-[#7c3aed] italic">Comisión.</span><br />
              Hola Control.
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-end w-full">
            <p className="text-xl md:text-3xl font-medium text-zinc-500 leading-tight max-w-3xl">
              Dejá de regalarle el <span className="text-zinc-200">15% de tus ventas</span> a una ticketera. 
              Gestioná tus amigos, cobrá a tu manera y validá en puerta con tecnología de punta. 
              <span className="text-[#7c3aed] block mt-4">Hecho por organizadores, para organizadores.</span>
            </p>
            
            <div className="flex flex-col gap-4">
              <Button asChild className="h-20 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xl font-black uppercase tracking-tighter rounded-none group">
                <Link href="/register" className="flex items-center justify-between w-full px-6">
                  Armar mi joda
                  <ArrowUpRight className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                {">"} No credit card required. <br />
                {">"} Unlimited sellers included.
              </p>
            </div>
          </div>
        </section>

        {/* --- THE FLOW: MOBILE FIRST CARDS --- */}
        <section className="px-6 py-32 md:px-12 bg-[#050505] border-y border-white/5 overflow-hidden">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-white/5 border border-white/5">
            
            <div className="bg-[#020202] p-8 md:p-12 space-y-6 group hover:bg-[#080808] transition-colors">
              <span className="text-[10px] font-mono text-[#7c3aed]">01 / SELLERS</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Vendedores Reales</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Agregá a tus amigos. Dales permiso para reservar. Cada uno cobra como quiere (Efectivo/Transferencia) y confirma en la app. Trazabilidad total del cash.
              </p>
            </div>

            <div className="bg-[#020202] p-8 md:p-12 space-y-6 group hover:bg-[#080808] transition-colors border-l border-white/5">
              <span className="text-[10px] font-mono text-[#7c3aed]">02 / REAL-TIME</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Cero Sobreventa</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Nuestra arquitectura con Redis bloquea el stock al milisegundo. Si quedan 2 entradas y 50 pibes quieren comprar, solo 2 ganan. El resto rebota.
              </p>
            </div>

            <div className="bg-[#020202] p-8 md:p-12 space-y-6 group hover:bg-[#080808] transition-colors border-l border-white/5">
              <span className="text-[10px] font-mono text-[#7c3aed]">03 / ACCESS</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Puerta Blindada</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Scanner QR ultra veloz optimizado para la oscuridad del boliche. Olvidate de las listas de papel y la gente que se cuela con nombres falsos.
              </p>
            </div>

            <div className="bg-[#020202] p-8 md:p-12 space-y-6 group hover:bg-[#080808] transition-colors border-l border-white/5">
              <span className="text-[10px] font-mono text-[#7c3aed]">04 / DATA</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Reportes Posta</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                ¿Quién vendió más? ¿Qué tanda voló? ¿A qué hora entró la mayoría? Tenés toda la data servida para que tu próxima fiesta sea más rentable.
              </p>
            </div>
          </div>
        </section>

        {/* --- COMPARISON: BRUTALIST STYLE --- */}
        <section className="px-6 py-32 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-20 italic underline decoration-[#7c3aed] decoration-8 underline-offset-[10px]">
            La Verdad.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8 border-l-2 border-red-900/30 pl-8">
              <h4 className="text-red-500 font-bold uppercase tracking-widest text-xs">Lo que te pasa hoy</h4>
              <ul className="space-y-4 text-xl font-medium text-zinc-500">
                <li className="flex gap-3"><span className="text-red-900">/</span> Perdés plata en comisiones de servicio.</li>
                <li className="flex gap-3"><span className="text-red-900">/</span> El Excel tiene 3 versiones distintas.</li>
                <li className="flex gap-3"><span className="text-red-900">/</span> Tu tía te avisó por WhatsApp que pagó pero no la encontrás.</li>
                <li className="flex gap-3"><span className="text-red-900">/</span> En la puerta entran 20 que "son amigos del RRPP".</li>
              </ul>
            </div>

            <div className="space-y-8 border-l-2 border-[#7c3aed] pl-8">
              <h4 className="text-[#7c3aed] font-bold uppercase tracking-widest text-xs">Con PartyHub</h4>
              <ul className="space-y-4 text-xl font-medium text-zinc-100">
                <li className="flex gap-3"><Check className="text-[#7c3aed] w-6 h-6 shrink-0" /> La plata es tuya, el sistema también.</li>
                <li className="flex gap-3"><Check className="text-[#7c3aed] w-6 h-6 shrink-0" /> Un solo panel centralizado y real-time.</li>
                <li className="flex gap-3"><Check className="text-[#7c3aed] w-6 h-6 shrink-0" /> Cada reserva tiene un dueño y un tiempo.</li>
                <li className="flex gap-3"><Check className="text-[#7c3aed] w-6 h-6 shrink-0" /> Scan QR y adentro. Sin excepciones.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- FINAL ACTION: MOBILE OPTIMIZED --- */}
        <section className="px-6 py-24 bg-[#7c3aed] text-black">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center space-y-12">
            <h2 className="text-6xl md:text-[120px] font-black leading-[0.8] tracking-[-0.05em] uppercase">
              PROFESIONALIZÁ <br /> TU JODA.
            </h2>
            <p className="text-xl md:text-3xl font-bold max-w-2xl leading-tight">
              Sumate a los clubes y organizadores que ya recuperaron la soberanía de sus eventos.
            </p>
            <Button asChild size="lg" className="h-24 w-full md:w-auto px-16 bg-black text-[#7c3aed] hover:bg-zinc-900 text-2xl font-black uppercase tracking-tight rounded-none shadow-2xl transition-all active:scale-95">
              <Link href="/register">Empezar ahora</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="p-12 md:p-24 bg-black border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center rounded-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase tracking-[-0.05em]">PartyHub</span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed uppercase tracking-widest font-bold">
              El sistema operativo de la noche independiente. <br />
              Hecho para los que se ensucian las manos.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Legal</h5>
              <ul className="text-xs text-zinc-600 space-y-2 font-bold uppercase tracking-widest">
                <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Social</h5>
              <ul className="text-xs text-zinc-600 space-y-2 font-bold uppercase tracking-widest">
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto mt-24 pt-12 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em]">© 2026 // ALL SYSTEMS GREEN</span>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-ping" />
          </div>
        </div>
      </footer>
    </div>
  )
}
