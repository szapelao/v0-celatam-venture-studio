import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-foreground">CeLatam</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Your fast track to <span className="text-primary">thrive</span> on{" "}
              <span className="text-secondary">Celo</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
              Connecting Web3 founders and builders with the opportunities and resources they need to scale on Celo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/auth/sign-up">
                Start Matching <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Simple, fast, and effective matching for Web3 startup needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Define Your Needs</CardTitle>
                <CardDescription>
                  Tell us what you're looking for: funding, mentorship, talent, or partnerships in the Celo ecosystem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Get Matched</CardTitle>
                <CardDescription>
                  Our algorithm connects you with relevant Web3 opportunities and Celo resources
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Connect & Grow</CardTitle>
                <CardDescription>
                  Start conversations and build relationships that accelerate your Web3 startup on Celo
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Take your project to the next level: explore opportunities tailored to your project's stage and needs
          </p>
          <Button size="lg" asChild className="text-lg px-8">
            <Link href="/auth/sign-up">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">C</span>
              </div>
              <span className="font-semibold">CeLatam Venture Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 CeLatam. Connecting Web3 entrepreneurs on Celo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
