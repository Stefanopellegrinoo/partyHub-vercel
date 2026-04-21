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
import {
  getTicketBatches,
  toggleTicketBatchStatus,
} from "@/services/ticket-service";
import { getPartyDetails } from "@/services/party-service";
import { CreateTicketBatchButton } from "./create-ticket-batch-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Tag, Ticket, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { formatDate, isPartyPast } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TicketBatchList({ partyId, isOrganizer }: { partyId: string, isOrganizer: boolean }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPast, setIsPast] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  async function loadData() {
    try {
      const [ticketBatches, party] = await Promise.all([
        getTicketBatches(partyId),
        getPartyDetails(partyId)
      ]);
      setIsPast(isPartyPast(party.date));
      setBatches(ticketBatches);
    } catch (error) {
      console.error("Error al cargar las tandas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [partyId]);

  const handleToggleStatus = async (batchId: string, currentStatus: boolean) => {
    if (isPast) return;
    setIsUpdating(batchId);
    try {
      await toggleTicketBatchStatus(partyId, batchId, !currentStatus);
      toast({ title: "Tanda actualizada", description: `La tanda ha sido ${!currentStatus ? "activada" : "desactivada"}.` });
      await loadData();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cambiar el estado.", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-full" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div></div>;

  return (
    <div className="space-y-6">
      {isPast && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Evento Finalizado</AlertTitle>
          <AlertDescription>Esta fiesta ya ha pasado. Las tandas están cerradas y no se pueden crear nuevas.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tandas de Entradas</h2>
        {isOrganizer && !isPast && (
          <CreateTicketBatchButton partyId={partyId} onBatchCreated={loadData} />
        )}
      </div>

      {batches.length === 0 ? (
        <EmptyState icon={<Ticket className="h-12 w-12 text-muted-foreground" />} title="No hay tandas" description={isOrganizer ? "Crea una tanda para empezar." : "No hay entradas disponibles."} action={isOrganizer && !isPast ? <CreateTicketBatchButton partyId={partyId} onBatchCreated={loadData} /> : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const capacity = batch.capacity || 0;
            const sold = batch.sold_tickets || 0;
            const reserved = batch.reserved_tickets || 0;
            const available = batch.available_stock ?? (capacity - sold - reserved);
            const startDate = batch.start_time || batch.startDate;
            const endDate = batch.end_time || batch.endDate;

            return (
              <Card key={batch.id} className={isPast ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    <Badge variant={batch.is_active ? "default" : "secondary"}>{batch.is_active ? "Activa" : "Inactiva"}</Badge>
                  </div>
                  <CardDescription>Cat: {batch.gender || "General"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{available} disponibles</span>
                    <span className="font-medium text-primary">${batch.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                  </div>
                </CardContent>
                {isOrganizer && (
                  <CardFooter>
                    <Button
                      variant={batch.is_active ? "outline" : "default"}
                      className="w-full h-8 text-xs"
                      disabled={isUpdating === batch.id || isPast || (capacity - sold <= 0 && batch.is_active)}
                      onClick={() => handleToggleStatus(batch.id, batch.is_active)}
                    >
                      {isPast ? "Cerrada" : capacity - sold <= 0 && batch.is_active ? "Agotada" : batch.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
