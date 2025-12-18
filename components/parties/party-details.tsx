"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Copy, MapPin, Share2, Users } from "lucide-react";
import { getPartyDetails, abandonParty } from "@/services/party-service";
import type { Party } from "@/types/party";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function PartyDetails({ id }: { id: string }) {
  const { user } = useAuth();
  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    async function loadParty() {
      try {
        const data = await getPartyDetails(id);

        console.log("async function loadParty -> data:", data);
        setParty(data);
      } catch (error) {
        if (error.response?.status === 403) {
          router.replace("/dashboard");
          toast({
            title: "Acceso denegado",
            description: "No sos parte de esta fiesta",
          });
        }

        console.error("Error al cargar los detalles de la fiesta:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadParty();
  }, [id]);

  const copyInviteCode = () => {
    if (party?.invite_code) {
      navigator.clipboard.writeText(party.invite_code);
      toast({
        title: "Código copiado",
        description: "El código de invitación ha sido copiado al portapapeles",
      });
    }
  };

  const leaveParty = async () => {
    // const confirmLeave = window.confirm(
    //   "¿Estás seguro que querés abandonar esta fiesta?"
    // );
    // if (!confirmLeave) return;

    try {
      await abandonParty(id);
      router.push("/dashboard"); // o refrescar lista de eventos
    } catch (error) {
      alert("No se pudo abandonar la fiesta.");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!party) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No se encontraron detalles de la fiesta
          </p>
        </CardContent>
      </Card>
    );
  }

  const isOrganizer = party?.organizer_id == user?.user.id;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{party.name}</h1>
              <Badge variant={isOrganizer ? "default" : "secondary"}>
                {isOrganizer ? "Organizador" : "Vendedor"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(party.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{party.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{party.ticketsSold} entradas vendidas</span>
              </div>
            </div>
          </div>
          {isOrganizer ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className="h-4 w-4 mr-2" />
                Código: {party.invite_code}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="destructive" size="sm" onClick={leaveParty}>
                Abandonar fiesta
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
