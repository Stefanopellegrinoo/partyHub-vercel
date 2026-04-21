"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Attendee } from "@/types/ticket"
import { ChevronRight, ChevronLeft, Check, User, Mail, CreditCard, Phone, Zap, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendeeFormProps {
  quantity: number
  onComplete: (attendees: Attendee[]) => void
  onCancel: () => void
  initialAttendees?: Attendee[]
}

export function AttendeeForm({ quantity, initialAttendees, onComplete, onCancel }: AttendeeFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(
    initialAttendees && initialAttendees.length === quantity
      ? initialAttendees.map((a) => ({ ...a, paid: a.paid ?? false }))
      : Array(quantity).fill(null).map(() => ({
          fullName: "",
          documentId: "",
          email: "",
          phone: "",
          paid: false,
        }))
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleChange = (field: keyof Attendee, value: string | boolean, index = currentIndex) => {
    const newAttendees = [...attendees]
    newAttendees[index] = { ...newAttendees[index], [field]: value }
    setAttendees(newAttendees)
  }

  const validateAttendee = (index: number): boolean => {
    const attendee = attendees[index]
    const newErrors: Record<string, string[]> = { ...errors }
    let isValid = true
    if (!attendee.fullName.trim()) { newErrors[`${index}-fullName`] = ["Requerido"]; isValid = false; }
    if (!attendee.documentId.trim()) { newErrors[`${index}-documentId`] = ["Requerido"]; isValid = false; }
    if (!attendee.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) { newErrors[`${index}-email`] = ["Email inválido"]; isValid = false; }
    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => { if (validateAttendee(currentIndex)) setCurrentIndex(currentIndex + 1); }
  const handlePrevious = () => setCurrentIndex(currentIndex - 1);
  const handleGoToReview = () => { if (validateAttendee(currentIndex)) setIsReviewing(true); }
  const handleSubmit = () => {
    const allValid = attendees.every((_, i) => validateAttendee(i));
    if (allValid) onComplete(attendees);
  }

  const isLastAttendee = currentIndex === quantity - 1
  const currentAttendee = attendees[currentIndex]
  const progress = ((currentIndex + 1) / quantity) * 100

  if (isReviewing) {
    return (
      <div className="w-full bg-[#080808] border border-white/5 relative overflow-hidden flex flex-col animate-in fade-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]" />
        <div className="p-8 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">REVISIÓN FINAL</h3>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Verificá los datos antes de vender</p>
          </div>
          <Edit3 className="h-5 w-5 text-[#7c3aed]" />
        </div>
        
        <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto">
          {attendees.map((att, i) => (
            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 space-y-4">
              <p className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest">ASISTENTE {i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={att.fullName} onChange={(e) => handleChange("fullName", e.target.value, i)} className="bg-zinc-900 border-none rounded-none font-mono uppercase text-xs h-10" placeholder="NOMBRE" />
                <Input value={att.documentId} onChange={(e) => handleChange("documentId", e.target.value, i)} className="bg-zinc-900 border-none rounded-none font-mono uppercase text-xs h-10" placeholder="DOCUMENTO" />
                <Input value={att.email} onChange={(e) => handleChange("email", e.target.value, i)} className="bg-zinc-900 border-none rounded-none font-mono uppercase text-xs h-10 md:col-span-2" placeholder="EMAIL" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-zinc-950/50 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="ghost" onClick={() => setIsReviewing(false)} className="text-zinc-600 hover:text-white font-black uppercase tracking-[0.2em] text-[10px]">
            VOLVER A LA CARGA
          </Button>
          <Button onClick={handleSubmit} className="h-16 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-none font-black uppercase px-12 text-xl shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            CONFIRMAR VENTA <Check className="ml-2 h-6 w-6 stroke-[3]" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#080808] border border-white/5 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 h-1 bg-[#7c3aed] transition-all duration-300" style={{ width: `${progress}%` }} />
      
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">REGISTRO</h3>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Identidad {currentIndex + 1} de {quantity}</p>
        </div>
        <Zap className="h-5 w-5 text-[#7c3aed] animate-pulse" />
      </div>

      <div className="p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
              <Input 
                placeholder="NOMBRE ASISTENTE" 
                value={currentAttendee.fullName} 
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={cn("bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest", errors[`${currentIndex}-fullName`] && "border-red-900/50")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Documento / DNI</Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
              <Input 
                placeholder="NÚMERO DE DOCUMENTO" 
                value={currentAttendee.documentId} 
                onChange={(e) => handleChange("documentId", e.target.value)}
                className={cn("bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest", errors[`${currentIndex}-documentId`] && "border-red-900/50")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Correo de Envío</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
              <Input 
                placeholder="EMAIL@EJEMPLO.COM" 
                value={currentAttendee.email} 
                onChange={(e) => handleChange("email", e.target.value)}
                className={cn("bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest", errors[`${currentIndex}-email`] && "border-red-900/50")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Celular (Opcional)</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
              <Input 
                placeholder="+54 ..." 
                value={currentAttendee.phone} 
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-transparent border-white/5 focus:border-[#7c3aed] rounded-none h-14 pl-12 font-mono uppercase text-sm tracking-widest"
              />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleChange("paid", !currentAttendee.paid)}
          className={cn(
            "p-6 border-2 transition-all cursor-pointer flex items-center justify-between group",
            currentAttendee.paid ? "bg-[#7c3aed]/10 border-[#7c3aed]" : "bg-white/5 border-transparent hover:border-white/10"
          )}
        >
          <div className="space-y-1">
            <p className="font-black uppercase tracking-tighter italic text-xl">¿YA TE PAGÓ?</p>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Confirmar recepción de dinero</p>
          </div>
          <div className={cn("w-8 h-8 rounded-none border-2 flex items-center justify-center transition-all", currentAttendee.paid ? "bg-[#7c3aed] border-[#7c3aed]" : "border-zinc-800")}>
            {currentAttendee.paid && <Check className="h-5 w-5 text-black stroke-[4]" />}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-zinc-950/50 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-zinc-600 hover:text-white font-black uppercase tracking-[0.2em] text-[10px]">
          CANCELAR
        </Button>
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <Button onClick={handlePrevious} className="bg-zinc-900 text-zinc-400 hover:text-white rounded-none font-black uppercase h-14 px-8 tracking-tighter">
              <ChevronLeft className="mr-2 h-5 w-5" /> ATRÁS
            </Button>
          )}
          {!isLastAttendee ? (
            <Button onClick={handleNext} className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] rounded-none font-black uppercase h-14 px-12 tracking-tighter">
              SIGUIENTE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={handleGoToReview} className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] rounded-none font-black uppercase h-14 px-12 tracking-tighter shadow-[0_0_20px_rgba(124,58,237,0.2)]">
              REVISAR DATOS <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
