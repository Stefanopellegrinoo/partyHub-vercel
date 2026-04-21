"use client";

import { UserProfileForm } from "@/components/settings/user-profile-form"
import { NotificationsForm } from "@/components/settings/notifications-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Bell, User, Zap } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none text-white">Configuración</h1>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">Account Management // Vault Security</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none h-auto p-0 mb-8 gap-8">
          <TabsTrigger 
            value="profile" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7c3aed] data-[state=active]:bg-transparent data-[state=active]:text-[#7c3aed] bg-transparent text-zinc-600 font-black uppercase tracking-widest text-[10px] py-4 px-0 transition-all"
          >
            <User className="h-3.5 w-3.5 mr-2" />
            IDENTIDAD
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7c3aed] data-[state=active]:bg-transparent data-[state=active]:text-[#7c3aed] bg-transparent text-zinc-600 font-black uppercase tracking-widest text-[10px] py-4 px-0 transition-all"
          >
            <Bell className="h-3.5 w-3.5 mr-2" />
            ALERTAS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <UserProfileForm />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <div className="bg-[#080808] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Notificaciones</h3>
                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Communication Protocol // Active</p>
              </div>
              <Bell className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="p-8">
               <NotificationsForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex items-center gap-4 px-2 opacity-20">
        <div className="h-[1px] flex-1 bg-white/5" />
        <Zap className="h-3 w-3 text-zinc-600" />
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
    </div>
  )
}
