"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Mail, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResultsPage() {
  const [answers, setAnswers] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get answers from sessionStorage
    const storedAnswers = sessionStorage.getItem("chatAnswers")
    if (!storedAnswers) {
      router.push("/")
      return
    }

    const parsedAnswers = JSON.parse(storedAnswers)
    setAnswers(parsedAnswers)

    // Fetch matching opportunities
    fetchOpportunities(parsedAnswers)
  }, [router])

  const fetchOpportunities = async (userAnswers: any) => {
    try {
      const needCategories = userAnswers.needs || []

      let query = supabase
        .from("opportunities")
        .select(
          `
          *,
          profiles:provider_id (
            full_name,
            company_name,
            avatar_url
          )
        `,
        )
        .eq("is_active", true)

      // Filter by matching categories if user has needs
      if (needCategories.length > 0) {
        query = query.in("category", needCategories)
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(12)

      if (error) {
        console.error("[v0] Error fetching opportunities:", error)
        throw error
      }

      setOpportunities(data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching opportunities:", error?.message || error)
      setOpportunities([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) return

    setIsSubscribing(true)
    try {
      // Store email subscription in database
      const { error } = await supabase.from("email_subscriptions").insert({
        email,
        interests: answers.needs || [],
        project_name: answers.company_name,
        project_stage: answers.company_stage,
      })

      if (error) throw error

      setIsSubscribed(true)
    } catch (error) {
      console.error("[v0] Error subscribing:", error)
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isLoading || !answers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-foreground">CeLatam</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Great news, {answers.full_name}! We found {opportunities.length} opportunities for {answers.company_name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your needs, here are the best matches to help you grow on Celo
          </p>
        </div>

        {/* Opportunities Grid */}
        {opportunities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{opp.category}</Badge>
                    {opp.urgency === "high" && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <CardTitle className="text-lg">{opp.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{opp.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {opp.profiles && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {opp.profiles.full_name?.[0] || opp.profiles.company_name?.[0]}
                        </span>
                      </div>
                      <span>{opp.profiles.company_name || opp.profiles.full_name}</span>
                    </div>
                  )}
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={`mailto:contact@celatam.com?subject=Interest in ${opp.title}`}>
                      Learn More <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <p className="text-muted-foreground mb-4">
              We're still building our opportunities database. Subscribe below to get notified when new matches become
              available!
            </p>
          </div>
        )}

        {/* Email Subscription */}
        <Card className="max-w-2xl mx-auto border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>
              Get notified when new opportunities matching your needs become available on Celo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubscribed ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
                  className="flex-1"
                />
                <Button onClick={handleSubscribe} disabled={!email || isSubscribing}>
                  {isSubscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="font-medium mb-1">You're all set!</p>
                <p className="text-sm text-muted-foreground">
                  We'll email you at {email} when new opportunities match your needs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA to start over */}
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => router.push("/")} className="bg-transparent">
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
