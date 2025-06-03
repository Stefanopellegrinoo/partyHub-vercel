"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getPartyMembers, removePartyMember, updateMemberRole } from "@/services/party-service"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserMinus, UserCog } from "lucide-react"
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
import { AlertCircle } from "lucide-react"

interface PartyMember {
  id: string
  userId: string
  name: string
  email: string
  role: "organizer" | "seller"
}

export function MembersManagementForm({ partyId }: { partyId: string }) {
  const [members, setMembers] = useState<PartyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<PartyMember | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [partyId])

  async function loadMembers() {
    try {
      const data = await getPartyMembers(partyId)
      setMembers(data)
    } catch (error) {
      console.error("Error al cargar los miembros:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros de la fiesta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!selectedMember) return

    setIsProcessing(true)
    try {
      await removePartyMember(partyId, selectedMember.userId)
      setMembers(members.filter((m) => m.userId !== selectedMember.userId))
      toast({
        title: "Miembro eliminado",
        description: `${selectedMember.name} ha sido eliminado de la fiesta`,
      })
      setShowRemoveDialog(false)
    } catch (error) {
      console.error("Error al eliminar el miembro:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChangeRole = async () => {
    if (!selectedMember) return

    const newRole = selectedMember.role === "organizer" ? "seller" : "organizer"

    setIsProcessing(true)
    try {
      await updateMemberRole(partyId, selectedMember.userId, newRole)
      setMembers(
        members.map((m) =>
          m.userId === selectedMember.userId ? { ...m, role: newRole as "organizer" | "seller" } : m,
        ),
      )
      toast({
        title: "Rol actualizado",
        description: `${selectedMember.name} ahora es ${newRole === "organizer" ? "organizador" : "vendedor"}`,
      })
      setShowRoleDialog(false)
    } catch (error) {
      console.error("Error al cambiar el rol:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol del miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const columns: ColumnDef<PartyMember>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Correo electrónico",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "organizer" ? "default" : "secondary"}>
            {role === "organizer" ? "Organizador" : "Vendedor"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original

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
                  setSelectedMember(member)
                  setShowRoleDialog(true)
                }}
              >
                <UserCog className="mr-2 h-4 w-4" />
                <span>Cambiar rol</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMember(member)
                  setShowRemoveDialog(true)
                }}
                className="text-destructive"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return <div>Cargando miembros...</div>
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin miembros</AlertTitle>
          <AlertDescription>
            No hay miembros en esta fiesta. Comparte el código de invitación para agregar vendedores.
          </AlertDescription>
        </Alert>
      ) : (
        <DataTable columns={columns} data={members} searchColumn="name" searchPlaceholder="Buscar miembro..." />
      )}

      {/* Diálogo de confirmación para eliminar miembro */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar miembro</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedMember?.name} de la fiesta? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isProcessing}>
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para cambiar rol */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el rol de {selectedMember?.name} de{" "}
              {selectedMember?.role === "organizer" ? "organizador a vendedor" : "vendedor a organizador"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole} disabled={isProcessing}>
              {isProcessing ? "Cambiando..." : "Cambiar rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
