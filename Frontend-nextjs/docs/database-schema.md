# ARKHA Database Schema

Este documento describe el esquema de la base de datos de ARKHA en Supabase.

## Tablas

### `auth.users` (Supabase Auth)
**Descripción**: Tabla automática de Supabase que maneja la autenticación de usuarios. No necesitamos crear una tabla `users` separada.

**Campos principales**:
- `id` (UUID, PK): Identificador único del usuario
- `email` (TEXT, UNIQUE, NOT NULL): Email del usuario
- `user_metadata` (JSONB): Metadatos del usuario (nombre, avatar, etc.)
- `created_at` (TIMESTAMP): Fecha de creación del usuario

**Relaciones**:
- Las tablas `missions` y `mission_likes` referencian `auth.users(id)`

### `missions`
Almacena las misiones espaciales creadas por los usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único de la misión |
| `title` | TEXT | NOT NULL | Título de la misión |
| `description` | TEXT | NULL | Descripción de la misión |
| `destination` | TEXT | NOT NULL, CHECK (destination IN ('moon', 'mars')) | Destino de la misión |
| `passengers` | INTEGER | NOT NULL | Número de pasajeros |
| `duration` | INTEGER | NOT NULL | Duración en días |
| `is_public` | BOOLEAN | DEFAULT FALSE | Si la misión es pública |
| `status` | TEXT | DEFAULT 'draft', CHECK (status IN ('draft', 'published', 'archived')) | Estado de la misión |
| `user_id` | UUID | FOREIGN KEY → auth.users(id), ON DELETE CASCADE | ID del usuario propietario |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de última actualización |

### `modules`
Almacena los módulos espaciales de cada misión.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único del módulo |
| `name` | TEXT | NOT NULL | Nombre del módulo |
| `type` | TEXT | NOT NULL, CHECK (type IN ('habitat', 'laboratory', 'storage', 'dormitory', 'recreation')) | Tipo de módulo |
| `size` | TEXT | NOT NULL, CHECK (size IN ('small', 'medium', 'large')) | Tamaño del módulo |
| `position` | JSONB | NOT NULL | Posición 3D: `{x: number, y: number, z: number}` |
| `rotation` | JSONB | NOT NULL | Rotación 3D: `{x: number, y: number, z: number}` |
| `scale` | JSONB | NOT NULL | Escala 3D: `{x: number, y: number, z: number}` |
| `model_url` | TEXT | NULL | URL del modelo 3D |
| `is_radioactive` | BOOLEAN | DEFAULT FALSE | Si el módulo es radioactivo |
| `mission_id` | UUID | FOREIGN KEY → missions(id), ON DELETE CASCADE | ID de la misión |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de última actualización |

### `mission_likes`
Almacena los likes que los usuarios dan a las misiones.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único del like |
| `user_id` | UUID | FOREIGN KEY → auth.users(id), ON DELETE CASCADE | ID del usuario que dio like |
| `mission_id` | UUID | FOREIGN KEY → missions(id), ON DELETE CASCADE | ID de la misión |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha del like |

## Índices

```sql
-- Índices para mejorar el rendimiento
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_public ON missions(is_public, status);
CREATE INDEX idx_modules_mission_id ON modules(mission_id);
CREATE INDEX idx_mission_likes_user_id ON mission_likes(user_id);
CREATE INDEX idx_mission_likes_mission_id ON mission_likes(mission_id);
```

## Políticas de Seguridad (RLS)

```sql
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
```

## Triggers

```sql
-- Trigger para actualizar updated_at en missions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_missions_updated_at 
  BEFORE UPDATE ON missions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
  BEFORE UPDATE ON modules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Notas Importantes

1. **Autenticación**: Usamos `auth.users` de Supabase en lugar de crear una tabla `users` separada
2. **Seguridad**: Todas las tablas tienen RLS habilitado para proteger los datos
3. **Rendimiento**: Los índices están optimizados para las consultas más comunes
4. **Integridad**: Las foreign keys aseguran la consistencia de los datos
5. **Escalabilidad**: El esquema está diseñado para manejar grandes volúmenes de datos