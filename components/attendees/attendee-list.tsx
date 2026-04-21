"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPartyAttendees, deleteAttendee } from "@/services/attendee-service";
import { checkInTicket } from "@/services/ticket-service";
import type { Attendee, Ticket } from "@/types/ticket";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, RefreshCw, UserCheck, MoreVertical, Trash2, Mail, CreditCard, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { exportToCSV } from "@/lib/exportToCSV";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AttendeeWithTicket extends Attendee {
  id: string;
  ticket_code: string;
  batchName: string;
  status: string;
  email: string;
  documentId: string;
  fullName: string;
  purchaseDate: string;
}

export function AttendeeList({ partyId, enableCheckIn = false, onCheckInSuccess }: { partyId: string, enableCheckIn?: boolean, onCheckInSuccess?: (t: Ticket) => void }) {
  const [attendees, setAttendees] = useState<AttendeeWithTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendeeToDelete, setAttendeeToDelete] = useState<AttendeeWithTicket | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPartyAttendees(partyId);
      const mapped = data.map((t: any) => ({
        id: t.id,
        fullName: t.full_name,
        documentId: t.document_id,
        email: t.email,
        ticket_code: t.ticket_code,
        batchName: t.tanda_name,
        purchaseDate: t.created_at,
        status: t.validated_at ? "Validado" : t.paid ? "Pago" : "No pago"
      }));
      setAttendees(mapped);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [partyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckIn = async (attendee: AttendeeWithTicket) => {
    try {
      const res = await checkInTicket(partyId, attendee.ticket_code);
      if (res && res.status) {
        toast({ title: "INGRESO EXITOSO", description: `${attendee.fullName} ha entrado.` });
        setAttendees(prev => prev.map(a => a.id === attendee.id ? { ...a, status: "Validado" } : a));
        if (onCheckInSuccess) onCheckInSuccess(res);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!attendeeToDelete) return;
    try {
      await deleteAttendee(attendeeToDelete.id, partyId);
      toast({ title: "ELIMINADO", description: "El asistente fue removido del sistema." });
      setAttendees(prev => prev.filter(a => a.id !== attendeeToDelete.id));
      setAttendeeToDelete(null);
    } catch (e) {
      toast({ title: "ERROR", description: "No se pudo eliminar al asistente.", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "COPIADO", description: `${label} en el portapapeles.` });
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return attendees.filter(a => a.fullName.toLowerCase().includes(q) || a.documentId.includes(q));
  }, [attendees, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Lista de Acceso</h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            Identidades Registradas // {attendees.length} total
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={loadData} variant="outline" className="border-white/5 bg-white/5 rounded-none h-12 w-12 p-0">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => exportToCSV(attendees, 'asistentes.csv')} variant="outline" className="flex-1 md:flex-none border-white/5 bg-white/5 rounded-none h-12 font-black text-[10px] uppercase tracking-widest px-6">
            <Download className="h-4 w-4 mr-2" /> EXPORTAR CSV
          </Button>
        </div>
      </div>

      <Card className="bg-[#080808] border-white/5 rounded-none overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/5 bg-zinc-950/50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
              <Input 
                placeholder="BUSCAR POR NOMBRE O DNI..." 
                className="bg-transparent border-none focus-visible:ring-0 text-zinc-300 font-mono text-xs uppercase tracking-widest h-12 pl-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* --- MOBILE VIEW --- */}
          <div className="block sm:hidden divide-y divide-white/5">
            {filtered.map((attendee) => (
              <div key={attendee.id} className="p-6 space-y-4 hover:bg-white/[0.01]">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-lg font-black uppercase italic leading-none text-zinc-100">{attendee.fullName}</p>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">DNI: {attendee.documentId}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-700"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#080808] border-white/10 rounded-none text-zinc-300">
                      <DropdownMenuItem onClick={() => copyToClipboard(attendee.email, "Email")}>Copiar Email</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyToClipboard(attendee.documentId, "Documento")}>Copiar DNI</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem onClick={() => setAttendeeToDelete(attendee)} className="text-red-500">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                   <Badge className={
                    attendee.status === "Validado" ? "bg-[#7c3aed] text-white" :
                    attendee.status === "Pago" ? "bg-zinc-800 text-zinc-400" :
                    "bg-red-950/30 text-red-500"
                    + " rounded-none font-black text-[8px] uppercase tracking-[0.2em] px-2"}>
                    {attendee.status}
                  </Badge>
                   {enableCheckIn && attendee.status === "Pago" && (
                    <Button 
                      onClick={() => handleCheckIn(attendee)}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none h-12 w-1/2 font-black text-[10px] uppercase tracking-widest"
                    >INGRESAR</Button>
                   )}
                </div>
              </div>
            ))}
          </div>

          {/* --- DESKTOP VIEW --- */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-900/30 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Asistente</th>
                  <th className="px-8 py-4">Documento</th>
                  <th className="px-8 py-4">Tanda</th>
                  <th className="px-8 py-4">Estado</th>
                  <th className="px-8 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filtered.map((attendee) => (
                  <tr key={attendee.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black uppercase italic text-zinc-200">{attendee.fullName}</p>
                      <p className="text-[10px] text-zinc-600">{attendee.email}</p>
                    </td>
                    <td className="px-8 py-6 text-xs text-zinc-500 tracking-widest">{attendee.documentId}</td>
                    <td className="px-8 py-6 text-[10px] text-zinc-600 uppercase">{attendee.batchName}</td>
                    <td className="px-8 py-6">
                      <Badge className={
                        attendee.status === "Validado" ? "bg-[#7c3aed] text-white" :
                        attendee.status === "Pago" ? "bg-zinc-800 text-zinc-400" :
                        "bg-red-950/30 text-red-500 border border-red-500/20"
                        + " rounded-none font-black text-[9px] uppercase tracking-widest px-2"}>
                        {attendee.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {enableCheckIn && attendee.status === "Pago" && (
                          <Button 
                            onClick={() => handleCheckIn(attendee)}
                            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none h-10 font-black text-[9px] uppercase tracking-widest px-4 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                          >INGRESAR</Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-800 group-hover:text-zinc-400 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#080808] border-white/10 rounded-none text-zinc-300">
                             <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => copyToClipboard(attendee.email, "Email")}><Mail className="h-3.5 w-3.5" /> Copiar Email</DropdownMenuItem>
                             <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => copyToClipboard(attendee.documentId, "Documento")}><Copy className="h-3.5 w-3.5" /> Copiar DNI</DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-white/5" />
                             <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:text-red-500" onClick={() => setAttendeeToDelete(attendee)}><Trash2 className="h-3.5 w-3.5" /> Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-zinc-950/20">
              <Search className="h-10 w-10 text-zinc-800 mx-auto opacity-20" />
              <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em]">SIN COINCIDENCIAS</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <AlertDialog open={!!attendeeToDelete} onOpenChange={(open) => !open && setAttendeeToDelete(null)}>
        <AlertDialogContent className="bg-[#080808] border-white/5 rounded-none text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter italic">¿BORRAR ASISTENTE?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
              Esta acción eliminará a {attendeeToDelete?.fullName} permanentemente. El cupo será liberado en la tanda correspondiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-none rounded-none font-bold text-[10px] uppercase tracking-widest">CANCELAR</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-none font-bold text-[10px] uppercase tracking-widest">ELIMINAR ASISTENTE</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
