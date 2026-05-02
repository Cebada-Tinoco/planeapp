import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Plus, PawPrint, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import LogoutButton from "./LogoutButton"
import BottomNav from "@/components/BottomNav"
import AvatarUpload from "@/components/AvatarUpload"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: myPlans } = await supabase
    .from("plans")
    .select(`*, categories(*)`)
    .eq("organizer_id", user.id)
    .order("plan_date", { ascending: false })
    .limit(10)

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at")

  const { data: joinedPlans } = await supabase
    .from("plan_attendees")
    .select(`plans(*, categories(*))`)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(5)

  const joinedCount = joinedPlans?.length ?? 0
  const createdCount = myPlans?.length ?? 0
  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Usuario"
  const initials = displayName[0].toUpperCase()

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f9f9ff" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between safe-top">
        <h1 className="font-extrabold text-[#111c2d] text-lg">Mi perfil</h1>
        <LogoutButton />
      </div>

      {/* Profile card */}
      <div className="mx-4 mt-4 bg-white rounded-3xl p-5 flex flex-col items-center text-center"
        style={{ boxShadow: "0 4px 20px rgba(17,28,45,0.08)" }}>
        {/* Avatar with upload */}
        <div className="mb-3 ring-4 ring-[#ffdad4] rounded-full">
          <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url ?? null} initials={initials} />
        </div>

        <h2 className="font-extrabold text-[#111c2d] text-xl">{displayName}</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">{user.email}</p>
        {profile?.city && (
          <p className="text-sm font-semibold mt-1" style={{ color: "#ff6b52" }}>
            📍 {profile.city}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-0 w-full mt-4 border-t border-gray-100 pt-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-extrabold text-[#111c2d]">{createdCount}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Planes creados</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-extrabold text-[#111c2d]">{joinedCount}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Planes unidos</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-extrabold text-[#111c2d]">{pets?.length ?? 0}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Mascotas</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Pets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#111c2d] flex items-center gap-1.5">
              <PawPrint className="w-4 h-4" style={{ color: "#ff6b52" }} />
              Mis mascotas
            </h2>
            <Link href="/perfil/mascota/nueva"
              className="text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ color: "#ff6b52", background: "#ffdad4" }}>
              <Plus className="w-3.5 h-3.5" />
              Añadir
            </Link>
          </div>

          {pets && pets.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {pets.map((pet) => (
                <div key={pet.id} className="flex-shrink-0 bg-white rounded-2xl p-3 w-28 text-center"
                  style={{ boxShadow: "0 4px 12px rgba(17,28,45,0.06)" }}>
                  {pet.photo_url ? (
                    <Image src={pet.photo_url} alt={pet.name} width={48} height={48}
                      className="rounded-xl object-cover mx-auto mb-2" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: "#ffdad4" }}>
                      <PawPrint className="w-6 h-6" style={{ color: "#ff6b52" }} />
                    </div>
                  )}
                  <p className="text-sm font-bold text-[#111c2d] truncate">{pet.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {pet.sex === "male" ? "Macho" : "Hembra"}
                    {pet.age ? ` · ${pet.age}a` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: "0 4px 12px rgba(17,28,45,0.06)" }}>
              <PawPrint className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">
                No tienes mascotas. Añade una para unirte a planes de animales.
              </p>
            </div>
          )}
        </div>

        {/* My plans */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#111c2d] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" style={{ color: "#ff6b52" }} />
              Mis planes
            </h2>
            <Link href="/planes/nuevo"
              className="text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ color: "#ff6b52", background: "#ffdad4" }}>
              <Plus className="w-3.5 h-3.5" />
              Crear
            </Link>
          </div>

          {myPlans && myPlans.length > 0 ? (
            <div className="space-y-2">
              {myPlans.map((plan) => {
                const isActive = new Date(plan.plan_date) > new Date()
                return (
                  <Link key={plan.id} href={`/planes/${plan.id}`}>
                    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
                      style={{ boxShadow: "0 4px 12px rgba(17,28,45,0.06)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "#f0f3ff" }}>
                        {plan.categories?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#111c2d] truncate">{plan.title}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {format(new Date(plan.plan_date), "d MMM yyyy · HH:mm", { locale: es })}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isActive ? "" : "bg-gray-100 text-gray-500"
                      }`}
                        style={isActive ? { background: "#e8faf8", color: "#006b5f" } : {}}>
                        {isActive ? "Activo" : "Pasado"}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: "0 4px 12px rgba(17,28,45,0.06)" }}>
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">Aún no has creado ningún plan.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav isAuthenticated={true} />
    </div>
  )
}
