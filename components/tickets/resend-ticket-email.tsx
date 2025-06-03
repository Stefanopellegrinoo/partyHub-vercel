"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"
import { resendTicketEmail } from "@/services/email-service"

interface ResendTicketEmailProps {
  ticketId: string
  partyId: string
  email?: string
}

export function ResendTicketEmail({ ticketId, partyId, email }: ResendTicketEmailProps) {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No hay una dirección de correo electrónico asociada a esta entrada.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const success = await resendTicketEmail(ticketId, partyId)

      if (success) {
        toast({
          title: "Correo enviado",
          description: `Se ha reenviado la entrada a ${email}`,
        })
      } else {
        throw new Error("No se pudo enviar el correo")
      }
    } catch (error) {
      console.error("Error resending ticket email:", error)
      toast({
        title: "Error",
        description: "No se pudo reenviar el correo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={isSending || !email}
      className="flex items-center gap-1"
    >
      <Mail className="h-4 w-4" />
      {isSending ? "Enviando..." : "Reenviar entrada"}
    </Button>
  )
}
