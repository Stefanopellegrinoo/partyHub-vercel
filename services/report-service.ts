import axios from "@/lib/axios"

// Mock data for development/preview
const mockReports = {
  totalRevenue: 12750,
  totalTicketsSold: 145,
  salesByBatch: [
    { batchName: "Early Bird", totalSales: 75, revenue: 3750 },
    { batchName: "Regular", totalSales: 50, revenue: 3750 },
    { batchName: "VIP", totalSales: 20, revenue: 3000 },
    { batchName: "General", totalSales: 0, revenue: 0 },
    { batchName: "Preventa", totalSales: 0, revenue: 0 },
  ],
  salesBySeller: [
    { sellerName: "Juan Pérez", totalSales: 45, revenue: 3375 },
    { sellerName: "María García", totalSales: 60, revenue: 4500 },
    { sellerName: "Carlos López", totalSales: 40, revenue: 4875 },
  ],
}

export async function getPartyReports(eventId: string) {
  try {
    // In development without API, return mock data
    const response = await axios.get(`/report/events/${eventId}/report`)
    return response.data
  } catch (error) {
    console.error("Error fetching party reports:", error)
    // Return mock data on error in development
    throw error
  }
}
