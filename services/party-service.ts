import type {
  Party,
  PartyCreate,
  PartyMember,
  PartyStats,
  PartyFilters,
} from "@/types/party";
import { api } from "@/lib/axios";
import { generateRandomCode } from "@/lib/utils";
import { cacheService } from "@/lib/cache-service";

export async function getParties(filters?: PartyFilters): Promise<Party[]> {
  try {
    const response = await api.get<Party[]>("/parties/user", {
      params: filters,
    });
    return response;
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }
}


export async function checkOrganizer(partyId: string): Promise<Boolean> {
  try {
    // In development without API, return mock data

    const response = await api.get<Boolean>(
      `/parties/${partyId}/is-organizer`
    );
    return response;
  } catch (error) {
    console.error("Error fetching party members:", error);
    throw error;
  }
}


export async function getPartyDetails(id: string): Promise<Party> {
  try {
    const cacheKey = `party_details_${id}`;
    const cachedData = cacheService.get<Party>(cacheKey);

    if (cachedData) {
      console.log("Using cached data for party details");
      return cachedData;
    }
    const response = await api.get<Party>(`/parties/${id}`);
    cacheService.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error("Error fetching party details:", error);
    throw error;
  }
}

export async function createParty(data: PartyCreate): Promise<Party> {
  try {
    const response = await api.post<Party>("/parties", data);
    return response;
  } catch (error) {
    console.error("Error creating party:", error);
    throw error;
  }
}

export async function updateParty(
  id: string,
  data: Partial<PartyCreate>
): Promise<Party> {
  try {
    const response = await api.put<Party>(`/parties/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating party:", error);
    throw error;
  }
}

export async function deleteParty(id: string): Promise<void> {
  try {
    // In development without API, update mock data

    await api.delete(`/parties/${id}`);
  } catch (error) {
    console.error("Error deleting party:", error);
    throw error;
  }
}

export async function abandonParty(id: string): Promise<void> {
  try {
    // In development without API, update mock data

    await api.delete(`/sellers/${id}/leave`);
  } catch (error) {
    console.error("Error deleting party:", error);
    throw error;
  }
}


export async function joinParty(code: string): Promise<Party> {
  try {
    const response = await api.post<Party>("/parties/join", { code });
    return response;
  } catch (error) {
    console.error("Error joining party:", error);
    throw error;
  }
}

export async function getPartyMembers(partyId: string): Promise<PartyMember[]> {
  try {
    // In development without API, return mock data

    const response = await api.get<PartyMember[]>(
      `/parties/${partyId}/members`
    );
    return response;
  } catch (error) {
    console.error("Error fetching party members:", error);
    throw error;
  }
}

export async function invitePartyMember(
  partyId: string,
  email: string,
  role: string
): Promise<PartyMember> {
  try {
    // In development without API, return mock data

    const response = await api.post<PartyMember>(
      `/parties/${partyId}/members/invite`,
      { email, role }
    );
    return response;
  } catch (error) {
    console.error("Error inviting party member:", error);
    throw error;
  }
}

export async function removePartyMember(
  partyId: string,
  userId: string
): Promise<void> {
  try {
    // In development without API, update mock data

    await api.delete(`/parties/${partyId}/members/${userId}`);
  } catch (error) {
    console.error("Error removing party member:", error);
    throw error;
  }
}

export async function updateMemberRole(
  partyId: string,
  userId: string,
  role: string
): Promise<PartyMember> {
  try {
    // In development without API, update mock data

    const response = await api.patch<PartyMember>(
      `/parties/${partyId}/members/${userId}`,
      { role }
    );
    return response;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
}

export async function getPartyStats(partyId: string): Promise<PartyStats> {
  try {
    // In development without API, return mock data

    const response = await api.get<PartyStats>(`/parties/${partyId}/stats`);
    return response;
  } catch (error) {
    console.error("Error fetching party stats:", error);

    throw error;
  }
}

export async function regenerateInviteCode(partyId: string): Promise<string> {
  try {
    // In development without API, update mock data
    const response = await api.post<{ inviteCode: string }>(
      `/parties/${partyId}/regenerate-code`
    );
    return response.inviteCode;
  } catch (error) {
    console.error("Error regenerating invite code:", error);
    throw error;
  }
}

export async function cancelParty(
  partyId: string,
  reason?: string
): Promise<Party> {
  try {
    // In development without API, update mock data

    const response = await api.post<Party>(`/parties/${partyId}/cancel`, {
      reason,
    });
    return response;
  } catch (error) {
    console.error("Error cancelling party:", error);
    throw error;
  }
}

export async function getPartySellers(partyId: string): Promise<PartyMember[]> {
  try {
    // In development without API, return mock data

    const response = await api.get<PartyMember[]>(
      `/sellers/parties/${partyId}/sellers`
    );
    return response;
  } catch (error) {
    console.error("Error fetching party sellers:", error);
    throw error;
  }
}

export async function removePartySeller(
  partyId: string,
  requesterId: string
): Promise<void> {
  try {
    // In development without API, update mock data

    await api.delete(`/sellers/parties/${partyId}/sellers/${requesterId}`);
  } catch (error) {
    console.error("Error removing party seller:", error);
    throw error;
  }
}

export async function getCanceledPool(partyId: string): Promise<any[]> {
  try {
    return await api.get<any[]>(`/tickets/parties/${partyId}/canceled-pool`);
  } catch (error) {
    console.error("Error fetching canceled pool:", error);
    throw error;
  }
}

export async function injectPooledTicket(partyId: string, ticketId: string): Promise<void> {
  try {
    await api.post(`/tickets/parties/${partyId}/canceled-pool/${ticketId}/inject`);
  } catch (error) {
    console.error("Error injecting pooled ticket:", error);
    throw error;
  }
}
