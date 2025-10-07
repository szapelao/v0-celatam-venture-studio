import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminOpportunitiesPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })

  const totalOpportunities = opportunities?.length || 0
  const activeOpportunities = opportunities?.filter((o) => o.is_active).length || 0

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-forest-green">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-forest-green">Opportunities</h1>
              <p className="text-off-black/70">Manage all opportunities in the platform</p>
            </div>
          </div>
          <Button asChild className="bg-forest-green hover:bg-forest-green/90">
            <Link href="/admin/opportunities/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mini-green rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">{totalOpportunities}</p>
                  <p className="text-xs text-off-black/70">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-prosperity-yellow/30 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">{activeOpportunities}</p>
                  <p className="text-xs text-off-black/70">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mini-green rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">
                    {opportunities?.filter((o) => o.category === "funding").length || 0}
                  </p>
                  <p className="text-xs text-off-black/70">Funding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-prosperity-yellow/30 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">
                    {opportunities?.filter((o) => o.category === "mentorship").length || 0}
                  </p>
                  <p className="text-xs text-off-black/70">Mentorship</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-forest-green/20">
          <CardHeader>
            <CardTitle className="text-forest-green">All Opportunities</CardTitle>
            <CardDescription>Manage and monitor all opportunities in the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-forest-green">Title</TableHead>
                    <TableHead className="text-forest-green">Category</TableHead>
                    <TableHead className="text-forest-green">Type</TableHead>
                    <TableHead className="text-forest-green">Status</TableHead>
                    <TableHead className="text-forest-green">Created</TableHead>
                    <TableHead className="text-right text-forest-green">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities && opportunities.length > 0 ? (
                    opportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{opportunity.title}</p>
                            <p className="text-sm text-off-black/70 line-clamp-1">{opportunity.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize border-forest-green/30">
                            {opportunity.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {opportunity.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              opportunity.is_active
                                ? "bg-mini-green text-forest-green border-forest-green/20"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {opportunity.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(opportunity.created_at).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="text-forest-green hover:bg-mini-green/30"
                            >
                              <Link href={`/admin/opportunities/${opportunity.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Eye className="h-8 w-8 text-off-black/30" />
                          <p className="text-off-black/70">No opportunities found</p>
                          <Button asChild className="mt-2 bg-forest-green hover:bg-forest-green/90">
                            <Link href="/admin/opportunities/new">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Your First Opportunity
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
