import { redirect, notFound } from "next/navigation"
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

async function updateOpportunity(id: string, formData: FormData) {
  "use server"

  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const type = formData.get("type") as string
  const requirements = formData.get("requirements") as string
  const benefits = formData.get("benefits") as string
  const application_url = formData.get("application_url") as string
  const is_active = formData.get("is_active") === "true"

  const { error } = await supabase
    .from("opportunities")
    .update({
      title,
      description,
      category,
      type,
      requirements: requirements.split("\n").filter((r) => r.trim()),
      benefits: benefits.split("\n").filter((b) => b.trim()),
      application_url,
      is_active,
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating opportunity:", error)
    return
  }

  redirect("/admin/opportunities")
}

export default async function EditOpportunityPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const supabase = await createClient()

  const { data: opportunity } = await supabase.from("opportunities").select("*").eq("id", params.id).single()

  if (!opportunity) {
    notFound()
  }

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
            <h1 className="text-3xl font-bold text-forest-green">Edit Opportunity</h1>
            <p className="text-off-black/70">Update opportunity information</p>
          </div>
        </div>

        <Card className="border-forest-green/20">
          <CardHeader>
            <CardTitle className="text-forest-green">Opportunity Details</CardTitle>
            <CardDescription>Update the information about the opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateOpportunity.bind(null, params.id)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={opportunity.title}
                  required
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={opportunity.description}
                  rows={4}
                  required
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={opportunity.category} required>
                    <SelectTrigger className="border-forest-green/30">
                      <SelectValue />
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
                  <Select name="type" defaultValue={opportunity.type} required>
                    <SelectTrigger className="border-forest-green/30">
                      <SelectValue />
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
                  defaultValue={Array.isArray(opportunity.requirements) ? opportunity.requirements.join("\n") : ""}
                  rows={4}
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  defaultValue={Array.isArray(opportunity.benefits) ? opportunity.benefits.join("\n") : ""}
                  rows={4}
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  name="application_url"
                  type="url"
                  defaultValue={opportunity.application_url || ""}
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status *</Label>
                <Select name="is_active" defaultValue={opportunity.is_active ? "true" : "false"} required>
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
                  Update Opportunity
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
