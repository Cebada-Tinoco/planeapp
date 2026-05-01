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

  // Solicitar geolocalización al entrar
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
        // Buscar por proximidad usando la función SQL
        const { data } = await supabase.rpc("get_plans_near", {
          lat: userCoords.lat,
          lng: userCoords.lng,
          radius_km: 100,
        })
        if (data) {
          // Enriquecer con categoría y perfil del organizador
          const planIds = data.map((p: Plan) => p.id)
          const { data: fullPlans } = await supabase
            .from("plans")
            .select(`*, categories(*), profiles(*)`)
            .in("id", planIds)
            .eq("is_active", true)
            .gt("plan_date", new Date().toISOString())

          if (fullPlans) {
            // Mantener orden por distancia
            const ordered = data.map((p: Plan) => {
              const full = fullPlans.find((fp: Plan) => fp.id === p.id)
              return { ...full, distance_km: p.distance_km, attendees_count: p.attendees_count }
            })
            setPlans(applyFilters(ordered, filters))
          }
        }
      } else {
        // Sin geo: orden cronológico
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
        if (filters.city) {
          query = query.ilike("city", `%${filters.city}%`)
        }
        if (filters.search) {
          query = query.ilike("title", `%${filters.search}%`)
        }

        const { data } = await query
        if (data) setPlans(data)
      }
    } finally {
      setLoading(false)
    }
  }, [userCoords, geoStatus, filters])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

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

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Banner geolocalización */}
      {geoStatus === "requesting" && (
        <div className="bg-orange-50 text-orange-700 text-xs text-center py-2 flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Obteniendo tu ubicación para mostrarte planes cercanos...
        </div>
      )}
      {geoStatus === "granted" && (
        <div className="bg-green-50 text-green-700 text-xs text-center py-1.5 flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Mostrando planes cercanos a ti
        </div>
      )}

      {/* Filtros */}
      <FilterBar categories={categories} filters={filters} onChange={handleFiltersChange} />

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-3">
            <span className="text-5xl">🗓️</span>
            <p className="font-semibold text-gray-700">No hay planes disponibles</p>
            <p className="text-sm text-gray-400">
              {filters.category || filters.search || filters.city
                ? "Prueba cambiando los filtros"
                : "¡Sé el primero en crear un plan!"}
            </p>
            <button
              onClick={fetchPlans}
              className="flex items-center gap-1.5 text-orange-500 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
