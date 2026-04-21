"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { updateProfile } from "@/services/auth-service"
import { Bell, Mail, Zap, Check } from "lucide-react"

const formSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newParty: z.boolean(),
  ticketSales: z.boolean(),
  reservationExpiration: z.boolean(),
})

export function NotificationsForm() {
  const { user, updateUserContext } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const currentPrefs = (user as any)?.preferences || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailNotifications: currentPrefs.emailNotifications ?? true,
      pushNotifications: currentPrefs.pushNotifications ?? true,
      newParty: currentPrefs.newParty ?? true,
      ticketSales: currentPrefs.ticketSales ?? true,
      reservationExpiration: currentPrefs.reservationExpiration ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await updateProfile({ preferences: values })
      if (user) {
        updateUserContext({
          ...user,
          preferences: values
        })
      }
      toast({ title: "LOG UPDATED", description: "Preferencias guardadas." })
    } catch (error) {
      toast({ title: "ERROR", description: "Falla al guardar.", variant: "destructive" })
    } finally { setIsLoading(false); }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#7c3aed]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Canales</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="emailNotifications" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-none">
                <FormLabel className="text-sm font-black uppercase italic tracking-tighter text-white">E-MAIL</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#7c3aed]" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pushNotifications" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-none">
                <FormLabel className="text-sm font-black uppercase italic tracking-tighter text-white">PUSH</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#7c3aed]" /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto h-16 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase px-12 transition-all active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          {isLoading ? "ACTUALIZANDO..." : "GUARDAR PREFERENCIAS"}
          <Check className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </Form>
  )
}
