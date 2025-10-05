# 📦 Guardado y Carga de Módulos - Instrucciones

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de guardado y carga de módulos para misiones ARKHA.

---

## 🔧 Paso 1: Ejecutar Migración en Supabase

**IMPORTANTE**: Debes ejecutar esta migración SQL en tu base de datos Supabase antes de usar el sistema de guardado.

### Ubicación del archivo:
```
/docs/migrations/add_module_config_id.sql
```

### Cómo ejecutar:
1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `add_module_config_id.sql`
5. Haz clic en **Run**

### Contenido de la migración:
```sql
-- Migration: Add module_config_id field to modules table
-- Date: 2025-10-05
-- Description: Adds a field to track which module configuration from arkha_modules.json is used

-- Add the new column
ALTER TABLE modules 
ADD COLUMN module_config_id TEXT NOT NULL DEFAULT '';

-- Add comment to document the field
COMMENT ON COLUMN modules.module_config_id IS 'ID of the module configuration from arkha_modules.json';

-- Create index for filtering by module config (optional, for performance)
CREATE INDEX idx_modules_config_id ON modules(module_config_id);
```

---

## 📝 Cómo Funciona

### 1. **Guardar una Misión** 💾
1. Abre una misión en el visor 3D (debe tener `missionId` en la URL)
2. Mueve, rota o escala los módulos como desees
3. Haz clic en el botón **"💾 Save Mission"** (parte inferior de la pantalla)
4. El sistema:
   - Captura TODOS los módulos de la escena
   - Guarda sus posiciones, rotaciones y escalas exactas
   - Elimina los módulos antiguos de esa misión (si existen)
   - Inserta los nuevos módulos en la base de datos

### 2. **Cargar una Misión Guardada** 📂
1. Navega a una misión existente con: `/mission-builder/design?missionId=XXXXX`
2. El sistema:
   - Detecta el `missionId` en la URL
   - Carga automáticamente los módulos guardados desde Supabase
   - Renderiza cada módulo en su posición exacta

### 3. **Crear Nueva Misión** ✨
1. Cuando creas una nueva misión desde `/mission-builder/new`
2. URL resultante: `/mission-builder/design?missionId=XXX&passengers=10&duration=90&terrain=moon&isScientific=true`
3. El sistema detecta los parámetros `passengers`, `duration`, `terrain`
4. El sistema:
   - Genera un layout inicial usando el **mock service** (ejemplo: `example1.json`)
   - Los módulos se renderizan con las posiciones iniciales del mockup
   - Cuando guardas por primera vez, se guardan en la base de datos
   - En la siguiente carga (sin parámetros extra), se cargan desde la DB

---

## 🗂️ Archivos Modificados/Creados

### Nuevos Archivos:
- ✅ `/application/services/ModuleService.ts` - Servicio para gestionar guardado y carga
- ✅ `/docs/migrations/add_module_config_id.sql` - Migración SQL
- ✅ `/docs/GUARDADO_MODULOS_INSTRUCCIONES.md` - Este documento

### Archivos Modificados:
- ✅ `/domain/entities/Module.ts` - Agregado campo `moduleConfigId`
- ✅ `/infrastructure/repositories/SupabaseModuleRepository.ts` - Agregado método `saveModules()` y actualizado `findByMissionId()`
- ✅ `/components/ModuleViewer3D.tsx` - Implementado guardado y carga de módulos

---

## 🔍 Estructura de Datos

### Módulo en la Base de Datos:
```typescript
{
  id: string;                    // UUID generado por Supabase
  name: string;                  // "Module 1", "Module 2", etc.
  type: string;                  // 'habitat', 'laboratory', etc.
  size: string;                  // 'small', 'medium', 'large'
  module_config_id: string;      // ⭐ ID del módulo en arkha_modules.json
  position: { x, y, z };         // Posición exacta en la escena 3D
  rotation: { x, y, z };         // Rotación en radianes
  scale: { x, y, z };            // Escala del objeto
  mission_id: string;            // ID de la misión a la que pertenece
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## 🎯 Flujo de Guardado

```
Usuario mueve módulos
        ↓
Click en "💾 Save Mission"
        ↓
handleSaveMission() captura todos los objetos de la escena
        ↓
Filtra solo los que tienen userData.id y userData.type
        ↓
ModuleService.saveModules(missionId, modules)
        ↓
SupabaseModuleRepository.saveModules()
        ↓
1. DELETE todos los módulos de esa misión
2. INSERT nuevos módulos con posiciones actuales
        ↓
✅ "Mission saved successfully! X modules saved."
```

---

## 🎯 Flujo de Carga

### **Nueva Misión (Primera Vez)**
```
Usuario crea misión en /mission-builder/new
        ↓
URL: /mission-builder/design?missionId=XXX&passengers=10&duration=90&terrain=moon
        ↓
ModuleViewer3D detecta parámetros passengers, duration, terrain
        ↓
MissionLayoutService.generateMissionLayout() → Mockup (example1.json)
        ↓
Renderiza módulos según mockup
        ↓
Usuario mueve/modifica módulos
        ↓
Click "💾 Save Mission" → Guardar en DB
        ↓
✅ Módulos guardados en base de datos
```

### **Misión Existente (Carga desde DB)**
```
Usuario navega a /mission-builder/design?missionId=XXXXX
        ↓
ModuleViewer3D detecta solo missionId (sin otros parámetros)
        ↓
ModuleService.loadModules(missionId)
        ↓
SupabaseModuleRepository.findByMissionId(missionId)
        ↓
Retorna array de módulos guardados
        ↓
Renderiza cada módulo en su posición guardada
        ↓
✅ Escena 3D cargada con módulos exactos desde DB
```

---

## 🧪 Cómo Probar

### Test 1: Guardar Módulos
1. Crea una nueva misión
2. Mueve algunos módulos a diferentes posiciones
3. Haz clic en "💾 Save Mission"
4. Verifica en consola: `✅ ModuleService: Modules saved successfully`
5. Verifica en Supabase: La tabla `modules` debe tener los nuevos registros

### Test 2: Cargar Módulos
1. Recarga la página (o navega a otra página y vuelve)
2. Verifica en consola: `✅ Loaded saved modules: [...]`
3. Los módulos deben aparecer en las MISMAS posiciones donde los dejaste

### Test 3: Actualizar Posiciones
1. Mueve los módulos a nuevas posiciones
2. Guarda de nuevo
3. Recarga la página
4. Los módulos deben aparecer en las NUEVAS posiciones

---

## 🚨 Posibles Problemas y Soluciones

### Problema: "No mission ID found"
**Solución**: Asegúrate de que la URL tenga `?missionId=XXXXX`

### Problema: Módulos no aparecen después de guardar
**Solución**: 
1. Verifica que ejecutaste la migración SQL
2. Revisa la consola para errores de Supabase
3. Verifica que el usuario tenga permisos en la tabla `modules`

### Problema: "Failed to save modules"
**Solución**:
1. Revisa las políticas RLS (Row Level Security) en Supabase
2. Asegúrate de que el usuario autenticado pueda INSERT/DELETE en `modules`

---

## 🎉 ¡Listo!

El sistema de guardado y carga de módulos está completamente implementado. 

**Próximos pasos sugeridos:**
- Agregar un indicador visual cuando hay cambios sin guardar
- Implementar "Undo/Redo" para cambios
- Agregar confirmación antes de sobrescribir módulos guardados
- Implementar guardado automático cada X minutos

