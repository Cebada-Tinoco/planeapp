"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Camera, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function NewPetPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [sex, setSex] = useState<"male" | "female">("male")
  const [age, setAge] = useState("")
  const [breed, setBreed] = useState("")
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
    setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      let photoUrl: string | null = null
      if (photo) {
        const ext = photo.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${ext}`
        const { data, error: uploadError } = await supabase.storage
          .from("pet-photos")
          .upload(fileName, photo, { contentType: photo.type })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(data.path)
        photoUrl = publicUrl
      }

      const { error: insertError } = await supabase
        .from("pets")
        .insert({
          owner_id: user.id,
          name,
          sex,
          age: age ? parseInt(age) : null,
          breed: breed || null,
          photo_url: photoUrl,
        })

      if (insertError) throw insertError
      router.push("/perfil")
      router.refresh()
    } catch {
      setError("Error al guardar la mascota. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 safe-top">
        <Link href="/perfil" className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-900 text-lg">Añadir mascota</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 pb-10">
        {/* Foto */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-orange-100 border-4 border-white shadow-md">
              {photoPreview ? (
                <Image src={photoPreview} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-orange-300" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </label>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de tu mascota"
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Sexo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sexo *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSex("male")}
              className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                sex === "male" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              ♂ Macho
            </button>
            <button
              type="button"
              onClick={() => setSex("female")}
              className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                sex === "female" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              ♀ Hembra
            </button>
          </div>
        </div>

        {/* Edad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Edad (años) <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Edad"
            min="0"
            max="30"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Raza */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Raza <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Ej: Golden Retriever"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Guardar mascota
        </button>
      </form>
    </div>
  )
}
