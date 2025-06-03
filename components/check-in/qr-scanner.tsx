"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  StopCircle,
  RefreshCw,
  Scan,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { checkInTicket, verifyTicket } from "@/services/ticket-service";
import type { Ticket } from "@/types/ticket";
import { BrowserQRCodeReader } from "@zxing/browser";

interface QRScannerProps {
  partyId: string;
  onSuccess?: (ticket: Ticket) => void;
}

export function QRScanner({ partyId, onSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    ticket?: Ticket;
    isValid: boolean;
    message?: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const codeReader = new BrowserQRCodeReader();
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const videoInputDevices =
        await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;

      if (!selectedDeviceId) {
        throw new Error("No camera found");
      }

      if (!videoRef.current) return;

      const result = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            (codeReader as any).reset();
            stopScanning();
            handleCheckIn(result.getText());
          }

          if (err) {
            console.warn("QR read error", err);
          }
        }
      );
    } catch (err) {
      console.error("Error starting QR scanner", err);
      setError("No se pudo acceder a la cámara");
      setScanning(false);
    }
  };
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setScanning(false);
  };

  // const processQRCode = async (ticketCode: string) => {
  //   try {
  //     setProcessing(true)

  //     const response = await fetch("/api/attendees/validate-qr", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ticket_code: ticketCode }),
  //     })

  //     const result = await response.json()

  //     if (response.status === 200 && result.status === "valid") {
  //       toast({
  //         title: "Ingreso válido",
  //         description: `${result.full_name} – ${result.tanda_name}`,
  //       })

  //       setResult({ isValid: true, ticket: result })
  //       if (onSuccess) onSuccess(result)
  //     } else if (result.status === "already_used") {
  //       toast({
  //         title: "Ticket ya usado",
  //         description: `${result.full_name} ya ingresó.`,
  //         variant: "destructive",
  //       })
  //       setResult({ isValid: false, ticket: result })
  //     } else {
  //       toast({
  //         title: "Ticket inválido",
  //         description: "El código QR no es válido.",
  //         variant: "destructive",
  //       })
  //       setResult({ isValid: false })
  //     }
  //   } catch (err) {
  //     console.error("Error al validar QR", err)
  //     toast({
  //       title: "Error",
  //       description: "No se pudo procesar el código. Reintenta.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setProcessing(false)
  //   }
  // }
  const handleCheckIn = async (ticketCode: string) => {
  try {
    setProcessing(true)

   const data = await checkInTicket(partyId, ticketCode);

    // const data = await res.json()
    console.log("Check-in data:", data)
    if(!data) {

      toast({
        title: "Ticket inválido",
        description: "El código QR no pertenece a un ticket válido.",
        variant: "destructive",
      })

      setResult({ isValid: false })
      return
    }

    if (data.status) {
      toast({
        title: "Check-in exitoso",
        description: `${data.full_name || "Asistente"} ha ingresado correctamente.`,
      })

      setResult({ isValid: true, ticket: data })
      if (onSuccess) onSuccess(data)
    } else {
      toast({
        title: "Ticket ya usado",
        description: `${data.full_name || "Este ticket"} ya fue ingresado.`,
        variant: "destructive",
      })

      setResult({
        isValid: false,
        ticket: data,
        message: "Ticket ya fue escaneado previamente.",
      })
    }

  } catch (err) {
    console.error("Error checking in ticket:", err)
    toast({
      title: "Error",
      description: "No se pudo procesar el QR.",
      variant: "destructive",
    })
  } finally {
    setProcessing(false)
  }
}


  // const handleCheckIn = async (ticketCode: string) => {
  //   try {
  //     setProcessing(true);

  //     // Check in the ticket
  //     const response = await checkInTicket(partyId, ticketCode);

  //     if (response.status === 200 && result.status === "valid") {
 
  //     toast({
  //       title: "Check-in exitoso",
  //       description: `${
  //         response.attendee?.fullName ||
  //         response.customerName ||
  //         "Asistente"
  //       } ha ingresado correctamente.`,
  //       variant: "success",
  //     });


  //       setResult({ isValid: true, ticket: result });
  //     } else if (response.status === "already_used") {

  //     setResult({
  //       ...result,
  //       ticket: response,
  //       isValid: false,
  //       message: "Ticket has already been used",
  //     });

  //       setResult({ isValid: false, ticket: result });
  //     } else {
  //       toast({
  //         title: "Ticket inválido",
  //         description: "El código QR no es válido.",
  //         variant: "destructive",
  //       });
  //       setResult({ isValid: false });
  //     }

  //     // Update the result with the checked-in ticket
  //     setResult({
  //       ...result,
  //       ticket: response,
  //       isValid: false,
  //       message: "Ticket has already been used",
  //     });

  //     if (onSuccess) {
  //       onSuccess(response);
  //     }
  //   } catch (err) {
  //     console.error("Error checking in ticket:", err);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo realizar el check-in. Inténtalo de nuevo.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

  const renderResult = () => {
    if (!result) return null;

    const ticket = result.ticket;

    if (!result.isValid) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Boleto no válido</AlertTitle>
          <AlertDescription>
            {result.message || "Este boleto no es válido para el evento."}
            {ticket && (
              <div className="mt-2">
                <p>
                  <strong>Documento:</strong> {ticket.document_id}
                </p>
                <p>
                  <strong>Asistente:</strong>{" "}
                  {ticket.full_name ||
                    ticket.customerName ||
                    "Desconocido"}
                </p>
                <p>
                  <strong>Estado:</strong> {ticket.status ? "Valido" : "No valido"}
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (ticket) {
      return (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Boleto válido</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>
                <strong>Documento:</strong> {ticket.document_id}
              </p>
              <p>
                <strong>Asistente:</strong> {ticket.full_name || ticket.customerName || "Desconocido"}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Escanear Código QR
        </CardTitle>
        <CardDescription>
          Escanea el código QR del boleto para verificar y realizar el check-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {scanning ? (
          <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-0 border-2 border-white/50 rounded-md" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-green-500 rounded-md animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
            {result ? (
              renderResult()
            ) : error ? (
              <Alert variant="destructive" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Presiona "Iniciar Escaneo" para comenzar a escanear códigos
                  QR.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {scanning ? (
          <Button
            onClick={stopScanning}
            variant="destructive"
            disabled={processing}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Detener Escaneo
          </Button>
        ) : (
          <Button onClick={startScanning} disabled={processing}>
            {result ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Escanear Otro
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Escaneo
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
