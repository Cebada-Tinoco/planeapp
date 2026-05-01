"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserCheck, UserPlus, UserX } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface JoinPlanButtonProps {
  planId: string
  userId: string
  isAttending: boolean
  isFull: boolean
}

export default function JoinPlanButton({ planId, userId, isAttending, isFull }: JoinPlanButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [attending, setAttending] = useState(isAttending)

  const handleToggle = async () => {
    setLoading(true)
    if (attending) {
      await supabase
        .from("plan_attendees")
        .delete()
        .eq("plan_id", planId)
        .eq("user_id", userId)
      setAttending(false)
    } else {
      await supabase
        .from("plan_attendees")
        .insert({ plan_id: planId, user_id: userId })
      setAttending(true)
    }
    setLoading(false)
    router.refresh()
  }

  if (attending) {
    return (
      <div className="flex gap-3">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
          <UserCheck className="w-5 h-5" />
          ¡Apuntado!
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="px-4 py-3.5 bg-gray-100 rounded-2xl text-gray-500 flex items-center gap-1.5 text-sm font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
          Salir
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || isFull}
      className="w-full bg-orange-500 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <UserPlus className="w-5 h-5" />
      )}
      {isFull ? "Plan completo" : "Apuntarme al plan"}
    </button>
  )
}
