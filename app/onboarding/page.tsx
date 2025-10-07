"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

const COMPANY_STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP/Prototype" },
  { value: "early_stage", label: "Early Stage" },
  { value: "growth", label: "Growth Stage" },
  { value: "scale", label: "Scale Stage" },
]

const INDUSTRIES = [
  "DeFi (Decentralized Finance)",
  "NFTs & Digital Assets",
  "Web3 Infrastructure",
  "Blockchain Gaming",
  "DAOs & Governance",
  "Cross-chain & Interoperability",
  "Web3 Social",
  "Decentralized Identity",
  "Carbon Credits & ReFi",
  "Web3 Payments",
  "Decentralized Storage",
  "Web3 Analytics",
  "Metaverse & Virtual Worlds",
  "Web3 Education",
  "Other Web3/Blockchain",
]

const NEED_CATEGORIES = [
  { value: "funding", label: "Funding & Investment" },
  { value: "mentorship", label: "Mentorship & Advice" },
  { value: "talent", label: "Talent & Hiring" },
  { value: "partnerships", label: "Strategic Partnerships" },
  { value: "resources", label: "Resources & Tools" },
  { value: "customers", label: "Customer Acquisition" },
  { value: "advisors", label: "Advisors & Board Members" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Form data
  const [profileData, setProfileData] = useState({
    full_name: "",
    company_name: "",
    company_stage: "",
    industry: "",
    location: "",
    bio: "",
    linkedin_url: "",
    website_url: "",
    github_url: "", // Added GitHub field
    karmagap_url: "", // Added KarmaGap field
  })

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([])
  const [needDetails, setNeedDetails] = useState({
    title: "",
    description: "",
    urgency: "medium",
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

      // Pre-fill email and name if available
      setProfileData((prev) => ({
        ...prev,
        full_name: user.user_metadata?.full_name || "",
      }))
    }
    getUser()
  }, [supabase, router])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleProfileSubmit = async () => {
    if (!user) return

    if (!profileData.full_name || !profileData.company_name || !profileData.company_stage || !profileData.github_url) {
      setError("Please fill in all required fields")
      return
    }

    if (profileData.github_url && !profileData.github_url.includes("github.com")) {
      setError("Please enter a valid GitHub URL")
      return
    }

    if (profileData.karmagap_url && !profileData.karmagap_url.includes("gap.karmahq.xyz")) {
      setError("Please enter a valid KarmaGap URL")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        ...profileData,
      })

      if (error) throw error
      handleNext()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNeedsSubmit = async () => {
    if (!user || selectedNeeds.length === 0) return

    setIsLoading(true)
    try {
      // Create needs for each selected category
      const needsToInsert = selectedNeeds.map((category) => ({
        user_id: user.id,
        title: needDetails.title || `Looking for ${NEED_CATEGORIES.find((c) => c.value === category)?.label}`,
        description: needDetails.description || `I need help with ${category} for my Web3 startup.`,
        category,
        urgency: needDetails.urgency,
      }))

      const { error } = await supabase.from("needs").insert(needsToInsert)

      if (error) throw error
      handleNext()
    } catch (error) {
      console.error("Error creating needs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  const progress = (currentStep / 3) * 100

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to CeLatam!</h1>
          <p className="text-muted-foreground">Let's set up your Web3 profile to find the perfect matches</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Profile Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your Web3 project</CardTitle>
              <CardDescription>Help other founders and investors learn about you and your Web3 startup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Project/Company Name *</Label>
                  <Input
                    id="company_name"
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    placeholder="Your Web3 project name"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_stage">Project Stage *</Label>
                  <Select
                    value={profileData.company_stage}
                    onValueChange={(value) => setProfileData({ ...profileData, company_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Web3 Category</Label>
                  <Select
                    value={profileData.industry}
                    onValueChange={(value) => setProfileData({ ...profileData, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Project Description</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about your Web3 project and what you're building on Celo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub Repository *</Label>
                <Input
                  id="github_url"
                  value={profileData.github_url}
                  onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
                  placeholder="https://github.com/yourproject/repo"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={profileData.linkedin_url}
                    onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={profileData.website_url}
                    onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
                    placeholder="https://yourproject.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="karmagap_url">KarmaGap Page (Optional)</Label>
                <Input
                  id="karmagap_url"
                  value={profileData.karmagap_url}
                  onChange={(e) => setProfileData({ ...profileData, karmagap_url: e.target.value })}
                  placeholder="https://gap.karmahq.xyz/project/..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleProfileSubmit}
                  disabled={
                    !profileData.full_name ||
                    !profileData.company_name ||
                    !profileData.company_stage ||
                    !profileData.github_url ||
                    isLoading
                  }
                >
                  {isLoading ? "Saving..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: What do you need? */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What do you need help with?</CardTitle>
              <CardDescription>
                Select the areas where you're looking for support in the Web3/Celo ecosystem (you can add more later)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {NEED_CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={selectedNeeds.includes(category.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNeeds([...selectedNeeds, category.value])
                        } else {
                          setSelectedNeeds(selectedNeeds.filter((need) => need !== category.value))
                        }
                      }}
                    />
                    <Label
                      htmlFor={category.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedNeeds.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="need_title">Brief description (optional)</Label>
                    <Input
                      id="need_title"
                      value={needDetails.title}
                      onChange={(e) => setNeedDetails({ ...needDetails, title: e.target.value })}
                      placeholder="e.g., Seeking Series A funding for Celo DeFi expansion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="need_description">More details (optional)</Label>
                    <Textarea
                      id="need_description"
                      value={needDetails.description}
                      onChange={(e) => setNeedDetails({ ...needDetails, description: e.target.value })}
                      placeholder="Provide more context about what you're looking for in the Web3 space..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNeedsSubmit} disabled={selectedNeeds.length === 0 || isLoading}>
                  {isLoading ? "Saving..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>You're all set!</CardTitle>
              <CardDescription>
                Your Web3 profile is complete and you're ready to start finding matches in the Celo ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Browse Web3 opportunities that match your needs</li>
                    <li>• Get notified when new Celo ecosystem matches are found</li>
                    <li>• Connect with other Web3 founders and resources</li>
                    <li>• Add more needs or opportunities anytime</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleComplete}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
