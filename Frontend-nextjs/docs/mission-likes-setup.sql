-- Script para crear la tabla mission_likes y sus políticas RLS

-- Crear la tabla mission_likes si no existe
CREATE TABLE IF NOT EXISTS public.mission_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id) -- Evitar likes duplicados
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_mission_likes_user_id ON mission_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_likes_mission_id ON mission_likes(mission_id);

-- Habilitar RLS
ALTER TABLE mission_likes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view all likes" ON mission_likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON mission_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON mission_likes;

-- Crear políticas RLS para mission_likes
CREATE POLICY "Users can view all likes" ON mission_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON mission_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON mission_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Función para obtener el conteo de likes de una misión
CREATE OR REPLACE FUNCTION get_mission_likes_count(mission_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM mission_likes 
    WHERE mission_id = mission_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario le dio like a una misión
CREATE OR REPLACE FUNCTION user_liked_mission(mission_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS(
      SELECT 1 
      FROM mission_likes 
      WHERE mission_id = mission_uuid AND user_id = user_uuid
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
