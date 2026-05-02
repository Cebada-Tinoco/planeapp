import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
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
    <div className="min-h-screen" style={{ background: "#f9f9ff" }}>
      {/* Hero */}
      <div className="relative h-72">
        <Image src={photoUrl} alt={plan.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link href="/"
          className="absolute top-4 left-4 safe-top bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Category badge */}
        <span className="absolute top-4 right-4 safe-top bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold">
          {plan.categories?.icon} {plan.categories?.name}
        </span>

        {/* Title + organizer over image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-xl font-extrabold text-white leading-tight mb-2">{plan.title}</h1>
          <div className="flex items-center gap-2">
            {plan.profiles?.avatar_url ? (
              <Image src={plan.profiles.avatar_url} alt="" width={28} height={28}
                className="rounded-full object-cover ring-2 ring-white/40" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/40"
                style={{ background: "#ff6b52" }}>
                {(plan.profiles?.full_name ?? "?")[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-white/90 font-medium">
              {plan.profiles?.full_name ?? plan.profiles?.username ?? "Usuario"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-4 pb-32">
        {/* Info card */}
        <div className="bg-white rounded-2xl p-4 space-y-3.5"
          style={{ boxShadow: "0 4px 16px rgba(17,28,45,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#ffdad4" }}>
              <Calendar className="w-5 h-5" style={{ color: "#ff6b52" }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Fecha y hora</p>
              <p className="text-sm font-bold text-[#111c2d]">
                {format(planDate, "EEEE d 'de' MMMM 'de' yyyy · HH:mm", { locale: es })}
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#ffdad4" }}>
              <MapPin className="w-5 h-5" style={{ color: "#ff6b52" }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Ubicación</p>
              <p className="text-sm font-bold text-[#111c2d]">
                {plan.location_name ?? plan.city ?? "Ubicación por definir"}
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#ffdad4" }}>
              <Users className="w-5 h-5" style={{ color: "#ff6b52" }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Asistentes</p>
              <p className="text-sm font-bold text-[#111c2d]">
                {attendees?.length ?? 0} confirmado{(attendees?.length ?? 0) !== 1 ? "s" : ""}
                {plan.max_attendees ? ` · Máximo ${plan.max_attendees}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {plan.description && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 4px 16px rgba(17,28,45,0.06)" }}>
            <h2 className="text-sm font-bold text-[#111c2d] mb-2">Sobre el plan</h2>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line font-medium">
              {plan.description}
            </p>
          </div>
        )}

        {/* Attendees */}
        {attendees && attendees.length > 0 && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 4px 16px rgba(17,28,45,0.06)" }}>
            <h2 className="text-sm font-bold text-[#111c2d] mb-3">
              Asistentes ({attendees.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {attendees.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1">
                  {a.profiles?.avatar_url ? (
                    <Image src={a.profiles.avatar_url} alt="" width={40} height={40}
                      className="rounded-full object-cover ring-2 ring-[#ffdad4]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#ffdad4]"
                      style={{ background: "#ff6b52" }}>
                      {(a.profiles?.full_name ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-500 font-medium max-w-[48px] truncate text-center">
                    {a.profiles?.full_name?.split(" ")[0] ?? "Usuario"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 4px 16px rgba(17,28,45,0.06)" }}>
            <h2 className="text-sm font-bold text-[#111c2d] mb-3">Fotos ({photos.length})</h2>
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

      {/* Join button */}
      {!isOrganizer && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-bottom">
          <JoinPlanButton planId={plan.id} userId={user.id} isAttending={!!isAttending} isFull={isFull} />
        </div>
      )}
    </div>
  )
}
