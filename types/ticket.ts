export interface TicketBatch {
  start_time: string | number | Date
  end_time: string | number | Date
  quantity(quantity: any): unknown
  hasReservation: any
  tanda_id: string
  expires_at: string | number | Date
  sold_tickets: number
  reserved_tickets: any
  capacity: any
  event_name: ReactNode
  is_active: boolean
  gender: ReactNode
  id: string
  name: string
  category: string
  price: number
  totalTickets: number
  availableTickets: number
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
  color?: string
  partyId?: string
  createdAt?: string
  updatedAt?: string
  salesCount?: number
  revenue?: number
}

export interface Attendee {
  paid: boolean
  fullName: string
  documentId: string
  email: string
  phone?: string
}

export interface Ticket {
  validated_at: any
  tanda_name: any
  tanda_id: any
  validated: null
  created_at: any
  tandas: any
  email: any
  paid: any
  document_id: ReactNode
  full_name: string
  id: string
  batchId: string
  partyId?: string
  sellerId: string
  sellerName?: string
  price: number
  purchaseDate: string
  status: TicketStatus
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  qrCode?: string
  notes?: string
  checkInDate?: string
  batchName?: string
  attendee?: Attendee
}

export type TicketStatus = "reserved" | "sold" | "cancelled" | "checked-in"

export interface TicketReservation {
  id: string
  batchId: string
  partyId: string
  sellerId: string
  quantity: number
  expiresAt: string
  createdAt: string
}

export interface TicketSale {
  reservationId: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

export interface TicketBatchCreate {
  name: string
  category: string
  quantity: number
  price: number
  startDate: string
  endDate: string
  description?: string
  color?: string
  isActive?: boolean
}

export interface TicketBatchUpdate extends TicketBatchCreate {
  id: string
}

export interface TicketBatchToggle {
  id: string
  isActive: boolean
}

export interface TicketCheckIn {
  ticketId: string
  partyId: string
  checkInDate?: string
  notes?: string
  staffId?: string
}

export interface TicketStats {
  totalSold: number
  totalRevenue: number
  salesByCategory: {
    category: string
    count: number
    revenue: number
  }[]
  salesByBatch: {
    batchId: string
    batchName: string
    count: number
    revenue: number
  }[]
  salesBySeller: {
    sellerId: string
    sellerName: string
    count: number
    revenue: number
  }[]
  salesByDate: {
    date: string
    count: number
    revenue: number
  }[]
}

export interface TicketFilters {
  status?: TicketStatus
  batchId?: string
  sellerId?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: "purchaseDate" | "price" | "status"
  sortOrder?: "asc" | "desc"
}
