import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NewPlanForm from "./NewPlanForm"

export default async function NewPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("id")

  return (
    <div className="min-h-screen bg-gray-50">
      <NewPlanForm categories={categories ?? []} userId={user.id} />
    </div>
  )
}
