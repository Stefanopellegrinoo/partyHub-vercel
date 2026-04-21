"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Lock, Zap, ShieldCheck } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9._]+$/, "Solo letras, números, puntos o guiones bajos"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await register(values.name, values.username, values.email, values.password)
      toast({
        title: "CUENTA CREADA",
        description: "Bienvenido a la bóveda. Identidad validada.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      toast({
        title: "ERROR",
        description: error.response?.data?.error || "No se pudo crear la cuenta.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nombre Real</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <Input placeholder="JOHN DOE" {...field} className="bg-zinc-900 border-none rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest" />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Username Único</FormLabel>
              <FormControl>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7c3aed]" />
                  <Input placeholder="USER.PRO" {...field} className="bg-zinc-900 border-none rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest text-[#7c3aed]" />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email System</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                <Input placeholder="USER@VAULT.COM" {...field} className="bg-zinc-900 border-none rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest" />
              </div>
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <Input type="password" placeholder="********" {...field} className="bg-zinc-900 border-none rounded-none h-12 pl-12" />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Confirm</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <Input type="password" placeholder="********" {...field} className="bg-zinc-900 border-none rounded-none h-12 pl-12" />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
          disabled={isLoading}
        >
          {isLoading ? "Validando..." : "Crear Identidad"}
          <Zap className="ml-2 h-4 w-4 fill-white" />
        </Button>
      </form>
    </Form>
  )
}
