import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JoinPartyForm } from "@/components/parties/join-party-form"

export default function JoinPartyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unirse a una Fiesta</h1>
        <p className="text-muted-foreground">Únete a una fiesta existente con un código de invitación.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Código de Invitación</CardTitle>
          <CardDescription>Ingresa el código que te proporcionó el organizador de la fiesta.</CardDescription>
        </CardHeader>
        <CardContent>
          <JoinPartyForm />
        </CardContent>
      </Card>
    </div>
  )
}
