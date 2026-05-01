export type Category = {
  id: number
  name: string
  slug: string
  icon: string
  default_image: string
}

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  created_at: string
}

export type Pet = {
  id: string
  owner_id: string
  name: string
  sex: 'male' | 'female'
  age: number | null
  breed: string | null
  photo_url: string | null
  created_at: string
}

export type Plan = {
  id: string
  organizer_id: string
  category_id: number
  title: string
  description: string | null
  photo_url: string | null
  plan_date: string
  location_name: string | null
  city: string | null
  max_attendees: number | null
  is_active: boolean
  created_at: string
  // joins
  categories?: Category
  profiles?: Profile
  attendees_count?: number
  distance_km?: number
}

export type PlanAttendee = {
  id: string
  plan_id: string
  user_id: string
  joined_at: string
  profiles?: Profile
  pets?: Pet[]
}

export type PlanPhoto = {
  id: string
  plan_id: string
  uploaded_by: string | null
  photo_url: string
  created_at: string
  profiles?: Profile
}

export type Filters = {
  category: string
  search: string
  city: string
}
