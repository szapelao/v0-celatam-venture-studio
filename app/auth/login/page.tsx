"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Mail, Wallet } from "lucide-react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (walletType: "metamask" | "walletconnect") => {
    setIsLoading(true)
    setError(null)

    try {
      if (walletType === "metamask") {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          })

          if (accounts.length > 0) {
            // In a real implementation, you'd verify the wallet signature with Supabase
            console.log("[v0] Connected to MetaMask:", accounts[0])
            router.push("/dashboard")
          }
        } else {
          throw new Error("MetaMask is not installed")
        }
      } else {
        // For WalletConnect, you'd typically use their SDK
        // For now, show a message to install MetaMask or use email
        throw new Error("Please use MetaMask or sign in with email")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error

      setError("Password reset email sent! Check your inbox.")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your CeLatam account</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Choose your preferred login method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-transparent"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleWalletConnect("metamask")}
                      disabled={isLoading}
                      className="flex-1 bg-transparent"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      MetaMask
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleWalletConnect("walletconnect")}
                      disabled={isLoading}
                      className="flex-1 bg-transparent"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      WalletConnect
                    </Button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="founder@startup.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={handleForgotPassword}
                          className="px-0 font-normal text-xs"
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && (
                      <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="text-primary hover:text-primary/80 underline underline-offset-4"
                    >
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
