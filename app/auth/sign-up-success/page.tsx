import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-muted-foreground">We've sent you a confirmation link to complete your registration</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle>Almost There!</CardTitle>
            <CardDescription>
              Click the confirmation link in your email to activate your CeLatam account and start matching with
              opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Check your inbox (and spam folder)</p>
              <p>• Click the confirmation link</p>
              <p>• Complete your profile setup</p>
              <p>• Start finding matches!</p>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Continue to Login</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
