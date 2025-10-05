-- Crear una vista pública para acceder a información básica de usuarios
-- Las vistas no necesitan RLS policies, solo permisos

CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'avatar' as avatar,
  created_at
FROM auth.users;

-- Dar permisos de lectura a todos los usuarios autenticados
GRANT SELECT ON public.user_profiles TO authenticated;
