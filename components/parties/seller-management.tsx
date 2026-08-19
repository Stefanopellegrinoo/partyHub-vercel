"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getPartySellers, removePartySeller } from "@/services/party-service"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserMinus, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

interface PartySeller {
  id: string
  userId: string
  name: string
  email: string
  joinedAt: string
  ticketsSold: number
  revenue: number
  lastActive?: string
}

export function SellerManagement({ partyId }: { partyId: string }) {
  const [sellers, setSellers] = useState<PartySeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeller, setSelectedSeller] = useState<PartySeller | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSellers()
  }, [partyId])

  async function loadSellers() {
    try {
      setIsLoading(true)
      const data = await getPartySellers(partyId)
      setSellers(data)
    } catch (error) {
      console.error("Error loading sellers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los vendedores de la fiesta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSeller = async () => {
    if (!selectedSeller) return

    setIsProcessing(true)
    try {
      await removePartySeller(partyId, selectedSeller.seller_id)
      setSellers(sellers.filter((s) => s.seller_id !== selectedSeller.seller_id))
      toast({
        title: "Vendedor eliminado",
        description: `${selectedSeller.name} ha sido eliminado de la fiesta`,
      })
      setShowRemoveDialog(false)
    } catch (error) {
      console.error("Error removing seller:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el vendedor. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const columns: ColumnDef<PartySeller>[] = [
    {
      accessorKey: "seller_name",
      header: "Nombre",
    },
    {
      accessorKey: "seller_email",
      header: "Correo electrónico",
    },
    // {
    //   accessorKey: "joinedAt",
    //   header: "Fecha de unión",
    //   cell: ({ row }) => formatDate(row.getValue("joinedAt")),
    // },
    // {
    //   accessorKey: "ticketsSold",
    //   header: "Entradas vendidas",
    //   cell: ({ row }) => {
    //     const ticketsSold = row.getValue("ticketsSold") as number
    //     return <Badge variant={ticketsSold > 0 ? "default" : "outline"}>{ticketsSold}</Badge>
    //   },
    // },
    // {
    //   accessorKey: "revenue",
    //   header: "Ingresos",
    //   cell: ({ row }) => {
    //     const revenue = row.getValue("revenue") as number
    //     return new Intl.NumberFormat("es-AR", {
    //       style: "currency",
    //       currency: "ARS",
    //     }).format(revenue)
    //   },
    // },
    // {
    //   accessorKey: "lastActive",
    //   header: "Última actividad",
    //   cell: ({ row }) => {
    //     const lastActive = row.getValue("lastActive") as string
    //     return lastActive ? formatDate(lastActive) : "No disponible"
    //   },
    // },
    {
      id: "actions",
      cell: ({ row }) => {
        const seller = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSeller(seller)
                  setShowRemoveDialog(true)
                }}
                className="text-destructive"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Eliminar vendedor</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return <div>Cargando vendedores...</div>
  }

  return (
    <div className="space-y-4">
      {sellers.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sin vendedores</AlertTitle>
          <AlertDescription>
            No hay vendedores en esta fiesta. Comparte el código de invitación para agregar vendedores.
          </AlertDescription>
        </Alert>
      ) : (
        <DataTable columns={columns} data={sellers} searchColumn="name" searchPlaceholder="Buscar vendedor..." />
      )}

      {/* Diálogo de confirmación para eliminar vendedor */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar vendedor</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedSeller?.seller_name} como vendedor de la fiesta? Esta acción no
              se puede deshacer.
              {selectedSeller?.ticketsSold ? (
                <Alert className="mt-4" variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>
                    Este vendedor ha vendido {selectedSeller.ticketsSold} entradas. Al eliminarlo, perderás la
                    referencia de quién vendió estas entradas.
                  </AlertDescription>
                </Alert>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveSeller} disabled={isProcessing}>
              {isProcessing ? "Eliminando..." : "Eliminar vendedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
