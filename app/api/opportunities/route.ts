import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert opportunity
    const { data, error } = await supabase
      .from("opportunities")
      .insert([
        {
          title: body.title,
          description: body.description,
          category: body.category,
          type: body.type,
          requirements: body.requirements,
          benefits: body.benefits,
          application_url: body.application_url || null,
          deadline: body.deadline || null,
          is_active: body.is_active ?? true,
          provider_id: "00000000-0000-0000-0000-000000000000", // Placeholder UUID
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
  }
}
