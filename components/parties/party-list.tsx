"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { getParties } from "@/services/party-service"
import type { Party } from "@/types/party"
import { EmptyState } from "@/components/ui/empty-state"
import { CalendarPlus } from "lucide-react"
import { CreatePartyButton } from "./create-party-button"
import { JoinPartyButton } from "./join-party-button"

const PartyCard = memo(({ party }: { party: Party }) => (
  <Card key={party.id}>
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle>{party.name}</CardTitle>
        <Badge variant={party.role === "organizer" ? "default" : "secondary"}>
          {party.role === "organizer" ? "Organizador" : "Vendedor"}
        </Badge>
      </div>
      <CardDescription>
        <div className="flex items-center gap-1 mt-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(party.date).toLocaleDateString()}</span>
        </div>
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{party.location}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{party.ticketsSold} entradas vendidas</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full">
        <Link href={`/dashboard/party/${party.id}`}>Gestionar</Link>
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
      // Asegurarse de que data sea un array
      setParties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar las fiestas:", error)
      setParties([]) // Establecer un array vacío en caso de error
    } finally {
      setIsLoading(false)
    }
  }, [])


  useEffect(() => {
    loadParties()
  }, [loadParties])

  // useEffect(() => {
  //   async function loadParties() {
  //     try {
  //       const data = await getParties()
  //       // Asegurarse de que data sea un array
  //       setParties(Array.isArray(data) ? data : [])
  //       console.log(data)
  //     } catch (error) {
  //       console.error("Error al cargar las fiestas:", error)
  //       setParties([]) // Establecer un array vacío en caso de error
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   loadParties()
  // }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (parties.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlus className="h-12 w-12 text-muted-foreground" />}
        title="No tienes fiestas"
        description="Crea una nueva fiesta o únete a una existente con un código de invitación"
        action={
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <CreatePartyButton />
            <JoinPartyButton />
          </div>
        }
      />
    )
  }

  if (!Array.isArray(parties)) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle>Error al cargar las fiestas</CardTitle>
          <CardDescription>Hubo un problema al obtener tus fiestas. Intenta recargar la página.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parties.map((party) => (
      <PartyCard key={party.id} party={party} />
      ))}
    </div>
  )
}
