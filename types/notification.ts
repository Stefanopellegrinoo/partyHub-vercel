export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  data?: Record<string, any>
  link?: string
}

export type NotificationType =
  | "party_invite"
  | "ticket_sale"
  | "reservation_expiring"
  | "party_update"
  | "role_change"
  | "system"

export interface NotificationCreate {
  userId: string
  title: string
  message: string
  type: NotificationType
  data?: Record<string, any>
  link?: string
}

export interface NotificationUpdate {
  id: string
  isRead: boolean
}

export interface NotificationFilters {
  isRead?: boolean
  type?: NotificationType
  startDate?: string
  endDate?: string
}
