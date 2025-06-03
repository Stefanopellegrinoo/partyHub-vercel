"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPartyReports } from "@/services/report-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download, FileSpreadsheet, Printer } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { exportToCSV } from "@/lib/exportToCSV"

interface SalesData {
  batchName: string
  totalSales: number
  revenue: number
}

interface SellerData {
  sellerName: string
  totalSales: number
  revenue: number
}

interface ReportData {
  totalUnpaidTickets: ReactNode
  totalRevenue: number
  totalTicketsSold: number
  salesByBatch: SalesData[]
  salesBySeller: SellerData[]
}

// Agregar definiciones de columnas antes del componente ReportsPanel:
const batchColumns: ColumnDef<any>[] = [
  {
    accessorKey: "batchName",
    header: "Tanda",
  },
  {
    accessorKey: "totalSales",
    header: "Entradas Vendidas",
    cell: ({ row }) => <div className="text-right">{row.getValue("totalSales") || 0}</div>,
  },
   {
    accessorKey: "unpaidSales",
    header: "Entradas No Pagadas",
    cell: ({ row }) => <div className="text-right">{row.getValue("unpaidSales") || 0}</div>,
  },
  {
    accessorKey: "revenue",
    header: "Ingresos",
    cell: ({ row }) => {
      const revenue = row.getValue("revenue")
      // Verificar que revenue existe y es un número
      return <div className="text-right">${typeof revenue === "number" ? revenue.toFixed(2) : "0.00"}</div>
    },
  },
]

const sellerColumns: ColumnDef<any>[] = [
  {
    accessorKey: "sellerName",
    header: "Vendedor",
  },
  {
    accessorKey: "totalSales",
    header: "Entradas Vendidas",
    cell: ({ row }) => <div className="text-right">{row.getValue("totalSales") || 0}</div>,
  },
  {
    accessorKey: "revenue",
    header: "Ingresos",
    cell: ({ row }) => {
      const revenue = row.getValue("revenue")
      // Verificar que revenue existe y es un número
      return <div className="text-right">${typeof revenue === "number" ? revenue.toFixed(2) : "0.00"}</div>
    },
  },
]

export function ReportsPanel({ partyId }: { partyId: string }) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getPartyReports(partyId)
        // Asegurarse de que todos los datos numéricos existan
       
        if (data) {
          // Asegurar que totalRevenue y totalTicketsSold sean números
          data.totalRevenue = typeof data.totalRevenue === "number" ? data.totalRevenue : 0
          data.totalTicketsSold = typeof data.totalTicketsSold === "number" ? data.totalTicketsSold : 0
          data.totalUnpaidTickets = typeof data.totalUnpaidTickets === "number" ? data.totalUnpaidTickets : 0
          // Asegurar que salesByBatch tenga valores numéricos
          if (Array.isArray(data.salesByBatch)) {
            data.salesByBatch = data.salesByBatch.map((batch) => ({
              batchName: batch.batchName || "Sin nombre",
              totalSales: typeof batch.totalSales === "number" ? batch.totalSales : 0,
              revenue: typeof batch.revenue === "number" ? batch.revenue : 0,
              unpaidSales: typeof batch.unpaidSales === "number" ? batch.unpaidSales : 0,
            }))
          } else {
            data.salesByBatch = []
          }

          // Asegurar que salesBySeller tenga valores numéricos
          if (Array.isArray(data.salesBySeller)) {
            data.salesBySeller = data.salesBySeller.map((seller) => ({
              sellerName: seller.sellerName || "Sin nombre",
              totalSales: typeof seller.totalSales === "number" ? seller.totalSales : 0,
              revenue: typeof seller.revenue === "number" ? seller.revenue : 0,
            }))
          } else {
            data.salesBySeller = []
          }
        }
         console.log("Datos de reportes:", data)
        setReportData(data)
      } catch (error) {
        console.error("Error al cargar los reportes:", error)
        // Establecer datos por defecto en caso de error
        setReportData({
          totalRevenue: 0,
          totalTicketsSold: 0,
          totalUnpaidTickets: 0,
          salesByBatch: [],
          salesBySeller: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [partyId])



  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes y Administración</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes y Administración</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Reportes y Administración</CardTitle>
              <CardDescription>Analiza las ventas y gestiona las tandas</CardDescription>
            </div>
            {/* <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${reportData.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Entradas Vendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reportData.totalTicketsSold}</div>
              </CardContent>
            </Card>
              <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Entradas No Pagadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reportData.totalUnpaidTickets}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="by-batch">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-batch">Por Tanda</TabsTrigger>
              <TabsTrigger value="by-seller">Por Vendedor</TabsTrigger>
            </TabsList>

            <TabsContent value="by-batch" className="space-y-4">
              {reportData.salesByBatch && reportData.salesByBatch.length > 0 ? (
                <>
                  <div className="h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.salesByBatch} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="batchName" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="totalSales" name="Entradas Vendidas" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="revenue" name="Ingresos ($)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <DataTable
                    columns={batchColumns}
                    data={reportData.salesByBatch}
                    searchColumn="batchName"
                    searchPlaceholder="Buscar tanda..."
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(reportData.salesByBatch, "ventas-por-tanda.csv")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No hay datos de ventas por tanda disponibles.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="by-seller" className="space-y-4">
              {reportData.salesBySeller && reportData.salesBySeller.length > 0 ? (
                <>
                  <div className="h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.salesBySeller} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sellerName" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="totalSales" name="Entradas Vendidas" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="revenue" name="Ingresos ($)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <DataTable
                    columns={sellerColumns}
                    data={reportData.salesBySeller}
                    searchColumn="sellerName"
                    searchPlaceholder="Buscar vendedor..."
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(reportData.salesBySeller, "ventas-por-vendedor.csv")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No hay datos de ventas por vendedor disponibles.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
