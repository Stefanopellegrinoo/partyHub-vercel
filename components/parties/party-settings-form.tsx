"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getPartyDetails, updateParty } from "@/services/party-service"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres"),
  date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date > new Date()
  }, "La fecha debe ser posterior a hoy"),
})

export function PartySettingsForm({ partyId }: { partyId: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      date: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function loadPartyDetails() {
      try {
        const party = await getPartyDetails(partyId)
        form.reset({
          name: party.name,
          location: party.location,
          date: new Date(party.date).toISOString().split("T")[0],
        })
      } catch (error) {
        console.error("Error al cargar los detalles de la fiesta:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles de la fiesta",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPartyDetails()
  }, [partyId, form, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    try {
      await updateParty(partyId, values)
      toast({
        title: "Fiesta actualizada",
        description: "Los detalles de la fiesta han sido actualizados correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar la fiesta:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la fiesta. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Fiesta de Verano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Calle Principal 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  )
}
