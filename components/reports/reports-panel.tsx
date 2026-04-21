"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPartyReports } from "@/services/report-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Download, BarChart3, Users, DollarSign, Zap } from "lucide-react"
import { exportToCSV } from "@/lib/exportToCSV"
import { Badge } from "@/components/ui/badge"

interface SalesData {
  batchName: string
  totalSales: number
  revenue: number
  unpaidSales: number
}

interface SellerData {
  sellerName: string
  totalSales: number
  revenue: number
}

interface ReportData {
  totalRevenue: number
  totalTicketsSold: number
  totalUnpaidTickets: number
  salesByBatch: SalesData[]
  salesBySeller: SellerData[]
}

export function ReportsPanel({ partyId }: { partyId: string }) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveTab] = useState<"batch" | "seller">("batch")

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getPartyReports(partyId)
        if (data) {
          data.totalRevenue = Number(data.totalRevenue) || 0
          data.totalTicketsSold = Number(data.totalTicketsSold) || 0
          data.totalUnpaidTickets = Number(data.totalUnpaidTickets) || 0
        }
        setReportData(data)
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    loadReports();
  }, [partyId])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#080808] border border-[#7c3aed]/30 p-4 font-mono">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-white italic uppercase">{payload[0].name}: {payload[0].value}</p>
          {payload[1] && <p className="text-sm font-black text-[#7c3aed] italic uppercase">{payload[1].name}: ${payload[1].value}</p>}
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div className="h-96 w-full bg-white/5 animate-pulse" />;
  if (!reportData) return <p className="text-center py-20 text-zinc-800 font-black uppercase tracking-[0.4em]">NO DATA</p>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- BIG STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5 border border-white/5 p-1">
        <div className="bg-[#020202] p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-500"><DollarSign className="h-3 w-3" /><span className="text-[9px] font-black uppercase tracking-widest">Revenue</span></div>
          <div className="text-5xl font-black italic tracking-tighter text-[#7c3aed]">${reportData.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-[#020202] p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-500"><Users className="h-3 w-3" /><span className="text-[9px] font-black uppercase tracking-widest">Paid Tickets</span></div>
          <div className="text-5xl font-black italic tracking-tighter">{reportData.totalTicketsSold}</div>
        </div>
        <div className="bg-[#020202] p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-500"><Zap className="h-3 w-3" /><span className="text-[9px] font-black uppercase tracking-widest">Pending</span></div>
          <div className="text-5xl font-black italic tracking-tighter text-red-500">{reportData.totalUnpaidTickets}</div>
        </div>
      </div>

      {/* --- CHART SECTION --- */}
      <div className="bg-[#080808] border border-white/5 rounded-none overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
             <h3 className="text-3xl font-black uppercase tracking-tighter italic">Ventas Visualizadas</h3>
             <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Module: Real-time Analysis</p>
           </div>
           <div className="flex border border-white/10 p-1">
              <Button 
                onClick={() => setActiveTab("batch")}
                className={`rounded-none h-10 px-6 text-[10px] font-black uppercase tracking-widest ${activeView === "batch" ? "bg-[#7c3aed] text-white" : "bg-transparent text-zinc-500 hover:text-white"}`}
              >POR TANDA</Button>
              <Button 
                onClick={() => setActiveTab("seller")}
                className={`rounded-none h-10 px-6 text-[10px] font-black uppercase tracking-widest ${activeView === "seller" ? "bg-[#7c3aed] text-white" : "bg-transparent text-zinc-500 hover:text-white"}`}
              >POR EQUIPO</Button>
           </div>
        </div>

        <div className="p-8">
           <div className="h-96 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={activeView === "batch" ? reportData.salesByBatch : reportData.salesBySeller}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                 <XAxis 
                   dataKey={activeView === "batch" ? "batchName" : "sellerName"} 
                   stroke="#52525b" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false}
                   tickFormatter={(val) => val?.toUpperCase()}
                 />
                 <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
                 <Bar dataKey="totalSales" name="VENTAS" radius={[2, 2, 0, 0]}>
                    {(activeView === "batch" ? reportData.salesByBatch : reportData.salesBySeller).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7c3aed" : "#6d28d9"} />
                    ))}
                 </Bar>
                 <Bar dataKey="revenue" name="INGRESOS" fill="#ffffff" opacity={0.1} radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="p-8 bg-zinc-950 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-[#7c3aed]" />
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Full system report ready for export</span>
           </div>
           <Button 
             onClick={() => exportToCSV(activeView === "batch" ? reportData.salesByBatch : reportData.salesBySeller, "reporte.csv")}
             variant="outline" 
             className="border-white/10 bg-white/5 hover:bg-white/10 rounded-none h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em]"
           >
             <Download className="h-4 w-4 mr-2" /> EXPORT CSV
           </Button>
        </div>
      </div>
    </div>
  )
}
