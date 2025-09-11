"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, X, Calendar, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface Opportunity {
  id: string
  title: string
  description: string
  category: string
  type: string
  requirements?: string
  benefits?: string
  contact_info?: any
  created_at: string
  profiles: {
    full_name: string
    company_name: string
    avatar_url?: string
  }
}

interface OpportunityCardsProps {
  opportunities: Opportunity[]
  userNeeds: string[]
}

export function OpportunityCards({ opportunities, userNeeds }: OpportunityCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const currentOpportunity = opportunities[currentIndex]

  const handleInterest = async (interested: boolean) => {
    if (!currentOpportunity || isLoading) return

    setIsLoading(true)
    try {
      if (interested) {
        // Create a match request
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        // Find a matching need from the user
        const { data: userNeed } = await supabase
          .from("needs")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("category", currentOpportunity.category)
          .eq("is_active", true)
          .limit(1)
          .single()

        if (userNeed) {
          const { error } = await supabase.from("matches").insert({
            need_id: userNeed.id,
            opportunity_id: currentOpportunity.id,
            requester_id: userData.user.id,
            provider_id: currentOpportunity.profiles ? currentOpportunity.profiles.id : null,
            status: "pending",
          })

          if (error) {
            console.error("Error creating match:", error)
          }
        }
      }

      // Move to next card
      if (currentIndex < opportunities.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // No more cards
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error handling interest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      funding: "bg-primary/10 text-primary",
      mentorship: "bg-secondary/10 text-secondary",
      talent: "bg-accent/10 text-accent-foreground",
      partnerships: "bg-chart-4/10 text-chart-4",
      resources: "bg-chart-5/10 text-chart-5",
      customers: "bg-chart-2/10 text-chart-2",
      advisors: "bg-chart-3/10 text-chart-3",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investment":
        return "💰"
      case "service":
        return "🛠️"
      case "partnership":
        return "🤝"
      case "job":
        return "👥"
      case "resource":
        return "📚"
      case "event":
        return "📅"
      default:
        return "💡"
    }
  }

  if (!currentOpportunity) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">All done!</h3>
        <p className="text-muted-foreground mb-6">You've seen all available opportunities.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  const isMatchingNeed = userNeeds.includes(currentOpportunity.category)

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center gap-1">
        {opportunities.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : index < currentIndex ? "bg-primary/30" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Opportunity Card */}
      <Card className="relative overflow-hidden border-2 hover:border-primary/20 transition-colors">
        {isMatchingNeed && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-primary/10 text-primary border-primary/20">Perfect Match</Badge>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentOpportunity.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentOpportunity.profiles?.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{currentOpportunity.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{currentOpportunity.profiles?.company_name}</span>
                <span className="text-xs">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(currentOpportunity.created_at).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(currentOpportunity.type)}</span>
            <Badge className={getCategoryColor(currentOpportunity.category)}>
              {currentOpportunity.category.charAt(0).toUpperCase() + currentOpportunity.category.slice(1)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {currentOpportunity.type}
            </Badge>
          </div>

          <div>
            <p className="text-sm leading-relaxed">{currentOpportunity.description}</p>
          </div>

          {currentOpportunity.requirements && (
            <div>
              <h4 className="text-sm font-medium mb-2">Requirements</h4>
              <p className="text-sm text-muted-foreground">{currentOpportunity.requirements}</p>
            </div>
          )}

          {currentOpportunity.benefits && (
            <div>
              <h4 className="text-sm font-medium mb-2">What's Offered</h4>
              <p className="text-sm text-muted-foreground">{currentOpportunity.benefits}</p>
            </div>
          )}

          {currentOpportunity.contact_info?.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Website available</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 max-w-32 h-14 bg-transparent border-2 hover:border-destructive/50 hover:bg-destructive/5"
          onClick={() => handleInterest(false)}
          disabled={isLoading}
        >
          <X className="h-6 w-6 text-destructive" />
        </Button>
        <Button
          size="lg"
          className="flex-1 max-w-32 h-14 bg-primary hover:bg-primary/90"
          onClick={() => handleInterest(true)}
          disabled={isLoading}
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>

      {/* Card counter */}
      <div className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} of {opportunities.length}
      </div>
    </div>
  )
}
