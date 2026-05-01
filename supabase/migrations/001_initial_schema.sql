-- ============================================================
-- PlaneApp - Schema inicial
-- ============================================================

-- Extensión para geolocalización
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- CATEGORÍAS
-- ============================================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  default_image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, icon, default_image) VALUES
  ('Gastronomía',  'gastronomia',  '🍽️',  '/images/categorias/gastronomia.jpg'),
  ('Animales',     'animales',     '🐾',  '/images/categorias/animales.jpg'),
  ('Deportes',     'deportes',     '⚽',  '/images/categorias/deportes.jpg'),
  ('Cultura',      'cultura',      '🎭',  '/images/categorias/cultura.jpg'),
  ('Música',       'musica',       '🎵',  '/images/categorias/musica.jpg'),
  ('Naturaleza',   'naturaleza',   '🌿',  '/images/categorias/naturaleza.jpg'),
  ('Viajes',       'viajes',       '✈️',  '/images/categorias/viajes.jpg'),
  ('Otros',        'otros',        '🎯',  '/images/categorias/otros.jpg');

-- ============================================================
-- PERFILES (extiende auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- MASCOTAS
-- ============================================================
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female')) NOT NULL,
  age INTEGER,
  breed TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLANES
-- ============================================================
CREATE TABLE plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id INTEGER REFERENCES categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  plan_date TIMESTAMPTZ NOT NULL,
  location_name TEXT,
  location GEOGRAPHY(POINT, 4326),
  city TEXT,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para búsquedas por proximidad
CREATE INDEX plans_location_idx ON plans USING GIST (location);
CREATE INDEX plans_date_idx ON plans (plan_date);
CREATE INDEX plans_city_idx ON plans (city);

-- ============================================================
-- ASISTENTES
-- ============================================================
CREATE TABLE plan_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

-- ============================================================
-- FOTOS DE PLANES
-- ============================================================
CREATE TABLE plan_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_photos ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Perfiles visibles para todos" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuario edita su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pets
CREATE POLICY "Mascotas visibles para todos" ON pets FOR SELECT USING (true);
CREATE POLICY "Usuario gestiona sus mascotas" ON pets FOR ALL USING (auth.uid() = owner_id);

-- Plans
CREATE POLICY "Planes visibles para todos" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "Usuario autenticado puede crear planes" ON plans FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizador puede editar su plan" ON plans FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizador puede borrar su plan" ON plans FOR DELETE USING (auth.uid() = organizer_id);

-- Plan attendees
CREATE POLICY "Asistentes visibles para todos" ON plan_attendees FOR SELECT USING (true);
CREATE POLICY "Usuario puede unirse a planes" ON plan_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuario puede salir de planes" ON plan_attendees FOR DELETE USING (auth.uid() = user_id);

-- Plan photos
CREATE POLICY "Fotos visibles para todos" ON plan_photos FOR SELECT USING (true);
CREATE POLICY "Asistente puede subir fotos" ON plan_photos FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Autor puede borrar su foto" ON plan_photos FOR DELETE USING (auth.uid() = uploaded_by);

-- ============================================================
-- FUNCIÓN PARA BUSCAR PLANES POR PROXIMIDAD
-- ============================================================
CREATE OR REPLACE FUNCTION get_plans_near(
  lat FLOAT,
  lng FLOAT,
  radius_km FLOAT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  photo_url TEXT,
  plan_date TIMESTAMPTZ,
  location_name TEXT,
  city TEXT,
  distance_km FLOAT,
  category_id INTEGER,
  organizer_id UUID,
  max_attendees INTEGER,
  attendees_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.photo_url,
    p.plan_date,
    p.location_name,
    p.city,
    ROUND((ST_Distance(p.location::geography, ST_MakePoint(lng, lat)::geography) / 1000)::numeric, 1)::float AS distance_km,
    p.category_id,
    p.organizer_id,
    p.max_attendees,
    COUNT(pa.id) AS attendees_count,
    p.created_at
  FROM plans p
  LEFT JOIN plan_attendees pa ON pa.plan_id = p.id
  WHERE
    p.is_active = true
    AND p.plan_date > NOW()
    AND ST_DWithin(
      p.location::geography,
      ST_MakePoint(lng, lat)::geography,
      radius_km * 1000
    )
  GROUP BY p.id
  ORDER BY p.plan_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('plan-photos', 'plan-photos', true),
  ('profile-avatars', 'profile-avatars', true),
  ('pet-photos', 'pet-photos', true)
ON CONFLICT DO NOTHING;

-- Políticas de storage
CREATE POLICY "Fotos de planes públicas" ON storage.objects FOR SELECT USING (bucket_id = 'plan-photos');
CREATE POLICY "Usuarios autenticados pueden subir fotos de planes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'plan-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Avatares públicos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "Usuarios suben su avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Fotos mascotas públicas" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Usuarios suben fotos mascotas" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');
