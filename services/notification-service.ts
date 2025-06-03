import { api } from "@/lib/axios"
import type { Notification, NotificationFilters } from "@/types/notification"


export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  try {

    const response = await api.get<Notification[]>("/notifications", { params: filters })
    // Ensure we return an array
    return Array.isArray(response) ? response : []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {


    await api.patch(`/notifications/${id}`)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {

    await api.post("/notifications/read-all")
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

export async function deleteNotification(id: string): Promise<void> {
  try {

    await api.delete(`/notifications/${id}`)
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
