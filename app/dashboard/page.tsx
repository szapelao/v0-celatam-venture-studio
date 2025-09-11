import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, Bell, Users, Target, Bot } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // If profile is incomplete, redirect to onboarding
  if (!profile || !profile.company_name || !profile.company_stage) {
    redirect("/onboarding")
  }

  // Get user's needs and recent matches
  const { data: needs } = await supabase
    .from("needs")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: allNeeds } = await supabase.from("needs").select("id").eq("user_id", data.user.id).eq("is_active", true)

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      opportunities (title, description, category),
      needs (title)
    `)
    .eq("requester_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: allMatches } = await supabase.from("matches").select("id, status").eq("requester_id", data.user.id)

  // Get notifications count
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("is_read", false)

  const acceptedMatches = allMatches?.filter((match) => match.status === "accepted").length || 0
  const unreadNotifications = notifications?.length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl">CeLatam</span>
          </div>
          <div className="flex items-center gap-3">
            {unreadNotifications > 0 && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hello, {profile.full_name || "Founder"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your Web3 journey on Celo</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allNeeds?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Needs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allMatches?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-5/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{acceptedMatches}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with finding what you need in the Celo ecosystem</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <Button asChild className="h-auto p-4 flex-col gap-2">
                  <Link href="/needs/new">
                    <Plus className="h-5 w-5" />
                    <span>Add New Need</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col gap-2 bg-transparent">
                  <Link href="/opportunities">
                    <ArrowRight className="h-5 w-5" />
                    <span>Browse Opportunities</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Project Assistant</CardTitle>
                    <CardDescription>Let our AI learn about your project to find better matches</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our AI to help us understand your project better - your traction, target audience, and
                  specific challenges. This helps us find more relevant opportunities for you.
                </p>
                <Button variant="outline" className="bg-transparent">
                  <Bot className="mr-2 h-4 w-4" />
                  Start AI Chat (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Recent Needs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Active Needs</CardTitle>
                    <CardDescription>What you're currently looking for</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/needs">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {needs && needs.length > 0 ? (
                  <div className="space-y-3">
                    {needs.map((need) => (
                      <div
                        key={need.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{need.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{need.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {need.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs capitalize ${
                                  need.urgency === "critical"
                                    ? "border-destructive text-destructive"
                                    : need.urgency === "high"
                                      ? "border-accent text-accent-foreground"
                                      : need.urgency === "medium"
                                        ? "border-secondary text-secondary"
                                        : "border-muted-foreground text-muted-foreground"
                                }`}
                              >
                                {need.urgency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't added any needs yet</p>
                    <Button asChild>
                      <Link href="/needs/new">Add Your First Need</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{profile.company_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.company_stage} stage</p>
                </div>
                {profile.industry && (
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm">{profile.industry}</p>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm">{profile.location}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Matches</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/matches">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {matches && matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <div key={match.id} className="p-3 border border-border rounded-lg">
                        <p className="text-sm font-medium line-clamp-1">{match.opportunities?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">For: {match.needs?.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              match.status === "pending"
                                ? "border-accent text-accent-foreground"
                                : match.status === "accepted"
                                  ? "border-primary text-primary"
                                  : "border-muted-foreground text-muted-foreground"
                            }`}
                          >
                            {match.status}
                          </Badge>
                          {match.opportunities?.category && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {match.opportunities.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No matches yet</p>
                    <Button size="sm" asChild>
                      <Link href="/opportunities">Find Opportunities</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
