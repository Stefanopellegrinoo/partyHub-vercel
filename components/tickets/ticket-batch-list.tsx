"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TicketBatch } from "@/types/ticket";
import {
  getTicketBatches,
  toggleTicketBatchStatus,
} from "@/services/ticket-service";
import { CreateTicketBatchButton } from "./create-ticket-batch-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Tag, Ticket } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getPartyDetails } from "@/services/party-service";
import { useToast } from "@/hooks/use-toast";

export function TicketBatchList({ partyId, isOrganizer }: { partyId: int, isOrganizer: boolean }) {
  const [batches, setBatches] = useState<TicketBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isOrganizer, setIsOrganizer] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();


  
  async function loadData() {
    try {
    //  const [partyDetails, ticketBatches] = await Promise.all([getPartyDetails(partyId), getTicketBatches(partyId)]);
      // const partyDetails = await getPartyDetails(partyId);
      const ticketBatches = await getTicketBatches(partyId);
      // setIsOrganizer(partyDetails?.organizer_id == user?.user.id);

      // Cargar tandas
      setBatches(ticketBatches);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, [partyId]);

  const handleToggleStatus = async (
    batchId: string,
    currentStatus: boolean
  ) => {
    if (!isOrganizer) {
      toast({
        title: "Permiso denegado",
        description:
          "Solo los organizadores pueden modificar las tandas de entradas",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(batchId);
    try {
      const updatedBatch = await toggleTicketBatchStatus(
        partyId,
        batchId,
        !currentStatus
      );
      setBatches(
        batches.map((batch) =>
          batch.id === batchId ? { ...batch, isActive: !currentStatus } : batch
        )
      );
      toast({
        title: "Tanda actualizada",
        description: `La tanda ha sido ${
          !currentStatus ? "activada" : "desactivada"
        } correctamente`,
      });
      await loadData();
    } catch (error) {
      console.error("Error al actualizar la tanda:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tanda",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tandas de Entradas</h2>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Tandas de Entradas</h2>
        {isOrganizer && (
          <CreateTicketBatchButton
            partyId={partyId}
            onBatchCreated={(batch) => setBatches([...batches, batch])}
          />
        )}
      </div>

      {batches.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12 text-muted-foreground" />}
          title="No hay tandas de entradas"
          description={
            isOrganizer
              ? "Crea una nueva tanda para comenzar a vender entradas"
              : "El organizador aún no ha creado tandas de entradas"
          }
          action={
            isOrganizer ? (
              <CreateTicketBatchButton
                partyId={partyId}
                onBatchCreated={(batch) => setBatches([batch])}
              />
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{batch.name}</CardTitle>
                  <Badge variant={batch.is_active ? "default" : "secondary"}>
                    {batch.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Categoría: {batch.gender}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {batch.capacity} entradas totales
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {batch.capacity -
                        batch.reserved_tickets -
                        batch.sold_tickets}{" "}
                      disponibles
                    </span>
                  </div>
                  <span className="font-medium">${batch?.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(batch.start_time).toLocaleDateString()} -{" "}
                    {new Date(batch.end_time).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                {isOrganizer ? (
                  <Button
                    variant={batch.is_active ? "outline" : "default"}
                    className="w-full"
                    onClick={() =>
                      handleToggleStatus(batch.id, batch.is_active)
                    }
                    disabled={
                      isUpdating === batch.id ||
                      batch.capacity - batch.sold_tickets == 0
                    }
                  >
                    {batch.capacity - batch.sold_tickets == 0
                      ? "No se puede modificar"
                      : isUpdating === batch.id
                      ? "Actualizando..."
                      : batch.is_active
                      ? "Desactivar"
                      : "Activar"}
                    {/* {isUpdating === batch.id ? "Actualizando..." : batch.is_active ? "Desactivar" : "Activar"} */}
                  </Button>
                ) : (
                  <div className="w-full text-center text-sm text-muted-foreground">
                    {batch.is_active
                      ? "Disponible para venta"
                      : "No disponible para venta"}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
