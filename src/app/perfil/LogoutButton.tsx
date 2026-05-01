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
    <button
      onClick={handleLogout}
      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
