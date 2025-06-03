"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Attendee } from "@/types/ticket"
import { User, Mail, CreditCard, Phone, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendeeFormProps {
  quantity: number
  onComplete: (attendees: Attendee[]) => void
  onCancel: () => void
  initialAttendees?: Attendee[] // ✅ Nueva prop
}


export function AttendeeForm({ quantity,initialAttendees, onComplete, onCancel }: AttendeeFormProps) {
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
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleChange = (field: keyof Attendee, value: string | boolean) => {
    const newAttendees = [...attendees]
    newAttendees[currentIndex] = {
      ...newAttendees[currentIndex],
      [field]: value,
    }
    setAttendees(newAttendees)

    // Clear error for this field if it exists
    if (errors[`${currentIndex}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`${currentIndex}-${field}`]
      setErrors(newErrors)
    }
  }

  const validateCurrentAttendee = (): boolean => {
    const attendee = attendees[currentIndex]
    const newErrors: Record<string, string[]> = { ...errors }
    let isValid = true

    if (!attendee.fullName.trim()) {
      newErrors[`${currentIndex}-fullName`] = ["El nombre completo es obligatorio"]
      isValid = false
    }

    if (!attendee.documentId.trim()) {
      newErrors[`${currentIndex}-documentId`] = ["El documento es obligatorio"]
      isValid = false
    }

    if (!attendee.email.trim()) {
      newErrors[`${currentIndex}-email`] = ["El email es obligatorio"]
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) {
      newErrors[`${currentIndex}-email`] = ["El email no es válido"]
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentAttendee()) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex(currentIndex - 1)
  }

  const handleSubmit = () => {
    if (validateCurrentAttendee()) {
      onComplete(attendees)
    }
  }

  const isLastAttendee = currentIndex === quantity - 1
  const currentAttendee = attendees[currentIndex]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Datos de los asistentes</CardTitle>
        <CardDescription>
          Por favor, ingresa los datos de cada asistente ({currentIndex + 1} de {quantity})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {Array(quantity)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    index === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : index < currentIndex
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </div>
              ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Asistente {currentIndex + 1} de {quantity}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre completo
            </Label>
            <Input
              id="fullName"
              placeholder="Nombre y apellido"
              value={currentAttendee.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={errors[`${currentIndex}-fullName`] ? "border-destructive" : ""}
            />
            {errors[`${currentIndex}-fullName`] && (
              <p className="text-sm text-destructive">{errors[`${currentIndex}-fullName`][0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentId" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Documento de identidad
            </Label>
            <Input
              id="documentId"
              placeholder="DNI, Pasaporte, etc."
              value={currentAttendee.documentId}
              onChange={(e) => handleChange("documentId", e.target.value)}
              className={errors[`${currentIndex}-documentId`] ? "border-destructive" : ""}
            />
            {errors[`${currentIndex}-documentId`] && (
              <p className="text-sm text-destructive">{errors[`${currentIndex}-documentId`][0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@ejemplo.com"
              value={currentAttendee.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors[`${currentIndex}-email`] ? "border-destructive" : ""}
            />
            {errors[`${currentIndex}-email`] && (
              <p className="text-sm text-destructive">{errors[`${currentIndex}-email`][0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono (opcional)
            </Label>
            <Input
              id="phone"
              placeholder="+54 123 456 7890"
              value={currentAttendee.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
     <div className="space-y-2">
  <Label htmlFor="paid" className="flex items-center gap-2">
    <Check className="h-4 w-4" />
    ¿Pagó la entrada?
  </Label>
  <div className="flex items-center gap-2">
    <input
      id="paid"
      type="checkbox"
      checked={currentAttendee.paid}
      onChange={(e) => handleChange("paid", e.target.checked)}
      className="h-4 w-4"
    />
    <span className="text-sm">Marcar si este asistente ya pagó</span>
  </div>
</div>

        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        <div className="flex space-x-2">
          {currentIndex > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          )}
          {!isLastAttendee ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Completar</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
