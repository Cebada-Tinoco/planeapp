"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors">
      <LogOut className="w-4 h-4" />
      Salir
    </button>
  )
}
