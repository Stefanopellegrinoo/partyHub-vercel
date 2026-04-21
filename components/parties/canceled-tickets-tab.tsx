"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCanceledPool, injectPooledTicket } from "@/services/party-service"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/hooks/use-socket"
import { RefreshCcw, Loader2, ArrowUpCircle } from "lucide-react"

interface CanceledTicket {
  id: number
  attendee_name: string
  price: number
  canceled_at: string
  original_tanda_id: number
}

export function CanceledTicketsTab({ partyId }: { partyId: string }) {
  const [tickets, setTickets] = useState<CanceledTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInjecting, setIsInjecting] = useState<number | null>(null)
  const { toast } = useToast()
  const socket = useSocket()

  const fetchPool = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const data = await getCanceledPool(partyId)
      setTickets(data)
    } catch (error) {
      console.error("Error fetching canceled pool:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el pool de cancelaciones.",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [partyId, toast])

  useEffect(() => {
    fetchPool()
  }, [fetchPool])

  // Escuchar actualizaciones en tiempo real via Socket.io
  useEffect(() => {
    if (!socket) return

    socket.emit("join-party", partyId)

    socket.on("pool-updated", (data) => {
      console.log("♻️ Pool updated received:", data)
      // Refrescamos la lista sin mostrar el loader principal para no interrumpir al usuario
      fetchPool(false)
    })

    return () => {
      socket.off("pool-updated")
      // Nota: El leave-party lo maneja el Provider o el componente padre si hay varios tabs
    }
  }, [socket, partyId, fetchPool])

  const handleInject = async (ticketId: number) => {
    setIsInjecting(ticketId)
    try {
      await injectPooledTicket(partyId, ticketId.toString())
      toast({
        title: "Cupo inyectado",
        description: "El cupo ha sido transferido a la tanda activa correctamente.",
      })
      // Refresh list
      setTickets(tickets.filter(t => t.id !== ticketId))
    } catch (error: any) {
      console.error("Error injecting ticket:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo inyectar el cupo.",
        variant: "destructive",
      })
    } finally {
      setIsInjecting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pool de Cancelaciones</CardTitle>
          <CardDescription>
            Tickets cancelados de tandas cerradas. Inyectalos en la tanda activa para recuperar el cupo.
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPool} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay tickets cancelados esperando en el pool.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asistente</TableHead>
                <TableHead>Precio Orig.</TableHead>
                <TableHead>Fecha Canc.</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.attendee_name}</TableCell>
                  <TableCell>${ticket.price.toLocaleString()}</TableCell>
                  <TableCell>{new Date(ticket.canceled_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => handleInject(ticket.id)}
                      disabled={isInjecting !== null}
                    >
                      {isInjecting === ticket.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      )}
                      Inyectar Cupo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
