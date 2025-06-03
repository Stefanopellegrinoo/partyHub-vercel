"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  getPartyAttendees,
  exportAttendeesToCSV,
  changePaidStatus,
} from "@/services/attendee-service";
import type { Attendee } from "@/types/ticket";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { VirtualizedList } from "./virtualized-list";
import { useDebounce } from "@/hooks/use-debounce";
import { exportToCSV } from "@/lib/exportToCSV";
interface AttendeeWithTicket extends Attendee {
  tandas: any;
  ticketId: string;
  batchName: string;
  purchaseDate: string;
  status: string;
}

export function AttendeeList({ partyId }: { partyId: string }) {
  const [attendees, setAttendees] = useState<AttendeeWithTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const columns: ColumnDef<AttendeeWithTicket>[] = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Nombre",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("fullName")}</div>
        ),
      },
      {
        accessorKey: "documentId",
        header: "Documento",
      },

      {
        accessorKey: "batchName",
        header: "Tanda",
      },
      {
        accessorKey: "purchaseDate",
        header: "Fecha de compra",
        cell: ({ row }) => formatDate(row.getValue("purchaseDate")),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant={
                status === "pago"
                  ? "outline"
                  : status === "Validado"
                  ? "success"
                  : status === "No pago"
                  ? "destructive"
                  : "secondary"
              }
            >
              {status === "Pago"
                ? "Pago"
                : status === "Validado"
                ? "Validado"
                : status === "No pago"
                ? "No pago"
                : status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const attendee = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(attendee.email);
                    toast({
                      title: "Email copiado",
                      description: "El email ha sido copiado al portapapeles",
                    });
                  }}
                >
                  Copiar email
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(attendee.documentId);
                    toast({
                      title: "Documento copiado",
                      description:
                        "El documento ha sido copiado al portapapeles",
                    });
                  }}
                >
                  Copiar documento
                </DropdownMenuItem>
                {attendee.status === "No pago" && (
                  <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    changeStatus(attendee.id, attendee.status);
                  }}
                  >
                  Cambiar estado
                </DropdownMenuItem>
              
                  </>
              
              )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [toast]
  );

  useEffect(() => {
    loadAttendees();
  }, [partyId]);

  const loadAttendees = async () => {
    setIsLoading(true);
    try {
      const data = await getPartyAttendees(partyId);
      console.log(
        "attendee",
       data
      );
      // Extract unique batches for the filter
      // const uniqueBatches = Array.from(
      //   new Set(data.map((ticket) => JSON.stringify({ batchName: ticket.batchName })))
      // ).map((str) => JSON.parse(str));
      const uniqueBatches = Array.from(
        new Map(
          data.map((a) => [
            a.tanda_id,
            { id: a.tanda_id, name: a.tanda_name },
          ])
        ).values()
      );

      console.log("uniqueBatches", uniqueBatches);

      setBatches(uniqueBatches);

      // Transform tickets with attendees into the format we need
      const attendeesList: AttendeeWithTicket[] = data.map((ticket) => ({
        id: ticket.id,
        fullName: ticket.full_name,
        documentId: ticket.document_id,
        email: ticket.email,
        ticketId: ticket.tanda_id,
        batchName: ticket.tanda_name || "Desconocida",
        purchaseDate: ticket.created_at,
        status:
          ticket.validated_at == null
            ? ticket.paid
              ? "Pago"
              : "No pago"
            : "Validado",
        validated: ticket.validated_at,
      }));

      console.log("attendee", attendeesList);
      setAttendees(attendeesList);
    } catch (error) {
      console.error("Error al cargar los asistentes:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los asistentes. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportToCSV(attendees, "asistentes.csv");
      toast({
        title: "Exportación exitosa",
        description: `La lista de asistentes ha sido exportada como asistentes.csv`,
      });
    } catch (error) {
      console.error("Error al exportar los asistentes:", error);
      toast({
        title: "Error",
        description:
          "No se pudo exportar la lista de asistentes. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const changeStatus = async (attendeeId: string, status: string) => {
    try {
      if (status == "No pago") {
        const res = await changePaidStatus(attendeeId, partyId);

        if (!res) {
          throw new Error("Error al actualizar el estado");
        }

        console.log("✅ Asistente actualizado:", res);
        setAttendees((prev) =>
          prev.map((att) =>
            att.id === attendeeId
              ? { ...att, status: "Pago" } // o solo paid si mail_sent no es inmediato
              : att
          )
        );

        toast({
          title: "Estado actualizado",
          description: "El asistente fue marcado como pagado y se envió el QR",
        });
        return res;
      } else {
        console.warn("❌ Solo se permite cambiar a 'paid' por ahora");
        toast({
          title: "Error al cambiar estado",
          description: "Solo se permite cambiar a 'paid' por ahora",
        });
      }
    } catch (err) {
      console.error("❌ Error cambiando estado:", err.message);
    }
  };

  // Filter attendees based on search query and filters
  // Filter attendees based on search query and filters
  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      // Search filter
      const matchesSearch =
        debouncedSearchQuery === "" ||
        attendee.fullName
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        attendee.email
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        attendee.documentId
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      // Batch filter
      const matchesBatch =
        batchFilter === "all" || attendee.ticketId == batchFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || attendee.status === statusFilter;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [attendees, debouncedSearchQuery, batchFilter, statusFilter]);
  // Renderizar una tarjeta de asistente para la lista virtualizada
  const renderAttendeeCard = useCallback(
    (attendee: AttendeeWithTicket) => {
      return (
        <Card className="mb-2 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{attendee.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {attendee.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Doc: {attendee.documentId}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs">{attendee.batchName}</span>
                  <Badge
                    variant={
                      attendee.status === "Pago"
                        ? "outline"
                        : attendee.status === "Validado"
                        ? "success"
                        : attendee.status === "No pago"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {attendee.status === "Pago"
                      ? "Pago"
                      : attendee.status === "Validado"
                      ? "Validado"
                      : attendee.status === "No pago"
                      ? "No pago"
                      : attendee.status}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(attendee.email);
                      toast({
                        title: "Email copiado",
                        description: "El email ha sido copiado al portapapeles",
                      });
                    }}
                  >
                    Copiar email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(attendee.documentId);
                      toast({
                        title: "Documento copiado",
                        description:
                          "El documento ha sido copiado al portapapeles",
                      });
                    }}
                  >
                    Copiar documento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    },
    [toast]
  );
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Asistentes</CardTitle>
          <CardDescription>Cargando datos de asistentes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (attendees.length === 0) {
    return (
      <EmptyState
        icon={<FileSpreadsheet className="h-12 w-12 text-muted-foreground" />}
        title="No hay asistentes registrados"
        description="Aún no se han registrado asistentes para esta fiesta"
        action={
          <Button variant="outline" onClick={loadAttendees}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle>Lista de Asistentes</CardTitle>
          <CardDescription>
            {filteredAttendees.length} asistentes registrados para esta fiesta
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAttendees}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtrar asistentes</SheetTitle>
                <SheetDescription>
                  Aplica filtros para encontrar asistentes específicos
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Nombre, email o documento"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Tanda</Label>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger id="batch">
                      <SelectValue placeholder="Selecciona una tanda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las tandas</SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Validado">Validado</SelectItem>
                      <SelectItem value="No pago">No pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Aplicar filtros</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              Tabla
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("cards")}
            >
              Tarjetas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={filteredAttendees}
            searchColumn="fullName"
            searchPlaceholder="Buscar asistente..."
          />
        ) : (
          <VirtualizedList
            items={filteredAttendees}
            height={500}
            itemHeight={100}
            renderItem={(attendee) => renderAttendeeCard(attendee)}
            className="border rounded-md"
          />
        )}
      </CardContent>
    </Card>
  );
}
