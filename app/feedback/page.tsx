import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { FeedbackForm } from "@/components/feedback-form"

export default async function FeedbackPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's recent matches for feedback
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(`
      *,
      opportunities (title, description, category),
      needs (title)
    `)
    .eq("requester_id", data.user.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get user's previous feedback
  const { data: userFeedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-lg">Feedback Center</h1>
              <p className="text-sm text-muted-foreground">Help us improve your experience</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
          <p className="text-muted-foreground">
            Your feedback helps us improve the platform and create better matches for the Web3 community.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feedback Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Platform Feedback</CardTitle>
                <CardDescription>Tell us about your overall experience with CeLatam</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackForm type="platform" />
              </CardContent>
            </Card>

            {/* Match Feedback */}
            {recentMatches && recentMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate Your Recent Matches</CardTitle>
                  <CardDescription>Help us understand how well our matching algorithm is working</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1">{match.opportunities?.title}</h4>
                            <p className="text-sm text-muted-foreground">For: {match.needs?.title}</p>
                            <Badge variant="outline" className="mt-1 text-xs capitalize">
                              {match.opportunities?.category}
                            </Badge>
                          </div>
                        </div>
                        <FeedbackForm type="match" matchId={match.id} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Feedback Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback</CardTitle>
                <CardDescription>Your contribution to the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userFeedback?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Feedback Submitted</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userFeedback?.filter((f) => f.rating && f.rating >= 4).length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Positive Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {userFeedback && userFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {userFeedback.slice(0, 3).map((feedback) => (
                      <div key={feedback.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {feedback.type}
                          </Badge>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{feedback.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No feedback yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Impact */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Impact
                </CardTitle>
                <CardDescription>How your feedback helps the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>• Improves matching algorithm accuracy</p>
                  <p>• Helps other founders find better opportunities</p>
                  <p>• Guides platform feature development</p>
                  <p>• Builds a stronger Web3 ecosystem</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
