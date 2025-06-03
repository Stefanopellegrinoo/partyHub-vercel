import type { TicketBatch, Ticket, TicketBatchCreate, TicketStats, TicketFilters, Attendee } from "@/types/ticket"
import { api } from "@/lib/axios"
import { generateRandomCode } from "@/lib/utils"
import { sendTicketConfirmationEmail } from "@/services/email-service"
import { getPartyDetails } from "@/services/party-service"
import { cacheService } from "@/lib/cache-service"



export async function getTicketBatches(partyId: string): Promise<TicketBatch[]> {
  try {

    const response = await api.get<TicketBatch[]>(`/tandas/parties/${partyId}/batches`)
    return response
  } catch (error) {
    console.error("Error fetching ticket batches:", error)
    // Return mock data on error in development

    throw error
  }
}

export async function getTicketBatchDetails(partyId: string, batchId: string): Promise<TicketBatch> {
  try {

    const response = await api.get<TicketBatch>(`/tandas/parties/${partyId}/batches/${batchId}`)
    return response
  } catch (error) {
    console.error("Error fetching ticket batch details:", error)
    throw error
  }
}

export async function createTicketBatch(partyId: string, data: TicketBatchCreate): Promise<TicketBatch> {
  try {
    const response = await api.post<TicketBatch>(`/tandas/parties/${partyId}/batches`, data)
    return response
  } catch (error) {
    console.error("Error creating ticket batch:", error)
    throw error
  }
}

export async function checkExistingReservation(): Promise<TicketBatch> {
  try {

    const response = await api.get<TicketBatch>(`/tickets/reservations`)
    return response
  } catch (error) {
    console.error("Error creating ticket batch:", error)
    throw error
  }
}


export async function updateTicketBatch(
  partyId: string,
  batchId: string,
  data: Partial<TicketBatchCreate>,
): Promise<TicketBatch> {
  try {

    const response = await api.put<TicketBatch>(`/parties/${partyId}/batches/${batchId}`, data)
    return response
  } catch (error) {
    console.error("Error updating ticket batch:", error)
    throw error
  }
}

export async function toggleTicketBatchStatus(
  partyId: string,
  batchId: string,
  isActive: boolean,
): Promise<TicketBatch> {
  try {

    const response = await api.patch<TicketBatch>(`/tandas/parties/${partyId}/batches/${batchId}/toggle`, { isActive })
    return response
  } catch (error) {
    console.error("Error toggling batch status:", error)
    throw error
  }
}

export async function deleteTicketBatch(partyId: string, batchId: string): Promise<void> {
  try {

    await api.delete(`/parties/${partyId}/batches/${batchId}`)
  } catch (error) {
    console.error("Error deleting ticket batch:", error)
    throw error
  }
}

export async function reserveTickets(
  partyId: string,
  batchId: string,
  quantity: number,
): Promise<{ reservationId: string; expiresAt: string }> {
  try {
  
    const response = await api.post<{ reservationId: string; expiresAt: string }>(
      `/tickets/parties/${partyId}/batches/${batchId}/reserve`,
      { quantity },
    )
    return response
  } catch (error) {
    console.error("Error reserving tickets:", error)
    throw error
  }
}

export async function confirmTicketSale(
  partyId: string,
  batchId: string,
  attendees: Attendee[]
): Promise<Ticket[]> {
  try {
    // In development without API, simulate confirmation


    const response = await api.post<Ticket[]>(`/tickets/parties/${partyId}/batches/${batchId}/confirm`,
   { attendees } // ✅ Mandás el body

  )
    return response
  } catch (error) {
    console.error("Error confirming ticket sale:", error)
    throw error
  }
}

export async function getTickets(
  partyId: string,
  filters?: TicketFilters & {
    page?: number
    limit?: number
  },
): Promise<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> {
  try {
    // In development without API, return mock data


    const response = await api.get<{ tickets: Ticket[]; total: number; page: number; totalPages: number }>(
      `/parties/${partyId}/tickets`,
      { params: filters },
    )
    return response
  } catch (error) {
    console.error("Error fetching tickets:", error)
    throw error
  }
}

// export async function getTicketDetails(partyId: string, ticketId: string): Promise<Ticket> {
//   try {
//     // In development without API, return mock data
//     if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
//       await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

//       const tickets = mockTickets[partyId] || []
//       const ticket = tickets.find((t) => t.id === ticketId)

//       if (!ticket) {
//         throw new Error("Ticket not found")
//       }

//       return ticket
//     }

