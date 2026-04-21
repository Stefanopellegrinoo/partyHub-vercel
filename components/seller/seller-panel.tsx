"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Attendee, TicketBatch } from "@/types/ticket";
import {
  getTicketBatches,
  reserveTickets,
  confirmTicketSale,
  checkExistingReservation,
  cancelTicket,
} from "@/services/ticket-service";
import { getPartyDetails } from "@/services/party-service";
import { isPartyPast } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Ticket,
  Users,
  Check,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CountdownTimer } from "@/components/tickets/countdown-timer";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendeeForm } from "@/components/seller/attendee-form";

export function SellerPanel({ partyId }: { partyId: string }) {
  const [batches, setBatches] = useState<TicketBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPast, setIsPast] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [reservation, setReservation] = useState<{
    id: string;
    expiresAt: number;
  } | null>(null);
  
  const { toast } = useToast();
  const socket = useSocket();
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [batchesData, partyData, resData] = await Promise.all([
          getTicketBatches(partyId),
          getPartyDetails(partyId),
          checkExistingReservation(partyId)
        ]);

        if (!isMounted) return;

        setIsPast(isPartyPast(partyData.date));
        setBatches(batchesData);

        // Cargar Reserva
        if (resData && resData.hasReservation) {
          setReservation({
            id: String(resData.tanda_id),
            expiresAt: new Date(resData.expires_at).getTime(),
          });
          setIsReserving(true);
          setSelectedBatch(String(resData.tanda_id));
          setQuantity(resData.quantity);
          const saved = sessionStorage.getItem(`attendees:${partyId}:${resData.tanda_id}`);
          if (saved) setAttendees(JSON.parse(saved));
        } else {
          const active = batchesData.filter(b => b.is_active);
          if (active.length > 0) setSelectedBatch(active[0].id);
        }

      } catch (error) {
        console.error("❌ Error en carga inicial del vendedor:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    if (socket) {
      socket.emit("join-party", partyId);
      socket.on("ticket-reserved", ({ batchId, quantity, remainingStock }) => {
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, available_stock: remainingStock ?? b.available_stock - quantity } : b));
      });
      socket.on("reservation-expired", ({ batchId, quantity, remainingStock }) => {
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, available_stock: remainingStock ?? b.available_stock + quantity } : b));
      });
      socket.on("reservation-cancelled", ({ batchId, quantity, remainingStock }) => {
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, available_stock: remainingStock ?? b.available_stock + quantity } : b));
      });
      socket.on("tanda-status-updated", ({ batchId, newStatus }) => {
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, is_active: newStatus } : b));
      });
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.off("ticket-reserved");
        socket.off("reservation-expired");
        socket.off("reservation-cancelled");
        socket.off("tanda-status-updated");
        socket.emit("leave-party", partyId);
      }
    };
  }, [partyId, socket]);

  const handleReserve = useCallback(async () => {
    if (!selectedBatch || quantity <= 0) return;
    setIsReserving(true);
    try {
      const result = await reserveTickets(partyId, selectedBatch, quantity);
      setReservation({
        id: result.reservationId,
        expiresAt: new Date(result.message).getTime(),
      });
      setShowAttendeeForm(true);
      toast({ title: "Entradas reservadas", description: `${quantity} entradas reservadas por 5 min.` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo realizar la reserva.", variant: "destructive" });
    } finally {
      setIsReserving(false);
    }
  }, [partyId, selectedBatch, quantity, toast]);

  const handleConfirm = async () => {
    if (!reservation) return;
    if (attendees.length === 0) {
      toast({ title: "Error", description: "Faltan datos de asistentes", variant: "destructive" });
      return;
    }
    setIsConfirming(true);
    try {
      await confirmTicketSale(partyId, selectedBatch, attendees);
      sessionStorage.removeItem(`attendees:${partyId}:${selectedBatch}`);
      setReservation(null);
      setIsReserving(false);
      setAttendees([]);
      setShowAttendeeForm(false);
      toast({ title: "Venta confirmada", description: "Entradas vendidas exitosamente." });
      
      const updatedBatches = await getTicketBatches(partyId);
      setBatches(updatedBatches);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo confirmar la venta.", variant: "destructive" });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation || !selectedBatch) return;
    try {
      await cancelTicket(partyId, selectedBatch);
      setReservation(null);
      setIsReserving(false);
      setAttendees([]);
      setShowAttendeeForm(false);
      sessionStorage.removeItem(`attendees:${partyId}:${selectedBatch}`);
      toast({ title: "Reserva liberada", description: "Las entradas han sido devueltas al stock." });
    } catch (error) {
      setReservation(null);
      setIsReserving(false);
    }
  };

  const selectedBatchDetails = useMemo(() => batches.find(b => b.id === selectedBatch), [batches, selectedBatch]);

  if (isLoading) return <Card><CardHeader><CardTitle>Cargando...</CardTitle></CardHeader></Card>;

  if (isPast) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12 text-muted-foreground" />}
        title="Ventas Finalizadas"
        description="Esta fiesta ya ha pasado. No es posible realizar nuevas ventas."
      />
    );
  }

  const activeBatches = batches.filter(b => b.is_active);
  if (activeBatches.length === 0 && !isReserving) {
    return <EmptyState icon={<Ticket className="h-12 w-12 text-muted-foreground" />} title="Sin Tandas" description="No hay tandas activas para vender." />;
  }

  if (showAttendeeForm) {
    return <AttendeeForm initialAttendees={attendees} quantity={quantity} onComplete={(data) => {
      setAttendees(data);
      setShowAttendeeForm(false);
      if (selectedBatch) sessionStorage.setItem(`attendees:${partyId}:${selectedBatch}`, JSON.stringify(data));
      toast({ title: "Datos guardados", description: "Datos de asistentes listos." });
    }} onCancel={() => setShowAttendeeForm(false)} />;
  }

  return (
    <Card className="bg-[#080808] border-white/5 rounded-none overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
      <CardHeader className="p-6 md:p-8">
        <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">Venta de Entradas</CardTitle>
        <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Module: Direct Sales Terminal</CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0 space-y-8">
        {reservation ? (
          <div className="space-y-6">
            <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#7c3aed] animate-pulse" />
                <div>
                  <p className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest leading-none">Reserva en curso</p>
                  <p className="text-lg font-black uppercase italic tracking-tight">{selectedBatchDetails?.name} ({quantity} un.)</p>
                </div>
              </div>
              <CountdownTimer expiresAt={reservation.expiresAt} totalSeconds={5 * 60} onExpire={handleCancel} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleConfirm} disabled={isConfirming} className="h-16 flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-tighter text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <Check className="h-6 w-6 mr-2 stroke-[3]" /> CONFIRMAR
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isConfirming} className="h-16 flex-1 border-white/10 hover:bg-white/5 rounded-none font-black uppercase tracking-widest text-zinc-500">
                CANCELAR
              </Button>
            </div>
            
            {attendees.length === 0 && (
              <Button variant="outline" size="sm" className="w-full h-12 border-dashed border-white/10 hover:bg-white/5 rounded-none text-zinc-400 font-bold uppercase tracking-widest text-[10px]" onClick={() => setShowAttendeeForm(true)}>
                REGISTRAR IDENTIDADES ASISTENTES
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tanda Disponible</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="h-14 bg-zinc-900 border-none rounded-none font-mono text-[10px] tracking-widest">
                    <SelectValue placeholder="SELECCIONÁ" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#080808] border-white/5 rounded-none">
                    {batches.filter(b => b.is_active).map(b => (
                      <SelectItem key={b.id} value={b.id} disabled={b.available_stock <= 0} className="font-mono text-[10px] uppercase">
                        {b.name} - ${b.price} ({b.available_stock > 0 ? `${b.available_stock} DISP.` : "AGOTADO"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Cantidad</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max={selectedBatchDetails?.available_stock || 1} 
                  value={quantity} 
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                  className="h-14 bg-zinc-900 border-none rounded-none font-mono text-center text-xl font-bold"
                />
              </div>
            </div>
            <Button 
              onClick={handleReserve} 
              disabled={isReserving || !selectedBatch || (selectedBatchDetails && quantity > selectedBatchDetails.available_stock)} 
              className="w-full h-20 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-tighter text-2xl shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all active:scale-95"
            >
              {isReserving ? "RESERVANDO..." : "RESERVAR ENTRADAS"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
