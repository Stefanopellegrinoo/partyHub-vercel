"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowUpRight, Plus, ScanLine } from "lucide-react"
import Link from "next/link"
import { getParties } from "@/services/party-service"
import type { Party } from "@/types/party"
import { EmptyState } from "@/components/ui/empty-state"
import { CreatePartyButton } from "./create-party-button"
import { JoinPartyButton } from "./join-party-button"
import { formatDate } from "@/lib/utils"

const PartyCard = memo(({ party }: { party: Party }) => (
  <Card key={party.id} className="bg-[#080808] border-white/5 overflow-hidden group hover:border-[#7c3aed]/50 transition-all duration-300 rounded-none flex flex-col h-full">
    <CardHeader className="relative pb-0">
      <div className="flex justify-between items-start mb-4">
        <Badge className={party.role === "organizer" ? "bg-[#7c3aed] text-white rounded-none font-black text-[9px] uppercase tracking-widest px-2" : "bg-zinc-800 text-zinc-400 rounded-none font-black text-[9px] uppercase tracking-widest px-2"}>
          {party.role === "organizer" ? "Organizador" : "Vendedor"}
        </Badge>
      </div>
      <CardTitle className="text-3xl font-black uppercase tracking-tighter italic leading-none group-hover:text-[#7c3aed] transition-colors">
        {party.name}
      </CardTitle>
      <CardDescription className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-2">
        {formatDate(party.date)}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="space-y-4 pt-6 flex-1">
      <div className="flex items-center gap-2 text-zinc-500">
        <MapPin className="h-3.5 w-3.5 text-[#7c3aed]" />
        <span className="text-xs font-bold uppercase tracking-wider">{party.location}</span>
      </div>
      <div className="bg-white/5 p-4 flex items-center justify-between border-l-2 border-[#7c3aed]">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Entradas Vendidas</p>
          <p className="text-xl font-black tracking-tighter italic">{party.ticketsSold || 0}</p>
        </div>
        <Users className="h-6 w-6 text-zinc-800" />
      </div>
    </CardContent>

    <CardFooter className="p-0">
      <Button asChild className="w-full h-14 bg-zinc-900 hover:bg-[#7c3aed] text-zinc-400 hover:text-white rounded-none font-black uppercase tracking-tighter italic transition-all group-hover:h-16">
        <Link href={`/dashboard/party/${party.id}`} className="flex items-center justify-center gap-2 w-full">
          Gestionar
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
))
PartyCard.displayName = "PartyCard"

export function PartyList() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const loadParties = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getParties()
      setParties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar las fiestas:", error)
      setParties([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParties()
  }, [loadParties])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-72 bg-white/5 animate-pulse rounded-none border border-white/5" />
        ))}
      </div>
    )
  }

  if (parties.length === 0) {
    return (
      <div className="py-24 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
          <Plus className="h-10 w-10 text-zinc-700" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tighter italic text-zinc-400">Sin Fiestas</h3>
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Todavía no tenés eventos bajo tu control.</p>
        </div>
        <div className="flex gap-4">
          <CreatePartyButton />
          <JoinPartyButton />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {parties.map((party) => (
      <PartyCard key={party.id} party={party} />
      ))}
    </div>
  )
}
