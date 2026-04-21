"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Componentes de carga para mostrar mientras se cargan los componentes reales
const LoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full max-w-sm" />
    <Skeleton className="h-32 w-full" />
  </div>
)

const TableLoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
)

const ChartLoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full max-w-sm" />
    <Skeleton className="h-64 w-full" />
  </div>
)

const FormLoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full max-w-sm" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-40" />
  </div>
)

// Carga diferida de componentes pesados
export const LazyReportsPanel = dynamic(
  () => import("@/components/reports/reports-panel").then((mod) => ({ default: mod.ReportsPanel })),
  {
    loading: () => <ChartLoadingFallback />,
    ssr: false,
  },
)

export const LazyCanceledTicketsTab = dynamic(
  () => import("@/components/parties/canceled-tickets-tab").then((mod) => ({ default: mod.CanceledTicketsTab })),
  {
    loading: () => <TableLoadingFallback />,
    ssr: false,
  },
)

export const LazyQRScanner = dynamic(
  () => import("@/components/check-in/qr-scanner").then((mod) => ({ default: mod.QRScanner })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
)

export const LazyAttendeeList = dynamic(
  () => import("@/components/attendees/attendee-list").then((mod) => ({ default: mod.AttendeeList })),
  {
    loading: () => <TableLoadingFallback />,
    ssr: false,
  },
)

export const LazySellerPanel = dynamic(
  () => import("@/components/seller/seller-panel").then((mod) => ({ default: mod.SellerPanel })),
  {
    loading: () => <FormLoadingFallback />,
    ssr: false,
  },
)

export const LazySellerManagement = dynamic(
  () => import("@/components/parties/seller-management").then((mod) => ({ default: mod.SellerManagement })),
  {
    loading: () => <TableLoadingFallback />,
    ssr: false,
  },
)

export const LazyTicketBatchList = dynamic(
  () => import("@/components/tickets/ticket-batch-list").then((mod) => ({ default: mod.TicketBatchList })),
  {
    loading: () => <TableLoadingFallback />,
    ssr: false,
  },
)

export const LazyPartyDetails = dynamic(
  () => import("@/components/parties/party-details").then((mod) => ({ default: mod.PartyDetails })),
  {
    loading: () => <LoadingFallback />,
    ssr: false,
  },
)

// export const LazyTicketQRCode = dynamic(
//   () => import("@/components/tickets/ticket-qr-code").then((mod) => ({ default: mod.TicketQRCode })),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false,
//   },
// )

export const LazyPartyList = dynamic(
  () => import("@/components/parties/party-list").then((mod) => ({ default: mod.PartyList })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    ),
    ssr: false,
  },
)

// export const LazyDashboardStats = dynamic(
//   () => import("@/components/dashboard/dashboard-stats").then((mod) => ({ default: mod.DashboardStats })),
//   {
//     loading: () => (
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <Skeleton key={i} className="h-32 w-full" />
//         ))}
//       </div>
//     ),
//     ssr: false,
//   },
// )

// export const LazyRecentActivity = dynamic(
//   () => import("@/components/dashboard/recent-activity").then((mod) => ({ default: mod.RecentActivity })),
//   {
//     loading: () => <TableLoadingFallback />,
//     ssr: false,
//   },
// )
