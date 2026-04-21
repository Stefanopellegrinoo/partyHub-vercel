"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { updateProfile } from "@/services/auth-service"
import { User, Mail, Zap, Check, ShieldCheck } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-zA-Z0-9._]+$/, "Solo letras, números, puntos o guiones bajos"),
  email: z.string().email("Correo electrónico inválido"),
})

export function UserProfileForm() {
  const { user, updateUserContext } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true)
    try {
      await updateProfile(values)
      
      if (user) {
        updateUserContext({
          ...user,
          name: values.name,
          username: values.username,
          email: values.email
        })
      }

      toast({ title: "PROFILE UPDATED", description: "Identidad sincronizada." })
    } catch (error: any) {
      console.error(error)
      toast({ 
        title: "ERROR", 
        description: error.response?.data?.error || "Falla al guardar.", 
        variant: "destructive" 
      })
    } finally { setIsLoading(false); }
  }

  return (
    <div className="bg-[#080808] border border-white/5 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-white">Identidad</h3>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Management Console // Node {user?.id}</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-[#7c3aed]" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nombre Real</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                      <Input {...field} className="bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Username Único</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7c3aed]" />
                      <Input {...field} className="bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm text-[#7c3aed]" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Email System</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                    <Input {...field} disabled className="bg-transparent border-white/5 rounded-none h-14 pl-12 font-mono uppercase text-sm text-zinc-500" />
                  </div>
                </FormControl>
              </FormItem>
            )} />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto h-16 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase px-16 transition-all active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            {isLoading ? "ACTUALIZANDO..." : "GUARDAR CAMBIOS"}
            <Check className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </Form>
    </div>
  )
}
