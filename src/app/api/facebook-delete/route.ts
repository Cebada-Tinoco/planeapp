import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const signedRequest = body.get("signed_request") as string

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 })
    }

    // Decodificar el payload (segunda parte del signed_request)
    const [, payload] = signedRequest.split(".")
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
    const userId = decoded.user_id

    // Eliminar datos del usuario en Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar el usuario por su provider_id de Facebook
    const { data: users } = await supabase.auth.admin.listUsers()
    const fbUser = users?.users?.find(
      (u) => u.app_metadata?.provider === "facebook" &&
             u.app_metadata?.providers?.includes("facebook") &&
             u.identities?.some((i) => i.provider === "facebook" && i.id === userId)
    )

    if (fbUser) {
      await supabase.auth.admin.deleteUser(fbUser.id)
    }

    // Respuesta requerida por Facebook
    const confirmationCode = `planeapp-${userId}-${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://planeapp.michiclana.es"

    return NextResponse.json({
      url: `${appUrl}/eliminar-datos?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
