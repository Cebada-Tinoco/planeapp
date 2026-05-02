import { createClient } from "@/lib/supabase/server"
import PlanFeed from "@/components/PlanFeed"
import BottomNav from "@/components/BottomNav"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import Link from "next/link"
import Image from "next/image"

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const { data: profile } = user
    ? await supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single()
    : { data: null }

  // Cargar categorías
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("id")

  // Cargar planes iniciales (sin geo, el cliente aplicará la geo)
  const { data: plans } = await supabase
    .from("plans")
    .select(`
      *,
      categories(*),
      profiles(*),
      plan_attendees(count)
    `)
    .eq("is_active", true)
    .gt("plan_date", new Date().toISOString())
    .order("plan_date", { ascending: true })
    .limit(20)

  const plansWithCount = (plans ?? []).map((p) => ({
    ...p,
    attendees_count: p.plan_attendees?.[0]?.count ?? 0,
    plan_attendees: undefined,
  }))

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between safe-top flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">PlaneApp</span>
        </div>
        {!isAuthenticated ? (
          <Link
            href="/auth/login"
            className="bg-orange-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full"
          >
            Entrar
          </Link>
        ) : (
          <Link href="/perfil">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">
                  {(profile?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                </span>
              </div>
            )}
          </Link>
        )}
      </header>

      {/* Feed (ocupa el resto) */}
      <main className="flex-1 overflow-hidden">
        <PlanFeed
          initialPlans={plansWithCount}
          categories={categories ?? []}
          isAuthenticated={isAuthenticated}
        />
      </main>

      <BottomNav isAuthenticated={isAuthenticated} />
      <PWAInstallPrompt />
    </div>
  )
}
