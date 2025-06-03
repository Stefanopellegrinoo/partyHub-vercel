"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/services/notification-service";
import type { Notification } from "@/types/notification";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, CheckCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setIsLoading(true);
    try {
    //   const filters = activeTab === "unread" ? { isRead: false } : undefined;
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationAsRead(id);
      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteNotification(id: string) {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast({
        title: "Éxito",
        description: "Notificación eliminada",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        {/* {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )} */}
      </div>

      <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unread">
            No leídas{" "}
            {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderNotifications(notifications)}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          {renderNotifications(notifications.filter((n) => !n.isRead))}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotifications(notis: Notification[]) {
    console.log(notis)
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (notis.length === 0) {
      return (
        <EmptyState
          icon={<Bell className="h-12 w-12 text-muted-foreground" />}
          title={
            activeTab === "unread"
              ? "No hay notificaciones sin leer"
              : "No hay notificaciones"
          }
          description={
            activeTab === "unread"
              ? "Todas tus notificaciones han sido leídas"
              : "Cuando recibas notificaciones, aparecerán aquí"
          }
        />
      );
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {notis && notis?.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  !notification.isRead ? "bg-muted/50" : "hover:bg-muted/30"
                } transition-colors`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full ${
                    !notification.isRead
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.isRead && (
                      <Badge variant="default" className="px-1 py-0 h-5">
                        Nueva
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      {notification.link && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <Link href={notification.link}>Ver detalles</Link>
                        </Button>
                      )}
                      {notification.isRead ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleMarkAsRead(notification.id)
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Marcar como leida</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
}
