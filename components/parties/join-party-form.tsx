"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { joinParty } from "@/services/party-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres"),
})

export function JoinPartyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const party = await joinParty(values.code)
      toast({
        title: "Te has unido a la fiesta",
        description: "Has sido agregado como vendedor",
      })
      // router.refresh()
      // router.push(`/dashboard/party/${party.id}`)
    } catch (error) {
      console.error("Error al unirse a la fiesta:", error)
      toast({
        title: "Error",
        description: "Código inválido o expirado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de invitación</FormLabel>
              <FormControl>
                <Input placeholder="Ej: ABC123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Uniéndose..." : "Unirse a la fiesta"}
        </Button>
      </form>
    </Form>
  )
}
