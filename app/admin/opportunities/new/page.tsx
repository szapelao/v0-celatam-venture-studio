import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth-utils"

async function createOpportunity(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const type = formData.get("type") as string
  const requirements = formData.get("requirements") as string
  const benefits = formData.get("benefits") as string
  const application_url = formData.get("application_url") as string
  const is_active = formData.get("is_active") === "true"

  const { error } = await supabase.from("opportunities").insert({
    title,
    description,
    category,
    type,
    requirements: requirements.split("\n").filter((r) => r.trim()),
    benefits: benefits.split("\n").filter((b) => b.trim()),
    application_url,
    is_active,
    provider_id: user.id,
  })

  if (error) {
    console.error("[v0] Error creating opportunity:", error)
    return
  }

  redirect("/admin/opportunities")
}

export default async function NewOpportunityPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild className="text-forest-green">
            <Link href="/admin/opportunities" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Opportunities
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-forest-green">Add New Opportunity</h1>
            <p className="text-off-black/70">Create a new opportunity for Celo builders</p>
          </div>
        </div>

        <Card className="border-forest-green/20">
          <CardHeader>
            <CardTitle className="text-forest-green">Opportunity Details</CardTitle>
            <CardDescription>Fill in the information about the opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createOpportunity} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Celo Camp Accelerator"
                  required
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the opportunity in detail..."
                  rows={4}
                  required
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger className="border-forest-green/30">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funding">Funding</SelectItem>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="talent">Talent</SelectItem>
                      <SelectItem value="partnerships">Partnerships</SelectItem>
                      <SelectItem value="resources">Resources</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="advisors">Advisors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger className="border-forest-green/30">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="accelerator">Accelerator</SelectItem>
                      <SelectItem value="incubator">Incubator</SelectItem>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Building on Celo&#10;Active project with traction&#10;Team of 2+ people"
                  rows={4}
                  className="border-forest-green/30 focus:border-forest-green"
                />
                <p className="text-sm text-off-black/70">Enter each requirement on a new line</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  placeholder="$50,000 in funding&#10;3 months of mentorship&#10;Access to Celo ecosystem"
                  rows={4}
                  className="border-forest-green/30 focus:border-forest-green"
                />
                <p className="text-sm text-off-black/70">Enter each benefit on a new line</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  name="application_url"
                  type="url"
                  placeholder="https://..."
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status *</Label>
                <Select name="is_active" defaultValue="true" required>
                  <SelectTrigger className="border-forest-green/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-forest-green hover:bg-forest-green/90">
                  Create Opportunity
                </Button>
                <Button type="button" variant="outline" asChild className="border-forest-green/30 bg-transparent">
                  <Link href="/admin/opportunities">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
