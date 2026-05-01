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
}

export default function PlanCard({ plan, isAuthenticated }: PlanCardProps) {
  const categoryIcon = plan.categories?.icon ?? "🎯"
  const defaultImage = plan.categories?.default_image ?? "/images/categorias/otros.jpg"
  const photoUrl = plan.photo_url ?? defaultImage
  const planDate = new Date(plan.plan_date)
  const attendeesCount = plan.attendees_count ?? 0
  const isFull = plan.max_attendees ? attendeesCount >= plan.max_attendees : false

  return (
    <Link href={isAuthenticated ? `/planes/${plan.id}` : "/auth/login"}>
      <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99] transition-transform">
        {/* Imagen */}
        <div className="relative h-44 w-full">
          <Image
            src={photoUrl}
            alt={plan.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Badge categoría */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-sm px-3 py-1 rounded-full font-medium">
            {categoryIcon} {plan.categories?.name}
          </span>
          {/* Badge distancia */}
          {plan.distance_km !== undefined && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {plan.distance_km < 1 ? "Cerca" : `${plan.distance_km} km`}
            </span>
          )}
          {/* Overlay si está lleno */}
          {isFull && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">
                Completo
              </span>
            </div>
          )}
          {/* Lock si no autenticado */}
          {!isAuthenticated && (
            <div className="absolute bottom-3 right-3 bg-black/50 p-1.5 rounded-full">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
            {plan.title}
          </h3>

          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>{format(planDate, "EEEE d 'de' MMMM · HH:mm", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className="truncate">{plan.location_name ?? plan.city ?? "Ubicación por definir"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>
                {attendeesCount} asistente{attendeesCount !== 1 ? "s" : ""}
                {plan.max_attendees ? ` / ${plan.max_attendees} máx.` : ""}
              </span>
            </div>
          </div>

          {/* Organizador */}
          {plan.profiles && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              {plan.profiles.avatar_url ? (
                <Image
                  src={plan.profiles.avatar_url}
                  alt={plan.profiles.full_name ?? ""}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xs text-orange-600 font-bold">
                    {(plan.profiles.full_name ?? "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-500">
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
