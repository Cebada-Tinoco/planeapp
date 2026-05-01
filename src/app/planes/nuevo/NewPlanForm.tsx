"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Camera, Loader2, MapPin, Calendar, Users, AlignLeft, Tag } from "lucide-react"
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

      // Subir foto si existe
      if (photo) {
        const ext = photo.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("plan-photos")
          .upload(fileName, photo, { contentType: photo.type })

        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage
          .from("plan-photos")
          .getPublicUrl(uploadData.path)
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

      // El organizador se apunta automáticamente
      await supabase
        .from("plan_attendees")
        .insert({ plan_id: newPlan.id, user_id: userId })

      router.push(`/planes/${newPlan.id}`)
      router.refresh()
    } catch (err) {
      setError("Error al crear el plan. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  const selectedCategory = categories.find((c) => c.id === categoryId)

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 safe-top">
        <Link href="/" className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-900 text-lg">Crear plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        {/* Foto del plan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1.5" />
            Foto del plan <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <label className="block w-full h-40 rounded-2xl overflow-hidden cursor-pointer relative bg-gray-100 border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors">
            {photoPreview ? (
              <Image src={photoPreview} alt="" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Camera className="w-8 h-8" />
                <span className="text-sm">Toca para subir foto</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </label>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título del plan *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Ruta con perros por el parque"
            required
            maxLength={80}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/80</p>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1.5" />
            Categoría *
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  categoryId === cat.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <AlignLeft className="w-4 h-4 inline mr-1.5" />
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos los detalles del plan..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
        </div>

        {/* Fecha y hora */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Fecha y hora *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <input
              type="time"
              value={planTime}
              onChange={(e) => setPlanTime(e.target.value)}
              required
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1.5" />
            Ubicación
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Nombre del lugar (ej: Parque del Retiro)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300 mb-2"
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Máximo asistentes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1.5" />
            Máximo de asistentes <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            placeholder="Sin límite"
            min="2"
            max="1000"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Creando plan..." : "Publicar plan"}
        </button>
      </form>
    </div>
  )
}
