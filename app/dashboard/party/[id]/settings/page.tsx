"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PartySettingsForm } from "@/components/parties/party-settings-form"
import { MembersManagementForm } from "@/components/parties/members-management-form"
import { getPartyDetails } from "@/services/party-service"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PartySettingsPage({ params }: { params: { id: string } }) {
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkRole() {
      try {
        const partyDetails = await getPartyDetails(params.id)
        setIsOrganizer(partyDetails.role === "organizer")
        setIsLoading(false)
      } catch (error) {
        console.error("Error al verificar el rol:", error)
        setIsLoading(false)
      }
    }

    checkRole()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso denegado</AlertTitle>
        <AlertDescription>Solo los organizadores pueden acceder a la configuración de la fiesta.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de la Fiesta</h1>
        <p className="text-muted-foreground">Administra los detalles y miembros de tu fiesta.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Actualiza los detalles básicos de la fiesta.</CardDescription>
            </CardHeader>
            <CardContent>
              <PartySettingsForm partyId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Miembros</CardTitle>
              <CardDescription>Administra los vendedores y organizadores de la fiesta.</CardDescription>
            </CardHeader>
            <CardContent>
              <MembersManagementForm partyId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
