import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, TrendingUp, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminDashboardPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: opportunities } = await supabase.from("opportunities").select("id, category, is_active")
  const { data: subscriptions } = await supabase.from("email_subscriptions").select("id, is_active")
  const { data: matches } = await supabase.from("matches").select("id, status")

  const totalOpportunities = opportunities?.length || 0
  const activeOpportunities = opportunities?.filter((o) => o.is_active).length || 0
  const totalSubscriptions = subscriptions?.length || 0
  const activeSubscriptions = subscriptions?.filter((s) => s.is_active).length || 0
  const totalMatches = matches?.length || 0

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-forest-green mb-2">Admin Dashboard</h1>
          <p className="text-off-black/70">Manage CeloBuddy opportunities and platform settings</p>
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
                  <p className="text-xs text-off-black/70">Total Opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-prosperity-yellow/30 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-forest-green" />
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
                  <Users className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">{activeSubscriptions}</p>
                  <p className="text-xs text-off-black/70">Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-prosperity-yellow/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-forest-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-forest-green">{totalMatches}</p>
                  <p className="text-xs text-off-black/70">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-forest-green/20">
            <CardHeader>
              <CardTitle className="text-forest-green">Opportunities Management</CardTitle>
              <CardDescription>Manage all opportunities in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Opportunities</span>
                  <Badge variant="outline" className="border-forest-green/30">
                    {totalOpportunities}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <Badge className="bg-mini-green text-forest-green border-forest-green/20">
                    {activeOpportunities}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inactive</span>
                  <Badge variant="secondary">{totalOpportunities - activeOpportunities}</Badge>
                </div>
                <Button asChild className="w-full bg-forest-green hover:bg-forest-green/90">
                  <Link href="/admin/opportunities">
                    <Eye className="mr-2 h-4 w-4" />
                    Manage Opportunities
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-green/20">
            <CardHeader>
              <CardTitle className="text-forest-green">Email Subscribers</CardTitle>
              <CardDescription>View and manage email subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Subscribers</span>
                  <Badge variant="outline" className="border-forest-green/30">
                    {totalSubscriptions}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <Badge className="bg-mini-green text-forest-green border-forest-green/20">
                    {activeSubscriptions}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unsubscribed</span>
                  <Badge variant="secondary">{totalSubscriptions - activeSubscriptions}</Badge>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-forest-green/30 hover:bg-mini-green/30 bg-transparent"
                >
                  <Link href="/admin/subscribers">
                    <Users className="mr-2 h-4 w-4" />
                    View Subscribers
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-forest-green/20">
          <CardHeader>
            <CardTitle className="text-forest-green">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild className="h-auto p-4 flex-col gap-2 bg-forest-green hover:bg-forest-green/90">
                <Link href="/admin/opportunities/new">
                  <Plus className="h-5 w-5" />
                  <span>Add Opportunity</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col gap-2 border-forest-green/30 hover:bg-mini-green/30 bg-transparent"
              >
                <Link href="/admin/opportunities">
                  <Eye className="h-5 w-5" />
                  <span>View All Opportunities</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col gap-2 border-forest-green/30 hover:bg-mini-green/30 bg-transparent"
              >
                <Link href="/admin/subscribers">
                  <Users className="h-5 w-5" />
                  <span>Manage Subscribers</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
