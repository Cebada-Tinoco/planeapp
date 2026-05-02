import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/"

  if (errorParam) {
    console.error("OAuth error:", errorParam, errorDescription)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? errorParam)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
    console.error("Exchange error:", error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
