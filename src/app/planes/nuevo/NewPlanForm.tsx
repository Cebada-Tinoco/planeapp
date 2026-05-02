"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Camera, Loader2, MapPin, Calendar, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/types"

interface NewPlanFormProps {
  categories: Category[]
  userId: string
}

export default function NewPlanForm({ categories, userId }: NewPlanFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [description, setDescription] = useState("")
  const [planDate, setPlanDate] = useState("")
  const [planTime, setPlanTime] = useState("")
  const [locationName, setLocationName] = useState("")
  const [city, setCity] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) { setError("Selecciona una categoría"); return }
    if (!planDate || !planTime) { setError("Selecciona fecha y hora"); return }
    setLoading(true)
    setError("")

    try {
      let photoUrl: string | null = null
      if (photo) {
        const ext = photo.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("plan-photos")
          .upload(fileName, photo, { contentType: photo.type })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from("plan-photos").getPublicUrl(uploadData.path)
        photoUrl = publicUrl
      }

      const dateTime = new Date(`${planDate}T${planTime}`).toISOString()
      const { data: newPlan, error: insertError } = await supabase
        .from("plans")
        .insert({
          organizer_id: userId,
          category_id: categoryId,
          title,
          description: description || null,
          photo_url: photoUrl,
          plan_date: dateTime,
          location_name: locationName || null,
          city: city || null,
          max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await supabase.from("plan_attendees").insert({ plan_id: newPlan.id, user_id: userId })
      router.push(`/planes/${newPlan.id}`)
      router.refresh()
    } catch {
      setError("Error al crear el plan. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div style={{ background: "#f9f9ff" }} className="min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 safe-top sticky top-0 z-10">
        <Link href="/" className="p-1.5 rounded-xl bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-extrabold text-[#111c2d] text-lg">Crear plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6">

        {/* Photo */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">
            Foto del plan <span className="text-gray-400 font-medium">(opcional)</span>
          </label>
          <label className="block w-full h-44 rounded-3xl overflow-hidden cursor-pointer relative border-2 border-dashed border-gray-200 hover:border-[#ff6b52] transition-colors"
            style={{ background: "#f0f3ff" }}>
            {photoPreview ? (
              <Image src={photoPreview} alt="" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "#ffdad4" }}>
                  <Camera className="w-6 h-6" style={{ color: "#ff6b52" }} />
                </div>
                <span className="text-sm font-semibold">Toca para subir foto</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-3">Categoría *</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all font-semibold text-xs ${
                  categoryId === cat.id ? "text-white shadow-md" : "text-gray-600"
                }`}
                style={categoryId === cat.id
                  ? { background: "linear-gradient(135deg, #ff8a72, #ff6b52)", boxShadow: "0 4px 12px rgba(255,107,82,0.35)" }
                  : { background: "#f0f3ff" }}>
                <span className="text-xl">{cat.icon}</span>
                <span className="truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">Título del plan *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Ruta con perros por el parque" required maxLength={80}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
          <p className="text-xs text-gray-400 mt-1 text-right font-medium">{title.length}/80</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos los detalles del plan..." rows={3} maxLength={500}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all resize-none font-medium" />
          <p className="text-xs text-gray-400 mt-1 text-right font-medium">{description.length}/500</p>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">
            <Calendar className="w-4 h-4 inline mr-1.5 text-[#ff6b52]" />
            Fecha y hora *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} required
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
            <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} required
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">
            <MapPin className="w-4 h-4 inline mr-1.5 text-[#ff6b52]" />
            Ubicación
          </label>
          <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)}
            placeholder="Nombre del lugar (ej: Parque del Retiro)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all mb-2 font-medium" />
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
        </div>

        {/* Max attendees */}
        <div>
          <label className="block text-sm font-bold text-[#111c2d] mb-2">
            <Users className="w-4 h-4 inline mr-1.5 text-[#ff6b52]" />
            Máximo de asistentes <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-3">
            <input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Sin límite" min="2" max="1000"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff6b52]/30 focus:border-[#ff6b52] transition-all font-medium" />
            {maxAttendees && (
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => setMaxAttendees(String(Math.max(2, parseInt(maxAttendees) - 1)))}
                  className="w-10 h-10 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#ff6b52] font-bold text-lg">
                  −
                </button>
                <span className="font-bold text-[#111c2d] text-base w-8 text-center">{maxAttendees}</span>
                <button type="button"
                  onClick={() => setMaxAttendees(String(Math.min(1000, parseInt(maxAttendees) + 1)))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: "#ff6b52" }}>
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-semibold px-3 py-2 rounded-xl" style={{ background: "#ffdad6" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base active:scale-[0.98] transition-transform disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #ff8a72 0%, #ff6b52 60%, #ae311e 100%)", boxShadow: "0 8px 24px rgba(255,107,82,0.40)" }}>
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Publicando..." : "Publicar plan →"}
        </button>
      </form>
    </div>
  )
}
