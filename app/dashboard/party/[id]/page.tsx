"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkOrganizer } from "@/services/party-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { QrCode, Users, BarChart3, Ticket, UserCog, History } from "lucide-react";
import Link from "next/link";
import {
  LazyPartyDetails,
  LazyTicketBatchList,
  LazySellerPanel,
  LazyAttendeeList,
  LazySellerManagement,
  LazyReportsPanel,
  LazyCanceledTicketsTab,
} from "@/components/lazy-components";

export default function PartyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { id } = useParams();
  
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar la pestaña inicial
  const [activeTab, setActiveTab] = useState<string>("batches");

  useEffect(() => {
    async function checkRole() {
      try {
        const partyDetails = await checkOrganizer(id as string);
        setIsOrganizer(!!partyDetails.isOrganizer);
        
        // Una vez que sabemos el rol, decidimos la tab si no hay una en la URL
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl) {
          setActiveTab(tabFromUrl);
        } else {
          setActiveTab(partyDetails.isOrganizer ? "batches" : "seller");
        }

      } catch (error) {
        console.error("Error al verificar el rol:", error);
        if (error.response?.status === 403) {
          router.replace("/dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkRole();
  }, [id, searchParams, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/dashboard/party/${id}?${params.toString()}`, { scroll: false });
  };

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
        <LazyPartyDetails id={id as string} />
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
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          className={`grid w-full h-auto p-0 bg-transparent gap-1 ${
            isOrganizer ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-2"
          }`}
        >
          {[
            { value: "batches", label: "TANDAS", icon: Ticket },
            { value: "seller", label: "VENDER", icon: UserCog },
            { value: "attendees", label: "ASISTENTES", icon: Users, orgOnly: true },
            { value: "sellers", label: "EQUIPO", icon: UserCog, orgOnly: true },
            { value: "reports", label: "REPORTES", icon: BarChart3, orgOnly: true },
            { value: "canceled", label: "POOL", icon: History, orgOnly: true },
          ].filter(tab => !tab.orgOnly || isOrganizer).map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex flex-col items-center gap-2 py-4 rounded-none border-b-2 border-white/5 data-[state=active]:border-[#7c3aed] data-[state=active]:bg-[#7c3aed]/5 data-[state=active]:text-[#7c3aed] text-zinc-600 transition-all"
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="batches" className="mt-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LazyTicketBatchList partyId={id as string} isOrganizer={isOrganizer}/>
          </Suspense>
        </TabsContent>
        <TabsContent value="seller" className="mt-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LazySellerPanel partyId={id as string} />
          </Suspense>
        </TabsContent>
        {isOrganizer && (
          <>
            <TabsContent value="attendees" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazyAttendeeList partyId={id as string} />
              </Suspense>
            </TabsContent>
            <TabsContent value="sellers" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazySellerManagement partyId={id as string} />
              </Suspense>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazyReportsPanel partyId={id as string} />
              </Suspense>
            </TabsContent>
            <TabsContent value="canceled" className="mt-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <LazyCanceledTicketsTab partyId={id as string} />
              </Suspense>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
