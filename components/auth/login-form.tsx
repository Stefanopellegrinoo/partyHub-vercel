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
import { User, Lock, Zap } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  identifier: z.string().min(3, "Ingresa tu email o usuario"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Pasamos identifier en lugar de email
      await login(values.identifier, values.password)
      toast({
        title: "ACCESO CONCEDIDO",
        description: "Bienvenido de nuevo a la bóveda.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      toast({
        title: "ERROR DE ACCESO",
        description: error.response?.data?.error || "Credenciales inválidas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="identifier" render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email o Usuario</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                <Input placeholder="USER.PRO / EMAIL@VAULT.COM" {...field} className="bg-zinc-900 border-none rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest" />
              </div>
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <div className="space-y-2">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</FormLabel>
                <Link href="/forgot-password" size="sm" className="text-[9px] font-bold uppercase tracking-widest text-[#7c3aed] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <Input type="password" placeholder="********" {...field} className="bg-zinc-900 border-none rounded-none h-14 pl-12" />
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
          {isLoading ? "Validando..." : "Ingresar"}
          <Zap className="ml-2 h-4 w-4 fill-white" />
        </Button>
      </form>
    </Form>
  )
}
