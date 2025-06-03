"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, QrCode, Search, UserCheck } from "lucide-react"
import Link from "next/link"
import { checkOrganizer } from "@/services/party-service"
import { Skeleton } from "@/components/ui/skeleton"
import { LazyQRScanner } from "@/components/lazy-components"
import type { Ticket } from "@/types/ticket"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"

export default function CheckInPage({ params }: { params: { id: string } }) {
  const [partyName, setPartyName] = useState<string>("")
  const [isOrganizer, setIsOrganizer] = useState(false);

  const [isLoading, setIsLoading] = useState(true)
  const [recentCheckins, setRecentCheckins] = useState<Ticket[]>([])
  const {id} = useParams()
  const router = useRouter()

  useEffect(() => {
    async function loadPartyDetails() {
      try {
         const partyDetails = await checkOrganizer(id);

         if (!partyDetails.isOrganizer) {
           router.push("/dashboard");
           return;
         }

      } catch (error) {
        console.error("Error al cargar los detalles de la fiesta:", error)
        if ( error.response?.status === 403) {
          router.replace("/dashboard");
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPartyDetails()
  }, [id])

  const handleSuccessfulCheckin = (ticket: Ticket) => {
    setRecentCheckins((prev) => [ticket, ...prev].slice(0, 5))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Check-in:</h1>
        <Link href={`/dashboard/party/${id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a la fiesta
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Escanear QR
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Búsqueda Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="qr" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <LazyQRScanner partyId={id} onSuccess={handleSuccessfulCheckin} />
            </Suspense>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Check-ins Recientes
                </CardTitle>
                <CardDescription>Últimos asistentes que ingresaron al evento</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCheckins.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Aún no se han registrado ingresos en esta sesión
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentCheckins.map((ticket) => (
                      <Card key={ticket.id} className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {ticket.full_name || ticket.customerName || "Asistente"}
                            </p>
                            <p className="text-sm text-muted-foreground">{ticket.batchName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{new Date().toLocaleTimeString()}</p>
                            <p className="text-xs text-muted-foreground">Check-in exitoso</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda Manual</CardTitle>
              <CardDescription>
                Busca asistentes por nombre, email o número de documento para realizar el check-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Funcionalidad de búsqueda manual en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
