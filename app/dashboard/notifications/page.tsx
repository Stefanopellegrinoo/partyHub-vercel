"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/services/notification-service";
import type { Notification } from "@/types/notification";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, CheckCircle2, Zap, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/context/notification-context";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { unreadCount, refreshNotifications } = useNotifications();

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationAsRead(id);
      toast({ title: "LOG UPDATED", description: "Notificación marcada como leída." });
      loadNotifications();
      refreshNotifications();
    } catch (error) { console.error(error); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast({ title: "DELETED", description: "Notificación eliminada permanentemente." });
      refreshNotifications();
    } catch (error) { console.error(error); }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic">Notificaciones</h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            System Alerts // {unreadCount} pending identities
          </p>
        </div>
        <Button onClick={loadNotifications} variant="outline" className="border-white/5 bg-white/5 rounded-none h-12 px-6 font-black text-[10px] uppercase tracking-widest">
           REFRESH LOG <Zap className={`ml-2 h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/30 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Evento</th>
                <th className="px-8 py-4">Mensaje</th>
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10"><div className="h-4 bg-white/5 w-full" /></td>
                  </tr>
                ))
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">NO SYSTEM ALERTS</p>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className={`group transition-colors ${!n.isRead ? 'bg-[#7c3aed]/5' : 'hover:bg-white/[0.01]'}`}>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                         {!n.isRead && <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-ping" />}
                         <span className={n.isRead ? "text-zinc-500 font-bold uppercase text-xs" : "text-white font-black uppercase italic text-xs"}>
                           {n.title}
                         </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-[11px] text-zinc-400 leading-relaxed max-w-md">{n.message}</td>
                    <td className="px-8 py-6 text-[10px] text-zinc-600 whitespace-nowrap">{formatDateTime(n.createdAt)}</td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          {!n.isRead ? (
                            <Button onClick={() => handleMarkAsRead(n.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#7c3aed] hover:bg-[#7c3aed]/10">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button onClick={() => handleDelete(n.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-900 hover:text-red-500 hover:bg-red-500/5">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 px-2 opacity-30">
        <div className="h-[1px] flex-1 bg-white/5" />
        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.5em]">End of Notification Stream</p>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
    </div>
  );
}
