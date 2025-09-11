import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Edit, ExternalLink, Github, Globe, Linkedin } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Get user's needs
  const { data: needs } = await supabase
    .from("needs")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                    <p className="text-lg text-muted-foreground">{profile.company_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {profile.company_stage} stage
                      </Badge>
                      {profile.industry && <Badge variant="outline">{profile.industry}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {profile.bio && (
                <CardContent>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </CardContent>
              )}
            </Card>

            {/* Links */}
            {(profile.website_url || profile.linkedin_url || profile.github_url || profile.karmagap_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.website_url && (
                      <Button variant="outline" asChild className="justify-start bg-transparent">
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          Website
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.github_url && (
                      <Button variant="outline" asChild className="justify-start bg-transparent">
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          GitHub
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.linkedin_url && (
                      <Button variant="outline" asChild className="justify-start bg-transparent">
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.karmagap_url && (
                      <Button variant="outline" asChild className="justify-start bg-transparent">
                        <a href={profile.karmagap_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          KarmaGAP
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Needs</CardTitle>
                <CardDescription>What you're currently looking for</CardDescription>
              </CardHeader>
              <CardContent>
                {needs && needs.length > 0 ? (
                  <div className="space-y-3">
                    {needs.map((need) => (
                      <div key={need.id} className="p-3 border border-border rounded-lg">
                        <h4 className="font-medium">{need.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{need.description}</p>
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active needs</p>
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
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{profile.email}</p>
                </div>
                {profile.location && (
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm">{profile.location}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Needs</span>
                  <span className="text-sm font-medium">{needs?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
