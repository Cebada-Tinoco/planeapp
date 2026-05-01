import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Users, User, Camera } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import JoinPlanButton from "./JoinPlanButton"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: plan } = await supabase
    .from("plans")
    .select(`*, categories(*), profiles(*)`)
    .eq("id", id)
    .single()

  if (!plan) notFound()

  const { data: attendees } = await supabase
    .from("plan_attendees")
    .select(`*, profiles(*)`)
    .eq("plan_id", id)
    .order("joined_at", { ascending: true })

  const { data: photos } = await supabase
    .from("plan_photos")
    .select("*")
    .eq("plan_id", id)
    .order("created_at", { ascending: false })

  const isAttending = attendees?.some((a) => a.user_id === user.id)
  const isOrganizer = plan.organizer_id === user.id
  const isFull = plan.max_attendees ? (attendees?.length ?? 0) >= plan.max_attendees : false
  const photoUrl = plan.photo_url ?? plan.categories?.default_image ?? "/images/categorias/otros.jpg"
  const planDate = new Date(plan.plan_date)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero imagen */}
      <div className="relative h-64">
        <Image src={photoUrl} alt={plan.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 safe-top bg-white/20 backdrop-blur-sm p-2 rounded-full text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
          {plan.categories?.icon} {plan.categories?.name}
        </span>
      </div>

      {/* Contenido */}
      <div className="px-4 py-5 space-y-5 pb-32">
        {/* Título y organizador */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{plan.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {plan.profiles?.avatar_url ? (
              <Image
                src={plan.profiles.avatar_url}
                alt=""
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-orange-600 font-bold">
                  {(plan.profiles?.full_name ?? "?")[0].toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              Organizado por{" "}
              <span className="font-medium text-gray-700">
                {plan.profiles?.full_name ?? plan.profiles?.username ?? "Usuario"}
              </span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha y hora</p>
              <p className="text-sm font-medium text-gray-800">
                {format(planDate, "EEEE d 'de' MMMM 'de' yyyy · HH:mm", { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Ubicación</p>
              <p className="text-sm font-medium text-gray-800">
                {plan.location_name ?? plan.city ?? "Ubicación por definir"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Asistentes</p>
              <p className="text-sm font-medium text-gray-800">
                {attendees?.length ?? 0} confirmado{(attendees?.length ?? 0) !== 1 ? "s" : ""}
                {plan.max_attendees ? ` · Máximo ${plan.max_attendees}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {plan.description && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Detalles</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {plan.description}
            </p>
          </div>
        )}

        {/* Asistentes */}
        {attendees && attendees.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Asistentes ({attendees.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {attendees.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  {a.profiles?.avatar_url ? (
                    <Image
                      src={a.profiles.avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm text-orange-600 font-bold">
                        {(a.profiles?.full_name ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600">
                    {a.profiles?.full_name ?? a.profiles?.username ?? "Usuario"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fotos */}
        {photos && photos.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Fotos ({photos.length})
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={photo.photo_url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón fijo */}
      {!isOrganizer && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-bottom">
          <JoinPlanButton
            planId={plan.id}
            userId={user.id}
            isAttending={!!isAttending}
            isFull={isFull}
          />
        </div>
      )}
    </div>
  )
}
