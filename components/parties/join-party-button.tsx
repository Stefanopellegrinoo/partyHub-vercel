"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { joinParty } from "@/services/party-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"

const formSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres"),
})

export function JoinPartyButton() {
  const [open, setOpen] = useState(false)
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
      console.log("Party data:", party)
      setOpen(false)
      form.reset()
      router.refresh()
      router.push(`/dashboard/party/${party}`)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Unirse a Fiesta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unirse a una fiesta</DialogTitle>
          <DialogDescription>Ingresa el código de invitación para unirte como vendedor</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de invitación</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Uniéndose..." : "Unirse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
