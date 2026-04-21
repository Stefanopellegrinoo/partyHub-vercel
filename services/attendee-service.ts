import { api } from "@/lib/axios"
import type { Ticket, AttendeeListFilters, Attendee } from "@/types/ticket"
import { getTickets } from "@/services/ticket-service"

// Function to get all attendees for a party
export async function getPartyAttendees(partyId: string, filters?: AttendeeListFilters): Promise<Ticket[]> {
  try {
    // In development without API, use the ticket service

    const response = await api.get<Ticket[]>(`/attendees/parties/${partyId}`, { params: filters })
    return response
  } catch (error) {
    console.error("Error fetching party attendees:", error)

    throw error
  }
}

// Function to export attendees to CSV
export async function exportAttendeesToCSV(partyId: string, filters?: AttendeeListFilters): Promise<string> {
  try {

    const response = await api.get<{ filename: string }>(`/parties/${partyId}/attendees/export`, {
      params: filters,
      responseType: "blob",
    })

    return response.filename
  } catch (error) {
    console.error("Error exporting attendees to CSV:", error)
    throw error
  }
}


export async function changePaidStatus(attendeeId: string, eventId: string): Promise<Attendee> {
  try {
    const response = await api.put<Attendee>(`/attendees/${attendeeId}/event/${eventId}/mark-paid`)
    return response
  } catch (error) {
    console.error("Error changing paid status:", error)
    throw error
  }
}

export async function deleteAttendee(attendeeId: string, eventId: string): Promise<void> {
  try {
    await api.delete(`/attendees/${attendeeId}/event/${eventId}`)
  } catch (error) {
    console.error("Error deleting attendee:", error)
    throw error
  }
}