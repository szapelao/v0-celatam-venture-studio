import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, MessageSquare, TrendingUp, Globe, Building, Calendar } from "lucide-react"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { ExportButton } from "@/components/export-button"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = await createClient()

  // Get basic counts
  const [
    { count: totalUsers },
    { count: totalOpportunities },
    { count: totalMatches },
    { count: totalFeedback },
    { count: activeOpportunities },
    { count: totalProjects },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("feedback").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ])

  // Get demographics data
  const { data: locationData } = await supabase.from("profiles").select("location").not("location", "is", null)

  const { data: industryData } = await supabase.from("profiles").select("industry").not("industry", "is", null)

  const { data: stageData } = await supabase.from("profiles").select("company_stage").not("company_stage", "is", null)

  // Get opportunity categories breakdown
  const { data: categoryData } = await supabase.from("opportunities").select("category").eq("is_active", true)

  // Get recent activity
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(`
      *,
      requester:profiles!matches_requester_id_fkey(full_name),
      need:needs(title, category)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get satisfaction rates from feedback
  const { data: feedbackRatings } = await supabase
    .from("feedback")
    .select("relevance_rating, outcome_rating")
    .not("relevance_rating", "is", null)

  // Calculate averages
  const avgRelevance = feedbackRatings?.length
    ? (feedbackRatings.reduce((sum, f) => sum + (f.relevance_rating || 0), 0) / feedbackRatings.length).toFixed(1)
    : "N/A"

  const avgOutcome = feedbackRatings?.length
    ? (feedbackRatings.reduce((sum, f) => sum + (f.outcome_rating || 0), 0) / feedbackRatings.length).toFixed(1)
    : "N/A"

  // Process demographics data
  const locationCounts = locationData?.reduce(
    (acc, item) => {
      const location = item.location || "Unknown"
      acc[location] = (acc[location] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const industryCounts = industryData?.reduce(
    (acc, item) => {
      const industry = item.industry || "Unknown"
      acc[industry] = (acc[industry] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const stageCounts = stageData?.reduce(
    (acc, item) => {
      const stage = item.company_stage || "Unknown"
      acc[stage] = (acc[stage] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryCounts = categoryData?.reduce(
    (acc, item) => {
      const category = item.category || "Unknown"
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform metrics and user insights</p>
        </div>
        <ExportButton />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered founders and builders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOpportunities || 0}</div>
            <p className="text-xs text-muted-foreground">{totalOpportunities || 0} total opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches || 0}</div>
            <p className="text-xs text-muted-foreground">Successful connections made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Active projects registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              User Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Relevance Rating</span>
                <Badge variant="secondary">{avgRelevance}/5.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outcome Rating</span>
                <Badge variant="secondary">{avgOutcome}/5.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Feedback</span>
                <Badge variant="outline">{totalFeedback || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches?.slice(0, 3).map((match) => (
                <div key={match.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{match.requester?.full_name}</p>
                    <p className="text-muted-foreground">{match.need?.title}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {match.status}
                  </Badge>
                </div>
              ))}
              {!recentMatches?.length && <p className="text-sm text-muted-foreground">No recent matches</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(locationCounts || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between text-sm">
                    <span>{location}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Industry Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(industryCounts || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([industry, count]) => (
                  <div key={industry} className="flex items-center justify-between text-sm">
                    <span>{industry}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Company Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stageCounts || {})
                .sort(([, a], [, b]) => b - a)
                .map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{stage}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        categoryData={categoryCounts || {}}
        locationData={locationCounts || {}}
        stageData={stageCounts || {}}
      />
    </div>
  )
}
