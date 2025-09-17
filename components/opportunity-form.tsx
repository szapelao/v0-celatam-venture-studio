"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface OpportunityFormProps {
  opportunity?: {
    id: string
    title: string
    description: string
    category: string
    type: string
    requirements: string
    benefits: string
    source_url?: string
    deadline?: string
    is_active: boolean
  }
}

export function OpportunityForm({ opportunity }: OpportunityFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: opportunity?.title || "",
    description: opportunity?.description || "",
    category: opportunity?.category || "",
    type: opportunity?.type || "",
    requirements: opportunity?.requirements || "",
    benefits: opportunity?.benefits || "",
    source_url: opportunity?.source_url || "",
    deadline: opportunity?.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : "",
    is_active: opportunity?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const opportunityData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        created_by: user.id,
        provider_id: user.id,
      }

      let result
      if (opportunity) {
        // Update existing opportunity
        result = await supabase.from("opportunities").update(opportunityData).eq("id", opportunity.id)
      } else {
        // Create new opportunity
        result = await supabase.from("opportunities").insert([opportunityData])
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: "Success",
        description: `Opportunity ${opportunity ? "updated" : "created"} successfully`,
      })

      router.push("/admin/opportunities")
    } catch (error) {
      console.error("Error saving opportunity:", error)
      toast({
        title: "Error",
        description: `Failed to ${opportunity ? "update" : "create"} opportunity`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{opportunity ? "Edit" : "Create"} Opportunity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter opportunity title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the opportunity"
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funding">Funding</SelectItem>
                  <SelectItem value="Mentorship">Mentorship</SelectItem>
                  <SelectItem value="Talent">Talent</SelectItem>
                  <SelectItem value="Partnerships">Partnerships</SelectItem>
                  <SelectItem value="Knowledge">Knowledge</SelectItem>
                  <SelectItem value="Integrations">Integrations</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grant">Grant</SelectItem>
                  <SelectItem value="Program">Program</SelectItem>
                  <SelectItem value="Competition">Competition</SelectItem>
                  <SelectItem value="Job">Job</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="What are the requirements for this opportunity?"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="What benefits does this opportunity provide?"
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_url">Source URL (Optional)</Label>
              <Input
                id="source_url"
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active opportunity</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : opportunity ? "Update" : "Create"} Opportunity
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
