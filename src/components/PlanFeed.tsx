"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Loader2, RefreshCw } from "lucide-react"
import PlanCard from "./PlanCard"
import FilterBar from "./FilterBar"
import { createClient } from "@/lib/supabase/client"
import type { Plan, Category, Filters } from "@/types"

interface PlanFeedProps {
  initialPlans: Plan[]
  categories: Category[]
  isAuthenticated: boolean
}

export default function PlanFeed({ initialPlans, categories, isAuthenticated }: PlanFeedProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [filters, setFilters] = useState<Filters>({ category: "", search: "", city: "" })
  const [loading, setLoading] = useState(false)
  const [geoStatus, setGeoStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGeoStatus("requesting")
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGeoStatus("granted")
        },
        () => setGeoStatus("denied"),
        { enableHighAccuracy: false, timeout: 10000 }
      )
    } else {
      setGeoStatus("denied")
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      if (userCoords && geoStatus === "granted") {
        const { data } = await supabase.rpc("get_plans_near", {
          lat: userCoords.lat,
          lng: userCoords.lng,
          radius_km: 100,
        })
        if (data) {
          const planIds = data.map((p: Plan) => p.id)
          const { data: fullPlans } = await supabase
            .from("plans")
            .select(`*, categories(*), profiles(*)`)
            .in("id", planIds)
            .eq("is_active", true)
            .gt("plan_date", new Date().toISOString())

          if (fullPlans) {
            const ordered = data.map((p: Plan) => {
              const full = fullPlans.find((fp: Plan) => fp.id === p.id)
              return { ...full, distance_km: p.distance_km, attendees_count: p.attendees_count }
            })
            setPlans(applyFilters(ordered, filters))
          }
        }
      } else {
        let query = supabase
          .from("plans")
          .select(`*, categories(*), profiles(*), plan_attendees(count)`)
          .eq("is_active", true)
          .gt("plan_date", new Date().toISOString())
          .order("plan_date", { ascending: true })

        if (filters.category) {
          const cat = categories.find((c) => c.slug === filters.category)
          if (cat) query = query.eq("category_id", cat.id)
        }
        if (filters.city) query = query.ilike("city", `%${filters.city}%`)
        if (filters.search) query = query.ilike("title", `%${filters.search}%`)

        const { data } = await query
        if (data) setPlans(data)
      }
    } finally {
      setLoading(false)
    }
  }, [userCoords, geoStatus, filters])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  function applyFilters(data: Plan[], f: Filters): Plan[] {
    let result = data
    if (f.category) {
      const cat = categories.find((c) => c.slug === f.category)
      if (cat) result = result.filter((p) => p.category_id === cat.id)
    }
    if (f.city) result = result.filter((p) => p.city?.toLowerCase().includes(f.city.toLowerCase()))
    if (f.search) result = result.filter((p) => p.title.toLowerCase().includes(f.search.toLowerCase()))
    return result
  }

  const featured = plans[0]
  const rest = plans.slice(1)

  return (
    <div className="flex flex-col min-h-0">
      {/* Geo banner */}
      {geoStatus === "requesting" && (
        <div className="bg-[#f0f3ff] text-[#ff6b52] text-xs text-center py-2 flex items-center justify-center gap-1.5 font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Buscando planes cercanos a ti...
        </div>
      )}
      {geoStatus === "granted" && (
        <div className="bg-[#e8faf8] text-[#006b5f] text-xs text-center py-1.5 flex items-center justify-center gap-1.5 font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          Planes cercanos a ti
        </div>
      )}

      <FilterBar categories={categories} filters={filters} onChange={setFilters} />

      <div className="flex-1 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff8a72, #ff6b52)" }}>
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-3">
            <span className="text-5xl">🗓️</span>
            <p className="font-bold text-[#111c2d] text-lg">No hay planes disponibles</p>
            <p className="text-sm text-gray-400">
              {filters.category || filters.search || filters.city
                ? "Prueba cambiando los filtros"
                : "¡Sé el primero en crear un plan!"}
            </p>
            <button onClick={fetchPlans}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full mt-1"
              style={{ color: "#ff6b52", background: "#ffdad4" }}>
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-6">
            {/* Featured */}
            {featured && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[#111c2d] text-base">Destacado</h2>
                </div>
                <PlanCard plan={featured} isAuthenticated={isAuthenticated} featured />
              </section>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[#111c2d] text-base">
                    {geoStatus === "granted" ? "Cerca de ti" : "Próximos planes"}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">{rest.length} planes</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {rest.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} isAuthenticated={isAuthenticated} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
