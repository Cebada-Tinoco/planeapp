import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Settings, LogOut, Plus, PawPrint, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import LogoutButton from "./LogoutButton"
import BottomNav from "@/components/BottomNav"

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

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Usuario"
  const initials = displayName[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between safe-top">
        <h1 className="font-bold text-gray-900 text-lg">Mi perfil</h1>
        <LogoutButton />
      </div>

      {/* Avatar y nombre */}
      <div className="bg-white px-4 py-6 flex items-center gap-4 border-b border-gray-100">
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt=""
            width={64}
            height={64}
            className="rounded-2xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900 text-lg">{displayName}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          {profile?.city && (
            <p className="text-sm text-gray-500 mt-0.5">📍 {profile.city}</p>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Mascotas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-1.5">
              <PawPrint className="w-4 h-4 text-orange-400" />
              Mis mascotas
            </h2>
            <Link href="/perfil/mascota/nueva" className="text-orange-500 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Añadir
            </Link>
          </div>

          {pets && pets.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {pets.map((pet) => (
                <div key={pet.id} className="flex-shrink-0 bg-white rounded-2xl p-3 w-28 text-center shadow-sm">
                  {pet.photo_url ? (
                    <Image
                      src={pet.photo_url}
                      alt={pet.name}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <PawPrint className="w-6 h-6 text-orange-400" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 truncate">{pet.name}</p>
                  <p className="text-xs text-gray-400">
                    {pet.sex === "male" ? "Macho" : "Hembra"}
                    {pet.age ? ` · ${pet.age} años` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 bg-white rounded-2xl p-4 text-center">
              No tienes mascotas registradas. Añade una para unirte a planes de animales.
            </p>
          )}
        </div>

        {/* Mis planes creados */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400" />
              Mis planes
            </h2>
            <Link href="/planes/nuevo" className="text-orange-500 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Crear
            </Link>
          </div>

          {myPlans && myPlans.length > 0 ? (
            <div className="space-y-2">
              {myPlans.map((plan) => (
                <Link key={plan.id} href={`/planes/${plan.id}`}>
                  <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm active:scale-[0.99] transition-transform">
                    <span className="text-xl">{plan.categories?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{plan.title}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(plan.plan_date), "d MMM yyyy · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      new Date(plan.plan_date) > new Date()
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {new Date(plan.plan_date) > new Date() ? "Activo" : "Pasado"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 bg-white rounded-2xl p-4 text-center">
              Aún no has creado ningún plan.
            </p>
          )}
        </div>
      </div>

      <BottomNav isAuthenticated={true} />
    </div>
  )
}
