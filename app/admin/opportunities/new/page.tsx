import { requireAdmin } from "@/lib/auth"
import { OpportunityForm } from "@/components/opportunity-form"

export default async function NewOpportunityPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Opportunity</h1>
        <p className="text-muted-foreground">Add a new opportunity to the database</p>
      </div>

      <OpportunityForm />
    </div>
  )
}
