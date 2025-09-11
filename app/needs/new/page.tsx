"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

const NEED_CATEGORIES = [
  { value: "funding", label: "Funding & Investment" },
  { value: "mentorship", label: "Mentorship & Advice" },
  { value: "talent", label: "Talent & Hiring" },
  { value: "partnerships", label: "Strategic Partnerships" },
  { value: "resources", label: "Resources & Tools" },
  { value: "customers", label: "Customer Acquisition" },
  { value: "advisors", label: "Advisors & Board Members" },
]

const URGENCY_LEVELS = [
  { value: "low", label: "Low - Nice to have" },
  { value: "medium", label: "Medium - Important" },
  { value: "high", label: "High - Urgent" },
  { value: "critical", label: "Critical - Immediate" },
]

export default function NewNeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "medium",
    budget_range: "",
    timeline: "",
    skills_needed: "",
  })

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }
    getUser()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const skillsArray = formData.skills_needed ? formData.skills_needed.split(",").map((skill) => skill.trim()) : []

      const { error } = await supabase.from("needs").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        urgency: formData.urgency,
        budget_range: formData.budget_range || null,
        timeline: formData.timeline || null,
        skills_needed: skillsArray.length > 0 ? skillsArray : null,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating need:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-lg">Add New Need</h1>
            <p className="text-sm text-muted-foreground">Tell us what you're looking for</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              What do you need help with?
            </CardTitle>
            <CardDescription>Be specific about what you're looking for to get better matches</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Seeking Series A funding for expansion"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select what type of help you need" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEED_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide more details about what you're looking for, your current situation, and what success looks like..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g., Next 3 months"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range (optional)</Label>
                <Input
                  id="budget_range"
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  placeholder="e.g., $10k-50k, Equity-based, Pro bono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills_needed">Skills Needed (optional)</Label>
                <Input
                  id="skills_needed"
                  value={formData.skills_needed}
                  onChange={(e) => setFormData({ ...formData, skills_needed: e.target.value })}
                  placeholder="e.g., React, Marketing, Sales, separated by commas"
                />
                <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!formData.title || !formData.description || !formData.category || isLoading}
                >
                  {isLoading ? "Creating..." : "Create Need"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
