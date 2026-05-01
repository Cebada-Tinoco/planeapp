"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react"
import type { Category, Filters } from "@/types"

interface FilterBarProps {
  categories: Category[]
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function FilterBar({ categories, filters, onChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange({ ...filters, search: localSearch })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch])

  const hasActiveFilters = filters.category !== "" || filters.city !== ""

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-3">
      {/* Fila buscador */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar planes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-300 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onChange({ ...filters, search: "" }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative p-2.5 rounded-xl transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Panel de filtros expandido */}
      {showFilters && (
        <div className="space-y-3 pb-1">
          {/* Ciudad */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrar por ciudad..."
              value={filters.city}
              onChange={(e) => onChange({ ...filters, city: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-300 transition-colors"
            />
            {filters.city && (
              <button
                onClick={() => onChange({ ...filters, city: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => onChange({ ...filters, category: "" })}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.category === ""
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    category: filters.category === cat.slug ? "" : cat.slug,
                  })
                }
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filters.category === cat.slug
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ ...filters, category: "", city: "" })}
              className="text-xs text-orange-500 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Pills de filtros activos (colapsado) */}
      {!showFilters && hasActiveFilters && (
        <div className="flex gap-2 flex-wrap">
          {filters.category && (
            <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {categories.find((c) => c.slug === filters.category)?.icon}{" "}
              {categories.find((c) => c.slug === filters.category)?.name}
              <button onClick={() => onChange({ ...filters, category: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.city && (
            <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {filters.city}
              <button onClick={() => onChange({ ...filters, city: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
