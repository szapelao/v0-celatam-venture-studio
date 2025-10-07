import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Target, Building2, TrendingUp, Eye, Settings } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminDashboardPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get admin statistics
  const { data: users } = await supabase.from("profiles").select("id, company_stage")
  const { data: opportunities } = await supabase.from("opportunities").select("id, category, is_active")
  const { data: needs } = await supabase.from("needs").select("id, category, is_active")
  const { data: matches } = await supabase.from("matches").select("id, status")

  const totalUsers = users?.length || 0
  const totalOpportunities = opportunities?.length || 0
  const activeOpportunities = opportunities?.filter((o) => o.is_active).length || 0
  const totalNeeds = needs?.length || 0
  const activeNeeds = needs?.filter((n) => n.is_active).length || 0
  const totalMatches = matches?.length || 0
  const acceptedMatches = matches?.filter((m) => m.status === "accepted").length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform management and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the CeLatam Venture Studio platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeOpportunities}</p>
                  <p className="text-xs text-muted-foreground">Active Opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeNeeds}</p>
                  <p className="text-xs text-muted-foreground">Active Needs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{acceptedMatches}</p>
                  <p className="text-xs text-muted-foreground">Successful Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities Management</CardTitle>
              <CardDescription>Manage all opportunities in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Opportunities</span>
                  <Badge variant="outline">{totalOpportunities}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">{activeOpportunities}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inactive</span>
                  <Badge variant="secondary">{totalOpportunities - activeOpportunities}</Badge>
                </div>
                <Button asChild className="w-full">
                  <Link href="/admin/opportunities">
                    <Eye className="mr-2 h-4 w-4" />
                    Manage Opportunities
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">View and manage user profiles and activity</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Users</span>
                    <Badge variant="outline">{totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Needs</span>
                    <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">{activeNeeds}</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-auto p-4 flex-col gap-2">
                <Link href="/admin/opportunities/new">
                  <Eye className="h-5 w-5" />
                  <span>Add Opportunity</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/admin/analytics">
                  <TrendingUp className="h-5 w-5" />
                  <span>View Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/admin/settings">
                  <Settings className="h-5 w-5" />
                  <span>Platform Settings</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/admin/reports">
                  <Building2 className="h-5 w-5" />
                  <span>Generate Reports</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
