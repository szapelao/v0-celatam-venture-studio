import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpportunityCards } from "@/components/opportunity-cards"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's profile and needs
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: userNeeds } = await supabase
    .from("needs")
    .select("category")
    .eq("user_id", data.user.id)
    .eq("is_active", true)

  // Get opportunities that match user's needs
  const needCategories = userNeeds?.map((need) => need.category) || []

  let opportunitiesQuery = supabase
    .from("opportunities")
    .select(`
      *,
      profiles!opportunities_provider_id_fkey (
        full_name,
        company_name,
        avatar_url
      )
    `)
    .eq("is_active", true)
    .neq("provider_id", data.user.id) // Don't show user's own opportunities

  // Filter by matching categories if user has needs
  if (needCategories.length > 0) {
    opportunitiesQuery = opportunitiesQuery.in("category", needCategories)
  }

  const { data: opportunities } = await opportunitiesQuery.order("created_at", { ascending: false }).limit(20)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-lg">Opportunities</h1>
              <p className="text-sm text-muted-foreground">Find what you need</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {opportunities && opportunities.length > 0 ? (
          <OpportunityCards opportunities={opportunities} userNeeds={needCategories} />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-6">
              {needCategories.length > 0
                ? "No opportunities match your current needs. Try adding more needs or check back later."
                : "Add some needs to your profile to see relevant opportunities."}
            </p>
            <div className="space-y-3">
              <Button asChild>
                <Link href="/needs/new">Add Your Needs</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