//     const response = await api.get<Ticket>(`/parties/${partyId}/tickets/${ticketId}`)
//     return response
//   } catch (error) {
//     console.error("Error fetching ticket details:", error)
//     throw error
//   }
// }
export async function getBatchTickets(batchId: string): Promise<Ticket[]> {
  const cacheKey = `batch_${batchId}_tickets`
  const cachedData = cacheService.get<Ticket[]>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const response = await api.get(`/batches/${batchId}/tickets`)
  cacheService.set(cacheKey, response.data, 30000) // Caché de 30 segundos
  return response.data
}

// Obtener detalles de un ticket
export async function getTicketDetails(ticketId: string): Promise<Ticket> {
  const cacheKey = `ticket_${ticketId}`
  const cachedData = cacheService.get<Ticket>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const response = await api.get(`/tickets/${ticketId}`)
  cacheService.set(cacheKey, response.data, 60000) // Caché de 1 minuto
  return response.data
}

// Reservar un ticket
export async function reserveTicket(batchId: string, customerData: any): Promise<Ticket> {
  const response = await api.post(`/batches/${batchId}/reserve`, customerData)
  // Invalidar cachés relacionadas
  cacheService.delete(`batch_${batchId}_tickets`)
  return response.data
}

// Confirmar un ticket
export async function confirmTicket(ticketId: string, attendeeData: any): Promise<Ticket> {
  const response = await api.post(`/tickets/${ticketId}/confirm`, attendeeData)
  // Invalidar cachés relacionadas
  cacheService.delete(`ticket_${ticketId}`)
  const batchId = response.data.batchId
  if (batchId) {
    cacheService.delete(`batch_${batchId}_tickets`)
  }
  return response.data
}

// Cancelar un ticket
export async function cancelTicketNew(ticketId: string): Promise<void> {
  const ticket = await getTicketDetails(ticketId)
  await api.post(`/tickets/${ticketId}/cancel`)
  // Invalidar cachés relacionadas
  cacheService.delete(`ticket_${ticketId}`)
  if (ticket.batchId) {
    cacheService.delete(`batch_${ticket.batchId}_tickets`)
  }
}

// Verificar un ticket para check-in
export async function verifyTicketNew(
  ticketId: string,
  partyId: string,
): Promise<{
  ticket?: Ticket
  isValid: boolean
  message?: string
}> {
  const response = await api.post(`/tickets/${ticketId}/verify`, { partyId })
  return response.data
}

// Realizar check-in de un ticket
export async function checkInTicketNew(partyId: string, ticketId: string): Promise<Ticket> {
  const response = await api.post(`/tickets/${ticketId}/check-in`, { partyId })
  // Invalidar cachés relacionadas
  cacheService.delete(`ticket_${ticketId}`)
  cacheService.invalidatePattern(`party_${partyId}_attendees`)
  return response.data
}

// Reenviar email de ticket
export async function resendTicketEmailNew(ticketId: string): Promise<{ success: boolean; message: string }> {
  const response = await api.post(`/tickets/${ticketId}/resend-email`)
  return response.data
}

export async function checkInTicket(partyId: string, ticket_code: string): Promise<Ticket> {
  try {

    const response = await api.post<Ticket>(`/validation/validate-qr`, { ticket_code })
    return response
  } catch (error) {
    console.error("Error checking in ticket:", error)
    throw error
  }
}

export async function cancelTicket(partyId: string, batchId: string): Promise<Ticket> {
  try {

    const response = await api.post<Ticket>(`/tickets/parties/${partyId}/batches/${batchId}/cancel`)
    return response
  } catch (error) {
    console.error("Error cancelling ticket:", error)
    throw error
  }
}

export async function getTicketStats(partyId: string): Promise<TicketStats> {
  try {

    const response = await api.get<TicketStats>(`/parties/${partyId}/tickets/stats`)
    return response
  } catch (error) {
    console.error("Error fetching ticket stats:", error)

    throw error
  }
}

export async function verifyTicket(
  ticketId: string,
  partyId: string,
): Promise<{
  isValid: boolean
  ticket?: Ticket
  message?: string
}> {
  try {
   const response = await api.get<{
      isValid: boolean
      ticket?: Ticket
      message?: string
    }>(`/tickets/verify/${ticketId}?partyId=${partyId}`)

    return response
  } catch (error) {
    console.error("Error verifying ticket:", error)
    return {
      isValid: false,
      message: "Error verifying ticket",
    }
  }
}

export async function generateTicketQR(ticketId: string, partyId: string): Promise<string> {
  try {
  const response = await api.get<{ qrUrl: string }>(`/parties/${partyId}/tickets/${ticketId}/qr`)
    return response.qrUrl
  } catch (error) {
    console.error("Error generating ticket QR:", error)
    throw error
  }
}
