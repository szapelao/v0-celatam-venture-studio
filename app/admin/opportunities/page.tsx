import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, Target } from "lucide-react"
import Link from "next/link"

export default async function OpportunitiesPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      created_by_profile:profiles!opportunities_created_by_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching opportunities:", error)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Funding: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Mentorship: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Talent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Partnerships: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Knowledge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Integrations: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.Other
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage opportunities for the community</p>
        </div>
        <Button asChild>
          <Link href="/admin/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {opportunities?.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(opportunity.category)}>{opportunity.category}</Badge>
                    <Badge variant="outline">{opportunity.type}</Badge>
                    {!opportunity.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {opportunity.source_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/opportunities/${opportunity.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{opportunity.description}</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Requirements</h4>
                  <p className="text-muted-foreground">{opportunity.requirements}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Benefits</h4>
                  <p className="text-muted-foreground">{opportunity.benefits}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
                <span>Created by: {opportunity.created_by_profile?.full_name || "System"}</span>
                {opportunity.deadline && <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}

        {!opportunities?.length && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your opportunities database by creating the first opportunity.
              </p>
              <Button asChild>
                <Link href="/admin/opportunities/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Opportunity
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
