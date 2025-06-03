"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"
import type { Party } from "@/types/party"

interface PartyCardProps {
  party: Party
  role?: "organizer" | "seller" | "attendee"
}

export function PartyCard({ party, role = "attendee" }: PartyCardProps) {
  const isActive = party.status === "active"
  const isPast = new Date(party.date) < new Date()

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        <OptimizedImage
          src={party.image || `/placeholder.svg?height=200&width=400`}
          alt={party.name}
          width={400}
          height={200}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={isActive ? "success" : "destructive"}>{isActive ? "Activa" : "Inactiva"}</Badge>
          {role && (
            <Badge variant="outline" className="ml-2 bg-background/80">
              {role === "organizer" ? "Organizador" : role === "seller" ? "Vendedor" : "Asistente"}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1">{party.name}</CardTitle>
        <CardDescription className="line-clamp-2">{party.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{formatDate(party.date)}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{party.time}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="line-clamp-1">{party.location}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{party.capacity} asistentes</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/dashboard/party/${party.id}`} className="w-full">
          <Button className="w-full" variant={isPast ? "outline" : "default"} disabled={!isActive}>
            {isPast ? "Ver detalles" : "Gestionar"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
