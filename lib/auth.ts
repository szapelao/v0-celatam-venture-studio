import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return { profile, error }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}
