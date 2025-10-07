"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface FeedbackFormProps {
  type: "platform" | "match"
  matchId?: string
}

export function FeedbackForm({ type, matchId }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [category, setCategory] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const feedbackData = {
        user_id: userData.user.id,
        type,
        category: category || null,
        message: message.trim(),
        rating: rating > 0 ? rating : null,
        match_id: matchId || null,
      }

      const { error } = await supabase.from("feedback").insert(feedbackData)

      if (error) {
        console.error("Error submitting feedback:", error)
        return
      }

      setSubmitted(true)
      setMessage("")
      setRating(0)
      setCategory("")

      // Refresh the page to show updated feedback
      router.refresh()
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Send className="h-6 w-6 text-chart-2" />
        </div>
        <p className="font-medium text-chart-2">Thank you for your feedback!</p>
        <p className="text-sm text-muted-foreground">Your input helps us improve the platform.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <Label className="text-sm font-medium">Rating</Label>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Category (for platform feedback) */}
      {type === "platform" && (
        <div>
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select feedback category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matching">Matching Algorithm</SelectItem>
              <SelectItem value="ui_ux">User Interface</SelectItem>
              <SelectItem value="features">Features</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="bugs">Bug Reports</SelectItem>
              <SelectItem value="suggestions">Suggestions</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium">
          {type === "match" ? "How was this match?" : "Your feedback"}
        </Label>
        <Textarea
          id="message"
          placeholder={
            type === "match"
              ? "Tell us about your experience with this match..."
              : "Share your thoughts about the platform..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 min-h-24"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading || !message.trim()} className="w-full">
        {isLoading ? "Submitting..." : "Submit Feedback"}
        <Send className="ml-2 h-4 w-4" />
      </Button>
    </form>
  )
}
