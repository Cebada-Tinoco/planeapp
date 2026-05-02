"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session) {
        router.push("/")
        router.refresh()
        return
      }

      // Intentar intercambiar el código de la URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const errorParam = params.get("error")
      const errorDescription = params.get("error_description")

      if (errorParam) {
        router.push(`/auth/login?error=${encodeURIComponent(errorDescription ?? errorParam)}`)
        return
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError) {
          router.push("/")
          router.refresh()
          return
        }
        router.push(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
        return
      }

      // Esperar a que Supabase procese el hash (flujo implícito)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe()
          router.push("/")
          router.refresh()
        }
      })

      // Timeout por si no hay respuesta
      setTimeout(() => {
        subscription.unsubscribe()
        router.push("/auth/login?error=timeout")
      }, 5000)
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
        <span className="text-white text-2xl font-bold">P</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
        <span className="text-sm">Iniciando sesión...</span>
      </div>
    </div>
  )
}
