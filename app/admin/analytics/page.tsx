import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Users, Target, Building2, Calendar } from "lucide-react"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get comprehensive analytics data
  const { data: users } = await supabase
    .from("profiles")
    .select("id, company_stage, industry, created_at")
    .order("created_at", { ascending: false })

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, category, type, is_active, created_at")
    .order("created_at", { ascending: false })

  const { data: needs } = await supabase
    .from("needs")
    .select("id, category, urgency, is_active, created_at")
    .order("created_at", { ascending: false })

  const { data: matches } = await supabase
    .from("matches")
    .select("id, status, created_at")
    .order("created_at", { ascending: false })

  // Calculate analytics
  const totalUsers = users?.length || 0
  const totalOpportunities = opportunities?.length || 0
  const totalNeeds = needs?.length || 0
  const totalMatches = matches?.length || 0

  // User growth over time (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const userGrowth =
    users?.reduce(
      (acc, user) => {
        const month = new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Category distribution
  const opportunityCategories =
    opportunities?.reduce(
      (acc, opp) => {
        acc[opp.category] = (acc[opp.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const needsCategories =
    needs?.reduce(
      (acc, need) => {
        acc[need.category] = (acc[need.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Match success rate
  const acceptedMatches = matches?.filter((m) => m.status === "accepted").length || 0
  const successRate = totalMatches > 0 ? Math.round((acceptedMatches / totalMatches) * 100) : 0

  // Company stage distribution
  const stageDistribution =
    users?.reduce(
      (acc, user) => {
        if (user.company_stage) {
          acc[user.company_stage] = (acc[user.company_stage] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentUsers = users?.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length || 0
  const recentOpportunities = opportunities?.filter((o) => new Date(o.created_at) > thirtyDaysAgo).length || 0
  const recentMatches = matches?.filter((m) => new Date(m.created_at) > thirtyDaysAgo).length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-lg">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last 30 days
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Key Metrics */}
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
                  <p className="text-xs text-chart-2">+{recentUsers} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOpportunities}</p>
                  <p className="text-xs text-muted-foreground">Opportunities</p>
                  <p className="text-xs text-chart-2">+{recentOpportunities} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMatches}</p>
                  <p className="text-xs text-muted-foreground">Total Matches</p>
                  <p className="text-xs text-chart-2">+{recentMatches} this month</p>
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
                  <p className="text-2xl font-bold">{successRate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-xs text-muted-foreground">{acceptedMatches} accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts
                type="line"
                data={Object.entries(userGrowth).map(([month, count]) => ({
                  name: month,
                  value: count,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Stages</CardTitle>
              <CardDescription>Distribution of user company stages</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts
                type="pie"
                data={Object.entries(stageDistribution).map(([stage, count]) => ({
                  name: stage.replace("_", " ").toUpperCase(),
                  value: count,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Categories</CardTitle>
              <CardDescription>Most popular opportunity types</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts
                type="bar"
                data={Object.entries(opportunityCategories).map(([category, count]) => ({
                  name: category.charAt(0).toUpperCase() + category.slice(1),
                  value: count,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Categories</CardTitle>
              <CardDescription>What founders are looking for most</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts
                type="bar"
                data={Object.entries(needsCategories).map(([category, count]) => ({
                  name: category.charAt(0).toUpperCase() + category.slice(1),
                  value: count,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                  {Math.round((recentUsers / totalUsers) * 100)}% growth
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Match Success Rate</span>
                <Badge
                  className={
                    successRate > 50
                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      : "bg-chart-5/10 text-chart-5 border-chart-5/20"
                  }
                >
                  {successRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Opportunities</span>
                <Badge variant="outline">{opportunities?.filter((o) => o.is_active).length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Industries</CardTitle>
              <CardDescription>Most represented sectors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  users?.reduce(
                    (acc, user) => {
                      if (user.industry) {
                        acc[user.industry] = (acc[user.industry] || 0) + 1
                      }
                      return acc
                    },
                    {} as Record<string, number>,
                  ) || {},
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([industry, count]) => (
                    <div key={industry} className="flex justify-between items-center">
                      <span className="text-sm">{industry}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Status</CardTitle>
              <CardDescription>Current match pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  matches?.reduce(
                    (acc, match) => {
                      acc[match.status] = (acc[match.status] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>,
                  ) || {},
                ).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status}</span>
                    <Badge
                      variant={status === "accepted" ? "default" : "outline"}
                      className={status === "accepted" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : ""}
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
