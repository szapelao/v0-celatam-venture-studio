"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    requirements: [""],
    benefits: [""],
    application_url: "",
    deadline: "",
    is_active: true,
  })

  const categories = ["funding", "mentorship", "talent", "partnerships", "resources", "customers", "advisors"]

  const types = ["grant", "investment", "accelerator", "incubator", "mentorship", "partnership", "resource", "service"]

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }))
  }

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }))
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const updateBenefit = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((ben, i) => (i === index ? value : ben)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      // Filter out empty requirements and benefits
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter((r) => r.trim() !== ""),
        benefits: formData.benefits.filter((b) => b.trim() !== ""),
      }

      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) throw new Error("Failed to create opportunity")

      setMessage("Opportunity created successfully!")
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        type: "",
        requirements: [""],
        benefits: [""],
        application_url: "",
        deadline: "",
        is_active: true,
      })
    } catch (error) {
      setMessage("Error creating opportunity. Please try again.")
      console.error("[v0] Error creating opportunity:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-20">
      <div className="mx-auto max-w-3xl">
        <Card className="border-forest-green/20">
          <CardHeader className="space-y-1 bg-forest-green/5">
            <CardTitle className="text-2xl font-bold text-forest-green">Add New Opportunity</CardTitle>
            <CardDescription className="text-forest-green/70">
              Quick setup form to add opportunities to CeloBuddy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-forest-green font-medium">
                  Opportunity Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Celo Camp Batch 10"
                  required
                  className="border-forest-green/20 focus:border-forest-green"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-forest-green font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the opportunity..."
                  rows={4}
                  required
                  className="border-forest-green/20 focus:border-forest-green"
                />
              </div>

              {/* Category and Type */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-forest-green font-medium">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="border-forest-green/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-forest-green font-medium">
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                    required
                  >
                    <SelectTrigger className="border-forest-green/20">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label className="text-forest-green font-medium">Requirements</Label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="e.g., Building on Celo"
                      className="border-forest-green/20 focus:border-forest-green"
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                        className="border-forest-green/20 hover:bg-forest-green/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                  className="border-forest-green/20 hover:bg-forest-green/10 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirement
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <Label className="text-forest-green font-medium">Benefits</Label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="e.g., $50,000 in funding"
                      className="border-forest-green/20 focus:border-forest-green"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                        className="border-forest-green/20 hover:bg-forest-green/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                  className="border-forest-green/20 hover:bg-forest-green/10 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Benefit
                </Button>
              </div>

              {/* Application URL */}
              <div className="space-y-2">
                <Label htmlFor="application_url" className="text-forest-green font-medium">
                  Application URL
                </Label>
                <Input
                  id="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, application_url: e.target.value }))}
                  placeholder="https://..."
                  className="border-forest-green/20 focus:border-forest-green"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-forest-green font-medium">
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  className="border-forest-green/20 focus:border-forest-green"
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-lg p-4 ${
                    message.includes("success") ? "bg-mini-green/20 text-forest-green" : "bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-forest-green hover:bg-forest-green/90 text-white font-semibold py-6 text-lg"
                >
                  {loading ? "Creating Opportunity..." : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
