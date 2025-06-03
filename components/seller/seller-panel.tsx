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
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Ticket,
  User,
  X,
  Users,
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const batchesRef = useRef<TicketBatch[]>([]);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);
useEffect(() => {
  let isMounted = true;

  const handleSocketEvents = () => {
    if (!socket) return;
    socket.emit("join-party", partyId);

    socket.on("ticket-reserved", ({ batchId, quantity }) => {
      setBatches(prev =>
        prev.map(batch =>
          batch.id === batchId
            ? { ...batch, reserved_tickets: batch.reserved_tickets + quantity }
            : batch
        )
      );
    });

    socket.on("reservation-expired", ({ batchId, quantity }) => {
      setBatches(prev =>
        prev.map(batch =>
          batch.id === batchId
            ? { ...batch, reserved_tickets: batch.reserved_tickets - quantity }
            : batch
        )
      );
    });

    socket.on("tanda-status-updated", ({ batchId, newStatus }) => {
      setBatches(prev =>
        prev.map(batch =>
          batch.id === batchId
            ? { ...batch, is_active: newStatus }
            : batch
        )
      );
    });
  };

  const removeSocketEvents = () => {
    if (!socket) return;
    socket.off("ticket-reserved");
    socket.off("reservation-expired");
    socket.off("ticket-sold");
    socket.off("tanda-status-updated");
    socket.emit("leave-party", partyId);
  };

  const loadReservation = async () => {
    try {
      const result = await checkExistingReservation();
      if (!isMounted) return;

      if (!result.hasReservation) {
        setReservation(null);
        setIsReserving(false);
        return;
      }

      setIsReserving(true);
      setReservation({
        id: result.tanda_id,
        expiresAt: new Date(result.expires_at).getTime(),
      });
      setQuantity(result.quantity);

      const saved = sessionStorage.getItem(
        `attendees:${partyId}:${result.tanda_id}`
      );
      if (saved) {
        setAttendees(JSON.parse(saved));
      }
    } catch (error) {
      console.error("❌ Error al recuperar reserva:", error);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await getTicketBatches(partyId);
      if (!isMounted) return;

      const activeBatches = data.filter(batch => batch.is_active);
      setBatches(data);
      if (activeBatches.length > 0) {
        setSelectedBatch(activeBatches[0].id);
      }
    } catch (error) {
      console.error("❌ Error al cargar tandas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Ejecutar ambas tareas en paralelo
  Promise.all([loadReservation(), loadBatches()])
    .catch(err => console.error("❌ Error en carga inicial:", err));

  handleSocketEvents();

  return () => {
    isMounted = false;
    removeSocketEvents();
  };
}, [partyId, socket]);

  // useEffect(() => {
  //   async function checkExistingRese() {
  //     try {
  //       const result = await checkExistingReservation();

  //       console.log(result);
  //       if (!result.hasReservation) {
  //         setReservation(null);
  //         setIsReserving(false);
  //         return;
  //       }
  //       setIsReserving(result.hasReservation);

  //       setReservation({
  //         id: result.tanda_id,
  //         expiresAt: new Date(result.expires_at).getTime(), // Convertir a timestamp
  //       });
  //       setQuantity(result.quantity);
  //       // setReservation({
  //       //   id: `reservation:${partyId}:${data.tanda_id}:${user.id}`,
  //       //   expiresAt: new Date(data.expires_at).getTime(),
  //       // });
  //       const saved = sessionStorage.getItem(
  //         `attendees:${partyId}:${result.tanda_id}`
  //       );
  //       if (saved) {
  //         setAttendees(JSON.parse(saved));
  //       }
  //       // setSelectedBatch(String(data.tanda_id));
  //     } catch (error) {
  //       console.error("Error al recuperar reserva:", error);
  //     }
  //   }
  //   checkExistingRese();

  //   async function loadBatches() {
  //     try {
  //       const data = await getTicketBatches(partyId);
  //       const activeBatches = data.filter((batch) => batch.is_active);
  //       console.log(data, activeBatches);
  //       setBatches(data);
  //       if (activeBatches.length > 0) {
  //         setSelectedBatch(activeBatches[0].id);
  //       }
  //     } catch (error) {
  //       console.error("Error al cargar las tandas de entradas:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   loadBatches();

  //   // Socket connection for real-time updates
  //   if (socket) {
  //     socket.emit("join-party", partyId);

  //     socket.on("ticket-reserved", (data) => {
  //       console.log(data, batchesRef.current);
  //       const updated = batchesRef.current.map((batch) =>
  //         batch.id === data.batchId
  //           ? {
  //               ...batch,
  //               reserved_tickets: batch.reserved_tickets + data.quantity,
  //             }
  //           : batch
  //       );
  //       setBatches(updated);
  //     });

  //     socket.on("reservation-expired", (data) => {
  //       console.log(data, batchesRef.current);

  //       const updated = batchesRef.current.map((batch) =>
  //         batch.id === data.batchId
  //           ? {
  //               ...batch,
  //               reserved_tickets: batch.reserved_tickets - data.quantity,
  //             }
  //           : batch
  //       );
  //       setBatches(updated);
  //     });

  //     socket.on("tanda-status-updated", ({ batchId, newStatus }) => {
  //       console.log("Tanda status updated:", newStatus, batchesRef.current[0].id == batchId);

  //       const updated = batchesRef.current.map((batch) =>
  //         batch.id == batchId ? { ...batch, is_active: newStatus } : batch
  //       );
  //       console.log("Updated batches:", updated);
  //       setBatches(updated);
  //       // setBatches(prev =>
  //       //   prev.map(t =>
  //       //     t.id === batchId ? { ...t, is_active: newStatus } : t
  //       //   )
  //       // );
  //     });

  //     // socket.on("ticket-sold", (data) => {
  //     //   // No need to update available tickets here as they were already reserved
  //     //   toast({
  //     //     title: "Venta realizada",
  //     //     description: `${data.quantity} entradas vendidas por otro vendedor`,
  //     //   });
  //     // });
  //   }

  //   return () => {
  //     if (socket) {
  //       socket.off("ticket-reserved");
  //       socket.off("reservation-expired");
  //       socket.off("ticket-sold");
  //       socket.off("tanda-status-updated");
  //       socket.emit("leave-party", partyId);
  //     }
  //   };
  // }, [partyId, socket, toast]);

  const handleReserve = useCallback(async () => {
    if (!selectedBatch || quantity <= 0) return;

    setIsReserving(true);
    try {
      console.log("Reservando entradas...", selectedBatch);
      const result = await reserveTickets(partyId, selectedBatch, quantity);
      console.log(result);
      setReservation({
        id: result.reservationId,
        expiresAt: new Date(result.message).getTime(), // Convertir a timestamp
      });
      if (quantity > 0) {
        setShowAttendeeForm(true);
      }

      toast({
        title: "Entradas reservadas",
        description: `${quantity} entradas reservadas por 5 minutos`,
      });
      setQuantity(quantity);
    } catch (error) {
      console.error("Error al reservar entradas:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron reservar las entradas. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsReserving(false);
    }
  }, [partyId, selectedBatch, quantity, toast]);

  const handleConfirm = async () => {
    if (!reservation) return;

    if(attendees.length === 0) {
      toast({
        title: "Error",
        description: "No se han registrado los datos de los asistentes",
        variant: "destructive",
      });
      return;
    }
    setIsConfirming(true);
    try {
      console.log(attendees);
      await confirmTicketSale(partyId, selectedBatch, attendees);
      sessionStorage.removeItem(`attendees:${partyId}:${selectedBatch}`);
      setReservation(null);
      toast({
        title: "Venta confirmada",
        description: `${quantity} entradas vendidas exitosamente`,
      });

      // Refresh batches after sale
      const data = await getTicketBatches(partyId);
      const activeBatches = data.filter((batch) => batch.is_active);
      setBatches(activeBatches);
      setQuantity(1);
      setAttendees([]);
      setShowAttendeeForm(false);
    } catch (error) {
      console.error("Error al confirmar la venta:", error);
      toast({
        title: "Error",
        description:
          "No se pudo confirmar la venta. La reserva puede haber expirado.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
      setIsReserving(false);
      setReservation(null);
    }
  };

  const handleCancel = async () => {
    if (!reservation || !selectedBatch) {
      toast({
        title: "Error",
        description: "No hay una reserva activa para cancelar",
        variant: "destructive",
      });
      return;
    }

    setIsCancelling(true);
    try {
      // Call the API to cancel the reservation
      await cancelTicket(partyId, selectedBatch);

      // Update local state
      setReservation(null);

      // Update the available tickets in the selected batch
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === selectedBatch
            ? { ...batch, availableTickets: batch.availableTickets + quantity }
            : batch
        )
      );

      // Notify the user
      toast({
        title: "Reserva cancelada",
        description: `${quantity} entradas han sido liberadas y están disponibles nuevamente`,
        variant: "default",
      });

      // Notify other users via socket
      if (socket) {
        socket.emit("reservation-cancelled", {
          partyId,
          batchId: selectedBatch,
          quantity,
          reservationId: reservation.id,
        });
      }

      // Reset form fields related to the customer
      sessionStorage.removeItem(`attendees:${partyId}:${selectedBatch}`);
      setAttendees([]);
      setShowAttendeeForm(false);
      // Close the confirmation dialog
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);

      // Check if the error is due to an expired reservation
      const isExpiredError =
        error instanceof Error && error.message.includes("expired");

      if (isExpiredError) {
        // If the reservation already expired, just update the local state
        setReservation(null);
        toast({
          title: "Reserva expirada",
          description: "La reserva ya ha expirado automáticamente",
        });
      } else {
        // For other errors, show a generic error message
        toast({
          title: "Error",
          description:
            "No se pudo cancelar la reserva. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Function to open the cancel confirmation dialog
  const openCancelDialog = () => {
    setShowCancelDialog(true);
  };
  const handleAttendeeFormComplete = (attendeeData: Attendee[]) => {
    setAttendees(attendeeData);
    setShowAttendeeForm(false);

    // Auto-fill customer info with the first attendee's data
    // if (attendeeData.length > 0) {
    //   setCustomerName(attendeeData[0].fullName)
    //   setCustomerEmail(attendeeData[0].email)
    //   setCustomerPhone(attendeeData[0].phone || "")
    // }
    if (selectedBatch) {
      sessionStorage.setItem(
        `attendees:${partyId}:${selectedBatch}`,
        JSON.stringify(attendeeData)
      );
    }

    toast({
      title: "Datos registrados",
      description: `Se han registrado los datos de ${attendeeData.length} asistentes`,
    });
  };

  const handleAttendeeFormCancel = () => {
    setShowAttendeeForm(false);
  };
  const selectedBatchDetails = useMemo(
    () => batches.find((batch) => batch.id === selectedBatch),
    [batches, selectedBatch]
  );
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Panel de Vendedor</CardTitle>
          <CardDescription>Cargando tandas disponibles...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

const activeBatches = batches.filter((batch) => batch.is_active);

if (activeBatches.length === 0) {
  return (
    <EmptyState
      icon={<Ticket className="h-12 w-12 text-muted-foreground" />}
      title="No hay tandas disponibles"
      description="No hay tandas activas con entradas disponibles para vender"
    />
  );
}

  // If showing attendee form, render only that
  if (showAttendeeForm) {
    return (
      <AttendeeForm
        initialAttendees={attendees}
        quantity={quantity}
        onComplete={handleAttendeeFormComplete}
        onCancel={handleAttendeeFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Vendedor</CardTitle>
          <CardDescription>Gestiona la venta de entradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reservation ? (
            <div className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Reserva activa</AlertTitle>
                <AlertDescription>
                  Has reservado {quantity} entradas de la tanda "
                  {selectedBatchDetails?.name}".
                </AlertDescription>
              </Alert>

              <CountdownTimer
                expiresAt={reservation.expiresAt}
                totalSeconds={5 * 60}
                onExpire={handleCancel}
              />
              {attendees.length > 0 && (
                <div className="space-y-4 border rounded-lg p-4 bg-green-50 border-green-200">
                  <h3 className="font-medium flex items-center gap-2 text-green-800">
                    <Users className="h-4 w-4" />
                    Datos de asistentes registrados
                  </h3>
                  <p className="text-sm text-green-700">
                    Se han registrado los datos de {attendees.length}{" "}
                    asistentes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() => setShowAttendeeForm(true)}
                  >
                    Ver o editar datos
                  </Button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isConfirming ? "Confirmando..." : "Confirmar venta"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  Cancelar reserva
                </Button>
              </div>
              {attendees.length === 0 && quantity > 0 && (
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertTitle>Datos de asistentes</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    <p>
                      No has registrado los datos de los asistentes. Es
                      recomendable registrarlos para un mejor control de acceso.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => setShowAttendeeForm(true)}
                    >
                      Registrar datos de asistentes
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Tanda</Label>
                  <Select
                    value={selectedBatch}
                    onValueChange={setSelectedBatch}
                  >
                    <SelectTrigger id="batch">
                      <SelectValue placeholder="Selecciona una tanda" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches
                        .filter((batch) => batch.is_active)
                        .map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} - {batch.gender} -${batch.price} (
                            {batch.capacity -
                              batch.reserved_tickets -
                              batch.sold_tickets}{" "}
                            disponibles)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedBatchDetails?.availableTickets || 1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number.parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>

              {selectedBatchDetails && (
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Precio unitario:</div>
                    <div className="font-medium">
                      ${selectedBatchDetails.price}
                    </div>
                    <div>Cantidad:</div>
                    <div className="font-medium">{quantity}</div>
                    <div>Genero:</div>
                    <div className="font-medium">{selectedBatchDetails.gender}</div>
                    <div>Total:</div>
                    <div className="font-medium text-primary">
                      ${(selectedBatchDetails.price * quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleReserve}
                disabled={
                  isReserving ||
                  !selectedBatch ||
                  quantity <= 0 ||
                  (selectedBatchDetails &&
                    quantity > selectedBatchDetails.availableTickets)
                }
                className="w-full"
              >
                {isReserving ? "Reservando..." : "Reservar entradas"}
              </Button>

              {selectedBatchDetails &&
                quantity > selectedBatchDetails.availableTickets && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cantidad no disponible</AlertTitle>
                    <AlertDescription>
                      Solo hay {selectedBatchDetails.availableTickets} entradas
                      disponibles en esta tanda.
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
