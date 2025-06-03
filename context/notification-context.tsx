"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Notification, NotificationFilters } from "@/types/notification"
import { useAuth } from "@/hooks/use-auth"
import { useSocketContext } from "@/context/socket-context"
import { useToast } from "@/hooks/use-toast"
import { getNotifications, markNotificationAsRead } from "@/services/notification-service"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  filterNotifications: (filters: NotificationFilters) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected } = useSocketContext()
  const { toast } = useToast()

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setIsLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.isRead).length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // await markAllNotificationsAsRead()

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

      // Reset unread count
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const refreshNotifications = async () => {
    await loadNotifications()
  }

  const filterNotifications = async (filters: NotificationFilters) => {
    if (!isAuthenticated || !user) return

    setIsLoading(true)
    try {
      const data = await getNotifications(filters)
      setNotifications(data)

      // Only update unread count if we're not filtering by read status
      if (filters.isRead === undefined) {
        setUnreadCount(data.filter((n) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Error filtering notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load notifications on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, loadNotifications])

  // Listen for socket events
  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for new notifications
    socket.on("notification", (notification: Notification) => {
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev])

      // Update unread count
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      })
    })

    // Listen for notification updates
    socket.on("notification-update", (updatedNotification: Notification) => {
      setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

      // Update unread count if needed
      if (updatedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    })

    return () => {
      socket.off("notification")
      socket.off("notification-update")
    }
  }, [socket, isConnected, toast])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        filterNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
