import { PartyList } from "@/components/parties/party-list"
import { CreatePartyButton } from "@/components/parties/create-party-button"
import { JoinPartyButton } from "@/components/parties/join-party-button"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Mis Fiestas</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <CreatePartyButton />
          <JoinPartyButton />
        </div>
      </div>
      <PartyList />
    </div>
  )
}
