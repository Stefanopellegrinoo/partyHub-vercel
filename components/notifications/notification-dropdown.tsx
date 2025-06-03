"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/context/notification-context"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"

export function NotificationDropdown() {
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  // Mark notifications as read when dropdown is closed
  useEffect(() => {
    if (!open && unreadCount > 0) {
      // Small delay to ensure the user has seen the notifications
      const timer = setTimeout(() => {
        markAllAsRead()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [open, unreadCount, markAllAsRead])

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id)
    setOpen(false)

    if (link) {
      // Handle navigation if needed
    }
  }

  // Ensure notifications is an array
  const notificationsArray = Array.isArray(notifications) ? notifications : []

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="h-8 text-xs">
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationsArray.length === 0 ? (
          <div className="py-4 px-2 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
        ) : (
          <ScrollArea className="h-80">
            {notificationsArray.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.isRead ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  {!notification.isRead && (
                    <Badge variant="default" className="ml-2 px-1 py-0 h-5">
                      Nueva
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <span className="text-xs text-muted-foreground mt-1">{formatDateTime(notification.createdAt)}</span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="w-full cursor-pointer justify-center">
            Ver todas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
