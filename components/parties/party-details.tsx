"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Copy, MapPin, Share2, Users, Trash2, Zap } from "lucide-react";
import { getPartyDetails, abandonParty, deleteParty } from "@/services/party-service";
import type { Party } from "@/types/party";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { EventCountdown } from "./event-countdown";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PartyDetails({ id }: { id: string }) {
  const { user } = useAuth();
  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadParty() {
      try {
        const data = await getPartyDetails(id);
        setParty(data);
      } catch (error) {
        if (error.response?.status === 403) {
          router.replace("/dashboard");
          toast({ title: "Acceso denegado", description: "No sos parte de esta fiesta" });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadParty();
  }, [id, router, toast]);

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      // 1. Intentar API moderna
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast({ title: "¡Éxito!", description: successMsg });
        return;
      }
      
      // 2. Fallback manual (el viejo truco del textarea)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({ title: "¡Éxito!", description: successMsg });
      } else {
        throw new Error("No se pudo copiar");
      }
    } catch (err) {
      console.error("Error al copiar:", err);
      // Último recurso: mostrar el texto para que el usuario lo copie a mano
      window.prompt("Copiá esto manualmente:", text);
    }
  };

  const copyInviteCode = () => {
    if (party?.invite_code) {
      copyToClipboard(party.invite_code, "Código de invitación copiado");
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `¡Sumate a la fiesta ${party?.name}! Usá mi código: ${party?.invite_code} \nLink: ${shareUrl}`;
    const shareData = { title: `PartyHub - ${party?.name}`, text: shareText, url: shareUrl };

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Si no hay Share API (Desktop), usamos nuestro copyToClipboard pro
        copyToClipboard(shareText, "Link de invitación copiado");
      }
    } catch (error) { console.error(error); }
  };

  const leaveParty = async () => {
    try {
      await abandonParty(id);
      router.push("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "No se pudo abandonar.", variant: "destructive" });
    }
  };

  const handleDeleteParty = async () => {
    setIsDeleting(true);
    try {
      await deleteParty(id);
      toast({ title: "Fiesta eliminada", description: "El evento ha sido eliminado." });
      router.push("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    } finally { setIsDeleting(false); }
  };

  if (isLoading) return <Skeleton className="h-48 w-full rounded-none" />;

  if (!party) return <p className="text-center text-zinc-700 uppercase font-black py-12 tracking-[0.3em]">NOT FOUND</p>;

  // Normalizamos a número para evitar fallos de tipo (string vs number)
  const isOrganizer = Number(party?.organizer_id) === Number(user?.id);

  return (
    <Card className="bg-[#080808] border-white/5 rounded-none overflow-hidden relative">
      {/* Top Banner (Violet) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Main Info */}
          <div className="p-8 flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">{party.name}</h1>
                  <Badge className={isOrganizer ? "bg-[#7c3aed] text-white rounded-none" : "bg-zinc-800 text-zinc-400 rounded-none"}>
                    {isOrganizer ? "ORG" : "SEL"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-6 font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-[#7c3aed]" />
                    <span>{formatDate(party.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#7c3aed]" />
                    <span>{party.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-[#7c3aed]" />
                    <span>{party.ticketsSold || 0} VENDIDAS</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isOrganizer ? (
                  <>
                    <Button variant="outline" size="sm" onClick={copyInviteCode} className="border-white/5 bg-white/5 hover:bg-white/10 rounded-none font-bold text-[10px] uppercase tracking-widest h-10 px-4">
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      {party.invite_code}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="border-white/5 bg-white/5 hover:bg-white/10 rounded-none font-bold text-[10px] uppercase tracking-widest h-10 px-4">
                      <Share2 className="h-3.5 w-3.5 mr-2" />
                      COMPARTIR
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting} className="bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-none font-bold text-[10px] uppercase tracking-widest h-10 px-4">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          ELIMINAR
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#080808] border-white/5 rounded-none text-zinc-100">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-3xl font-black uppercase tracking-tighter italic">¿BORRAR TODO?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-500 font-bold uppercase text-xs tracking-widest">
                            Esta acción es final. Se eliminarán todas las tandas y ventas asociadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-900 border-none rounded-none font-bold text-[10px] uppercase tracking-widest">CANCELAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteParty} className="bg-red-600 hover:bg-red-700 text-white rounded-none font-bold text-[10px] uppercase tracking-widest">SÍ, ELIMINAR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <Button variant="destructive" size="sm" onClick={leaveParty} className="bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-none font-bold text-[10px] uppercase tracking-widest h-10 px-4">
                    ABANDONAR
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Countdown Side */}
          <div className="bg-zinc-950/50 p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/5 min-w-[320px]">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">FALTAN</p>
              <EventCountdown targetDate={party.date} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
