"use client";

import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react";
import { PartyDetails } from "@/components/parties/party-details";
import { TicketBatchList } from "@/components/tickets/ticket-batch-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerPanel } from "@/components/seller/seller-panel";
import { ReportsPanel } from "@/components/reports/reports-panel";
import { checkOrganizer } from "@/services/party-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useParams } from "next/navigation";
import { AttendeeList } from "@/components/attendees/attendee-list";
import { SellerManagement } from "@/components/parties/seller-management";
import { Button } from "@/components/ui/button";
import { QrCode, Users, BarChart3, Ticket, UserCog } from "lucide-react";
import Link from "next/link";
import {
  LazyPartyDetails,
  LazyTicketBatchList,
  LazySellerPanel,
  LazyAttendeeList,
  LazySellerManagement,
  LazyReportsPanel,
} from "@/components/lazy-components";
export default function PartyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const partyDetails = await checkOrganizer(id);
       console.log("Party details:", partyDetails.isOrganizer);
        setIsOrganizer(partyDetails.isOrganizer);
      } catch (error) {
        console.error("Error al verificar el rol:", error);
        if ( error.response?.status === 403) {
          router.replace("/dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkRole();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <LazyPartyDetails id={id} />
      </Suspense>

      {isOrganizer && (
        <div className="flex justify-end">
          <Link href={`/dashboard/party/${id}/check-in`}>
            <Button variant="outline" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Escanear Entradas
            </Button>
          </Link>
        </div>
      )}

      <Tabs
        defaultValue={isOrganizer ? "batches" : "seller"}
        className="w-full"
      >
        <TabsList
          className={`grid w-full ${
            isOrganizer ? "grid-cols-5" : "grid-cols-2"
          }`}
        >
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Tandas</span>
            <span className="sm:hidden">Tandas</span>
          </TabsTrigger>
          <TabsTrigger value="seller" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Vender</span>
            <span className="sm:hidden">Vender</span>
          </TabsTrigger>
          {isOrganizer && (
            <>
              <TabsTrigger
                value="attendees"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Asistentes</span>
                <span className="sm:hidden">Asistentes</span>
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Vendedores</span>
                <span className="sm:hidden">Vendedores</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Reportes</span>
                <span className="sm:hidden">Reportes</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="batches" className="mt-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LazyTicketBatchList partyId={id} isOrganizer={isOrganizer}/>
          </Suspense>
        </TabsContent>
        <TabsContent value="seller" className="mt-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LazySellerPanel partyId={id} />
          </Suspense>
        </TabsContent>
        {isOrganizer && (
          <>
            <TabsContent value="attendees" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazyAttendeeList partyId={id} />
              </Suspense>
            </TabsContent>
            <TabsContent value="sellers" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazySellerManagement partyId={id} />
              </Suspense>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazyReportsPanel partyId={id} />
              </Suspense>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
