"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

const formSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Por favor selecciona un tema",
  }),
})

export function AppearanceForm() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
    },
    mode: "onChange",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Actualizar el tema
      setTheme(values.theme)

      // Simulamos una actualización
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Apariencia actualizada",
        description: "Tus preferencias de apariencia han sido actualizadas",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar tus preferencias. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Tema</FormLabel>
              <FormDescription>Selecciona el tema para la aplicación.</FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                      <Sun className="h-6 w-6 mb-3" />
                      <span className="text-sm font-medium">Claro</span>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                      <Moon className="h-6 w-6 mb-3" />
                      <span className="text-sm font-medium">Oscuro</span>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="system" className="sr-only" />
                    </FormControl>
                    <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                      <Monitor className="h-6 w-6 mb-3" />
                      <span className="text-sm font-medium">Sistema</span>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </form>
    </Form>
  )
}
