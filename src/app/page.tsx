import { createClient } from "@/lib/supabase/server"
import PlanFeed from "@/components/PlanFeed"
import BottomNav from "@/components/BottomNav"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import Link from "next/link"
import Image from "next/image"
import PlaneappLogo from "@/components/Logo"

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const { data: profile } = user
    ? await supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single()
    : { data: null }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("id")

  const { data: plans } = await supabase
    .from("plans")
    .select(`*, categories(*), profiles(*), plan_attendees(count)`)
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f9f9ff" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between safe-top flex-shrink-0">
        <PlaneappLogo size={28} showText />
        {!isAuthenticated ? (
          <Link
            href="/auth/login"
            className="text-white text-sm font-bold px-5 py-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #ff8a72, #ff6b52)" }}
          >
            Entrar
          </Link>
        ) : (
          <Link href="/perfil">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ffdad4]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-[#ffdad4]"
                style={{ background: "#ff6b52" }}>
                <span className="text-white text-sm font-bold">
                  {(profile?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                </span>
              </div>
            )}
          </Link>
        )}
      </header>

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
