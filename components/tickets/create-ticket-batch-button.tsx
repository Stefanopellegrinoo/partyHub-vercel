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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createTicketBatch } from "@/services/ticket-service"
import { useToast } from "@/hooks/use-toast"
import type { TicketBatch } from "@/types/ticket"
import { Plus, Zap } from "lucide-react"

const formSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    category: z.string().min(1, "Selecciona una categoría"),
    quantity: z.coerce.number().int().positive("La cantidad debe ser un número positivo"),
    price: z.coerce.number().positive("El precio debe ser un número positivo"),
    startDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), "Fecha inválida"),
    endDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), "Fecha inválida"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "La fecha de fin debe ser posterior",
    path: ["endDate"],
  })

export function CreateTicketBatchButton({ partyId, onBatchCreated }: { partyId: string, onBatchCreated: (batch: TicketBatch) => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", category: "general", quantity: 0, price: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    },
    mode: "onChange",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const batch = await createTicketBatch(partyId, values)
      toast({ title: "Tanda creada", description: "Configuración exitosa." })
      onBatchCreated(batch)
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear.", variant: "destructive" })
    } finally { setIsLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all active:scale-95">
          <Plus className="h-4 w-4 mr-2" />
          NUEVA TANDA
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#080808] border-white/5 rounded-none p-0 overflow-hidden max-w-[500px]">
        <div className="bg-zinc-950 p-8 border-b border-white/5 flex items-center justify-between">
           <div className="space-y-1">
             <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">Nueva Tanda</DialogTitle>
             <DialogDescription className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">Protocol: Stock Configuration</DialogDescription>
           </div>
           <Zap className="h-5 w-5 text-[#7c3aed]" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nombre</FormLabel>
                  <FormControl><Input placeholder="GENERAL VIP" {...field} className="bg-zinc-900 border-none rounded-none h-12 font-mono uppercase text-xs tracking-widest" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-zinc-900 border-none rounded-none h-12 font-mono uppercase text-[10px] tracking-widest"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-[#080808] border-white/5 rounded-none"><SelectItem value="general">GENERAL</SelectItem><SelectItem value="vip">VIP</SelectItem><SelectItem value="mujer">MUJER</SelectItem><SelectItem value="hombre">HOMBRE</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cantidad</FormLabel>
                  <FormControl><Input type="number" {...field} className="bg-zinc-900 border-none rounded-none h-12 font-mono" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Precio ($)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} className="bg-zinc-900 border-none rounded-none h-12 font-mono" /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inicio</FormLabel>
                  <FormControl><Input type="date" {...field} className="bg-zinc-900 border-none rounded-none h-12 font-mono text-[10px]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fin</FormLabel>
                  <FormControl><Input type="date" {...field} className="bg-zinc-900 border-none rounded-none h-12 font-mono text-[10px]" /></FormControl>
                </FormItem>
              )} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase tracking-widest">
                {isLoading ? "PROCESANDO..." : "CONFIRMAR TANDA"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
