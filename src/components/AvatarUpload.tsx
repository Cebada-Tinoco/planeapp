"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Props {
  userId: string
  avatarUrl: string | null
  initials: string
}

export default function AvatarUpload({ userId, avatarUrl, initials }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const ext = file.name.split(".").pop()
    const fileName = `${userId}.${ext}`

    const { data, error } = await supabase.storage
      .from("profile-avatars")
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (error) {
      setPreview(avatarUrl)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(data.path)

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)

    setUploading(false)
    startTransition(() => router.refresh())
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 group"
    >
      {preview ? (
        <Image src={preview} alt="" fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading || isPending ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-white" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </button>
  )
}
