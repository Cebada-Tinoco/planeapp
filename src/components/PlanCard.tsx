"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Users, Lock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Plan } from "@/types"

interface PlanCardProps {
  plan: Plan
  isAuthenticated: boolean
  featured?: boolean
}

export default function PlanCard({ plan, isAuthenticated, featured = false }: PlanCardProps) {
  const categoryIcon = plan.categories?.icon ?? "🎯"
  const defaultImage = plan.categories?.default_image ?? "/images/categorias/otros.jpg"
  const photoUrl = plan.photo_url ?? defaultImage
  const planDate = new Date(plan.plan_date)
  const attendeesCount = plan.attendees_count ?? 0
  const isFull = plan.max_attendees ? attendeesCount >= plan.max_attendees : false

  if (featured) {
    return (
      <Link href={isAuthenticated ? `/planes/${plan.id}` : "/auth/login"}>
        <article className="relative rounded-3xl overflow-hidden active:scale-[0.99] transition-transform"
          style={{ height: 220 }}>
          <Image src={photoUrl} alt={plan.title} fill className="object-cover" sizes="100vw" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold">
            {categoryIcon} {plan.categories?.name}
          </span>

          {/* Distance badge */}
          {plan.distance_km !== undefined && (
            <span className="absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "#ff6b52" }}>
              {plan.distance_km < 1 ? "Cerca" : `${plan.distance_km} km`}
            </span>
          )}

          {!isAuthenticated && (
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-2 rounded-full">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-base leading-tight mb-2 line-clamp-2">
              {plan.title}
            </h3>
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(planDate, "d MMM · HH:mm", { locale: es })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">
                  {plan.location_name ?? plan.city ?? "Sin ubicación"}
                </span>
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <Users className="w-3.5 h-3.5" />
                {attendeesCount}
                {plan.max_attendees ? `/${plan.max_attendees}` : ""}
              </span>
            </div>
          </div>

          {isFull && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-bold px-5 py-2 rounded-full">Completo</span>
            </div>
          )}
        </article>
      </Link>
    )
  }

  // Standard card
  return (
    <Link href={isAuthenticated ? `/planes/${plan.id}` : "/auth/login"}>
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        style={{ boxShadow: "0 4px 16px rgba(17,28,45,0.07)" }}>
        {/* Image */}
        <div className="relative h-44 w-full">
          <Image src={photoUrl} alt={plan.title} fill className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full font-semibold text-gray-800">
            {categoryIcon} {plan.categories?.name}
          </span>

          {plan.distance_km !== undefined && (
            <span className="absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "#ff6b52" }}>
              {plan.distance_km < 1 ? "Cerca" : `${plan.distance_km} km`}
            </span>
          )}

          {!isAuthenticated && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          {isFull && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-bold px-4 py-1.5 rounded-full">Completo</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-[#111c2d] text-base leading-snug mb-2.5 line-clamp-2">
            {plan.title}
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-[#ff6b52] flex-shrink-0" />
              <span>{format(planDate, "EEEE d 'de' MMMM · HH:mm", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#ff6b52] flex-shrink-0" />
              <span className="truncate">{plan.location_name ?? plan.city ?? "Ubicación por definir"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="w-4 h-4 text-[#ff6b52] flex-shrink-0" />
              <span>
                {attendeesCount} asistente{attendeesCount !== 1 ? "s" : ""}
                {plan.max_attendees ? ` / ${plan.max_attendees} máx.` : ""}
              </span>
            </div>
          </div>

          {/* Organizer */}
          {plan.profiles && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              {plan.profiles.avatar_url ? (
                <Image src={plan.profiles.avatar_url} alt={plan.profiles.full_name ?? ""}
                  width={22} height={22} className="rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: "#ff6b52" }}>
                  {(plan.profiles.full_name ?? "?")[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-400">
                {isAuthenticated
                  ? `Organiza ${plan.profiles.full_name ?? plan.profiles.username ?? "usuario"}`
                  : "Inicia sesión para ver el organizador"}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
