export interface Party {
  organizer_id: any
  invite_code: ReactNode
  id: string
  name: string
  location: string
  date: string
  role: "organizer" | "seller"
  ticketsSold: number
  inviteCode?: string
  description?: string
  isPrivate?: boolean
  createdAt?: string
  updatedAt?: string
  organizerId?: string
  organizerName?: string
  totalRevenue?: number
  status?: PartyStatus
  coverImage?: string
  members?: PartyMember[]
}

export type PartyStatus = "upcoming" | "active" | "completed" | "cancelled"

export interface PartyMember {
  id: string
  userId: string
  partyId: string
  name: string
  email: string
  role: "organizer" | "seller"
  joinedAt: string
  ticketsSold?: number
  revenue?: number
  avatar?: string
}

export interface PartyCreate {
  name: string
  location: string
  date: string
  description?: string
  isPrivate?: boolean
}

export interface PartyUpdate extends PartyCreate {
  id: string
  inviteCode?: string
}

export interface PartyJoin {
  code: string
}

export interface PartyInvite {
  email: string
  role: "organizer" | "seller"
  message?: string
}

export interface PartyStats {
  totalTickets: number
  ticketsSold: number
  ticketsAvailable: number
  totalRevenue: number
  averageTicketPrice: number
  topSellingBatch?: {
    id: string
    name: string
    ticketsSold: number
  }
  topSeller?: {
    id: string
    name: string
    ticketsSold: number
  }
  salesByDay: {
    date: string
    ticketsSold: number
    revenue: number
  }[]
}

export interface PartyFilters {
  status?: PartyStatus
  role?: "organizer" | "seller" | "all"
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: "date" | "name" | "ticketsSold" | "revenue"
  sortOrder?: "asc" | "desc"
}
