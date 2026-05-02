"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LogoIcon } from "@/components/Logo"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este email ya está registrado")
      } else {
        setError("Error al registrarse. Inténtalo de nuevo.")
      }
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ background: "#f9f9ff" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "#e8faf8" }}>
          <CheckCircle className="w-9 h-9" style={{ color: "#006b5f" }} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111c2d]">¡Casi listo!</h2>
        <p className="text-gray-500 font-medium">
          Hemos enviado un email de confirmación a{" "}
          <strong className="text-[#111c2d]">{email}</strong>.
          Revisa tu bandeja de entrada.
        </p>
        <Link href="/auth/login"
          className="mt-2 text-white font-bold px-8 py-3.5 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #ff8a72, #ff6b52)" }}>
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9f9ff" }}>
      <div className="p-4 safe-top">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoIcon size={64} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111c2d]">Crear cuenta</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Únete a PlaneApp y empieza a hacer planes</p>
        </div>

        <div className="space-y-3 mb-6">
          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 2px 8px rgba(17,28,45,0.06)" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>
          <button onClick={handleFacebookLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
            style={{ background: "#1877F2" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Registrarse con Facebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-semibold">o con email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111c2d] mb-1.5">Nombre completo</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre" required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111c2d] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111c2d] mb-1.5">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all pr-12 font-medium" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold px-3 py-2 rounded-xl" style={{ background: "#ffdad6" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #ff8a72 0%, #ff6b52 60%, #ae311e 100%)", boxShadow: "0 8px 20px rgba(255,107,82,0.35)" }}>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-bold" style={{ color: "#ff6b52" }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
