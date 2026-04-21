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
  Zap,
  XCircle,
} from "lucide-react";
import { checkInTicket } from "@/services/ticket-service";
import type { Ticket } from "@/types/ticket";
import { BrowserQRCodeReader } from "@zxing/browser";

interface QRScannerProps {
  partyId: string;
  onSuccess?: (ticket: Ticket) => void;
}
const codeReader = new BrowserQRCodeReader();

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
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      if (!videoRef.current) return;

      const controls = await codeReader.decodeFromVideoDevice(
        undefined, 
        videoRef.current,
        (result, err) => {
          if (result) {
            stopScanning();
            handleCheckIn(result.getText());
          }
        }
      );

      controlsRef.current = controls;
    } catch (err) {
      console.error("Error starting QR scanner", err);
      setError("No se pudo acceder a la cámara. Asegurate de dar permisos.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  const handleCheckIn = async (ticketCode: string) => {
    try {
      setProcessing(true);
      const data = await checkInTicket(partyId, ticketCode);

      if (!data) {
        setResult({ isValid: false });
        return;
      }

      if (data.status) {
        setResult({ isValid: true, ticket: data });
        if (onSuccess) onSuccess(data);
      } else {
        setResult({
          isValid: false,
          ticket: data,
          message: "ESTE TICKET YA FUE USADO",
        });
      }

    } catch (err) {
      console.error("Error checking in ticket:", err);
      setError("Error interno del servidor");
    } finally {
      setProcessing(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const ticket = result.ticket;

    if (!result.isValid) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-red-600 flex items-center justify-center rounded-none rotate-3 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <XCircle className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-red-500">ACCESO DENEGADO</h2>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">{result.message || "TICKET INVÁLIDO"}</p>
          </div>
          {ticket && (
            <div className="p-4 bg-white/5 border border-white/10 w-full font-mono text-left space-y-1">
               <p className="text-[10px] text-zinc-500 uppercase">ASISTENTE</p>
               <p className="text-sm font-bold uppercase">{ticket.full_name || "DESCONOCIDO"}</p>
            </div>
          )}
          <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 rounded-none font-black uppercase tracking-widest" onClick={() => setResult(null)}>
            INTENTAR OTRO
          </Button>
        </div>
      );
    }

    if (ticket) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-[#7c3aed] flex items-center justify-center rounded-none -rotate-3 shadow-[0_0_40px_rgba(124,58,237,0.5)]">
            <CheckCircle2 className="w-16 h-16 text-black" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-[#7c3aed]">¡VÁLIDO!</h2>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">CHECK-IN REGISTRADO</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 w-full font-mono text-left space-y-3">
             <div>
               <p className="text-[9px] text-zinc-600 uppercase">ASISTENTE</p>
               <p className="text-lg font-black uppercase italic leading-none">{ticket.full_name}</p>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase">DOC</p>
                  <p className="text-xs font-bold tracking-widest">{ticket.document_id}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase">TANDA</p>
                  <p className="text-xs font-bold tracking-widest">{ticket.tanda_name}</p>
                </div>
             </div>
          </div>
          <Button className="w-full h-20 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-widest text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]" onClick={() => setResult(null)}>
            SIGUIENTE SCAN
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#080808] border border-white/5 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
      
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Scanner v2</h2>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Protocol: Direct Validation</p>
        </div>
        <Zap className="w-5 h-5 text-[#7c3aed] fill-[#7c3aed] animate-pulse" />
      </div>

      <div className="p-6">
        {scanning ? (
          <div className="relative w-full aspect-video bg-black overflow-hidden border border-white/5">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" playsInline muted />
            <div className="absolute inset-0 border-[20px] border-black/80" />
            
            {/* Scan Line Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[80%] h-[1px] bg-[#7c3aed] shadow-[0_0_15px_#7c3aed] animate-scan-line" />
            </div>
            
            <div className="absolute top-4 left-4 font-mono text-[9px] text-[#7c3aed] uppercase tracking-widest animate-pulse">
              [ LIVE CAMERA FEED ]
            </div>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center bg-zinc-950/50 border border-white/5 border-dashed">
            {result ? (
              <div className="w-full">{renderResult()}</div>
            ) : error ? (
              <div className="p-8 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{error}</p>
                <Button variant="outline" className="rounded-none uppercase text-[10px]" onClick={() => setError(null)}>Reintentar</Button>
              </div>
            ) : (
              <div className="text-center p-8 space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="h-8 w-8 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <p className="font-black uppercase tracking-widest text-zinc-400">Listo para Validar</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Apuntá al QR del Asistente</p>
                </div>
                <Button onClick={startScanning} disabled={processing} className="w-full h-14 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                  ABRIR CÁMARA
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {scanning && (
        <div className="p-6 pt-0">
          <Button onClick={stopScanning} variant="ghost" disabled={processing} className="w-full h-12 text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-none font-black uppercase tracking-widest text-[10px]">
            <StopCircle className="h-4 w-4 mr-2" />
            DETENER SCANNER
          </Button>
        </div>
      )}

      <div className="p-4 bg-zinc-950 border-t border-white/5 flex justify-center italic font-black text-[8px] text-zinc-800 tracking-[0.4em] uppercase">
        Encrypted Endpoint Connection // PartyHub HQ
      </div>
      
      <style jsx global>{`
        @keyframes scan-line {
          0% { transform: translateY(-150px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
