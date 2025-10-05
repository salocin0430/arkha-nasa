-- =============================================
-- ARKHA DATABASE SETUP
-- =============================================
-- Script para configurar la base de datos en Supabase
-- Los usuarios se manejan automáticamente en auth.users

-- =============================================
-- TABLAS
-- =============================================

-- Los usuarios se manejan automáticamente en auth.users
-- No necesitamos tabla users separada

-- Tabla de misiones
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL CHECK (destination IN ('moon', 'mars')),
    passengers INTEGER NOT NULL CHECK (passengers > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    is_public BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de módulos
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('habitat', 'laboratory', 'storage', 'dormitory', 'recreation')),
    size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
    position JSONB NOT NULL,
    rotation JSONB NOT NULL,
    scale JSONB NOT NULL,
    model_url TEXT,
    is_radioactive BOOLEAN DEFAULT FALSE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de likes de misiones
CREATE TABLE mission_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mission_id)
);

-- =============================================
-- ÍNDICES
-- =============================================

-- Índices para mejorar el rendimiento
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_public ON missions(is_public, status);
CREATE INDEX idx_missions_destination ON missions(destination);
CREATE INDEX idx_modules_mission_id ON modules(mission_id);
CREATE INDEX idx_modules_type ON modules(type);
CREATE INDEX idx_mission_likes_user_id ON mission_likes(user_id);
CREATE INDEX idx_mission_likes_mission_id ON mission_likes(mission_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para missions
CREATE POLICY "Users can view their own missions" ON missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public missions" ON missions
  FOR SELECT USING (is_public = true AND status = 'published');

CREATE POLICY "Users can create missions" ON missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" ON missions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions" ON missions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para modules
CREATE POLICY "Users can view modules of their missions" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = modules.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view modules of public missions" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = modules.mission_id 
      AND missions.is_public = true 
      AND missions.status = 'published'
    )
  );

CREATE POLICY "Users can create modules for their missions" ON modules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = modules.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modules of their missions" ON modules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = modules.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modules of their missions" ON modules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = modules.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

-- Políticas para mission_likes
CREATE POLICY "Users can view all likes" ON mission_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON mission_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON mission_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_missions_updated_at 
  BEFORE UPDATE ON missions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
  BEFORE UPDATE ON modules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTARIOS
-- =============================================

COMMENT ON TABLE missions IS 'Misiones espaciales creadas por los usuarios';
COMMENT ON TABLE modules IS 'Módulos espaciales de cada misión';
COMMENT ON TABLE mission_likes IS 'Likes que los usuarios dan a las misiones';

COMMENT ON COLUMN missions.destination IS 'Destino de la misión: moon o mars';
COMMENT ON COLUMN missions.status IS 'Estado de la misión: draft, published o archived';
COMMENT ON COLUMN modules.type IS 'Tipo de módulo: habitat, laboratory, storage, dormitory o recreation';
COMMENT ON COLUMN modules.size IS 'Tamaño del módulo: small, medium o large';
COMMENT ON COLUMN modules.position IS 'Posición 3D del módulo en formato JSON';
COMMENT ON COLUMN modules.rotation IS 'Rotación 3D del módulo en formato JSON';
COMMENT ON COLUMN modules.scale IS 'Escala 3D del módulo en formato JSON';