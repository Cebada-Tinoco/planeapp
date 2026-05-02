"use client"

import { useState, useEffect } from "react"
import { Search, X, MapPin } from "lucide-react"
import type { Category, Filters } from "@/types"

interface FilterBarProps {
  categories: Category[]
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function FilterBar({ categories, filters, onChange }: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const [showCity, setShowCity] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) onChange({ ...filters, search: localSearch })
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch])

  return (
    <div className="bg-white border-b border-gray-100 space-y-3 px-4 pt-3 pb-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar planes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[#f0f3ff] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 transition-all font-medium text-[#111c2d] placeholder:text-gray-400"
          />
          {localSearch && (
            <button onClick={() => { setLocalSearch(""); onChange({ ...filters, search: "" }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowCity(!showCity)}
          className={`p-2.5 rounded-2xl transition-colors ${
            showCity || filters.city ? "text-white" : "bg-[#f0f3ff] text-gray-500"
          }`}
          style={showCity || filters.city ? { background: "#ff6b52" } : {}}
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {/* City filter */}
      {showCity && (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar por ciudad..."
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="w-full pl-9 pr-9 py-2.5 bg-[#f0f3ff] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 font-medium text-[#111c2d] placeholder:text-gray-400"
          />
          {filters.city && (
            <button onClick={() => onChange({ ...filters, city: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Category pills — always visible */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => onChange({ ...filters, category: "" })}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            filters.category === ""
              ? "text-white shadow-sm shadow-[#ff6b52]/30"
              : "bg-[#f0f3ff] text-gray-600"
          }`}
          style={filters.category === "" ? { background: "#ff6b52" } : {}}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange({ ...filters, category: filters.category === cat.slug ? "" : cat.slug })}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              filters.category === cat.slug
                ? "text-white shadow-sm shadow-[#ff6b52]/30"
                : "bg-[#f0f3ff] text-gray-600"
            }`}
            style={filters.category === cat.slug ? { background: "#ff6b52" } : {}}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
