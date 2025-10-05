# 🚀 Integración con Microservicio de Python

## ✅ Estado: INTEGRADO

El frontend de Next.js ahora está completamente integrado con el microservicio Python de generación de layouts.

---

## 🔧 Configuración

### Variables de Entorno

Agregar a tu `.env.local`:

```bash
# Module Manager Microservice
NEXT_PUBLIC_MODULE_MANAGER_API_URL=https://api-module-manager.laoarchitects.com
```

Si no se especifica, usará por defecto: `https://api-module-manager.laoarchitects.com`

---

## 📝 Cómo Funciona

### 1. **Nueva Misión (Con Parámetros)**
```
URL: /mission-builder/design?missionId=XXX&passengers=10&duration=90&terrain=moon&isScientific=false

Flujo:
1. Detecta parámetros: passengers, duration, terrain
2. Llama al microservicio Python:
   POST https://api-module-manager.laoarchitects.com/api/v1/generate-layout
   Body: { passengers, duration, terrain, isScientific }
3. Recibe layout con 123 módulos
4. Renderiza módulos en escena 3D
5. Usuario puede guardar con "💾 Save Mission"
```

### 2. **Misión Existente SIN Módulos Guardados**
```
URL: /mission-builder/design?missionId=XXX

Flujo:
1. Detecta solo missionId (sin otros parámetros)
2. Intenta cargar módulos desde Supabase
3. Si NO hay módulos guardados:
   a. Carga parámetros de la misión desde DB
   b. Llama al microservicio Python
   c. Renderiza módulos generados
4. Si SÍ hay módulos guardados:
   a. Renderiza módulos desde DB
```

### 3. **Misión Existente CON Módulos Guardados**
```
URL: /mission-builder/design?missionId=XXX

Flujo:
1. Carga módulos desde Supabase
2. Renderiza módulos en sus posiciones guardadas
3. No llama al microservicio
```

---

## 🔄 Mockup vs Microservicio

### Activar Mockup (Para Testing Local)

Editar `src/services/MissionLayoutService.ts`:

```typescript
class MissionLayoutService {
  private static instance: MissionLayoutService;
  private useMockup: boolean = true; // ← Cambiar a true
  
  // ...
}
```

Con `useMockup = true`:
- ✅ Usa `example1.json` local
- ✅ No llama al microservicio
- ✅ Útil para desarrollo sin red

Con `useMockup = false` (DEFAULT):
- ✅ Llama al microservicio Python
- ✅ Si falla, fallback automático a `example1.json`
- ✅ Logs completos en consola

---

## 🌐 Endpoint del Microservicio

### Request
```bash
curl -X 'POST' \
  'https://api-module-manager.laoarchitects.com/api/v1/generate-layout' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "passengers": 10,
  "duration": 90,
  "terrain": "moon",
  "isScientific": false
}'
```

### Response (igual a `example1.json`)
```json
{
  "parameters": {
    "passengers": 30,
    "duration": 500,
    "terrain": "moon",
    "isScientific": false
  },
  "totalModules": 123,
  "modules": [
    {
      "id": "base_l1_v1",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    // ... más módulos
  ],
  "metadata": {
    "generatedAt": "2025-10-05T10:36:21.858048Z",
    "algorithmVersion": "v3.0.0",
    "estimatedCost": 430500,
    "currency": "ARKHA",
    "totalArkas": 6
  }
}
```

---

## 📊 Logs en Consola

### Cuando llama al microservicio:
```
🚀 MissionLayoutService: Generating layout with params: {...}
🌐 Calling microservice: https://api-module-manager.laoarchitects.com/api/v1/generate-layout
✅ Microservice response received: { totalModules: 123, modules: 123 }
✅ Generated new mission layout: {...}
```

### Cuando usa mockup:
```
🚀 MissionLayoutService: Generating layout with params: {...}
📦 Using MOCKUP from example1.json
✅ Generated new mission layout: {...}
```

### Cuando hay error (fallback automático):
```
🚀 MissionLayoutService: Generating layout with params: {...}
🌐 Calling microservice: https://api-module-manager.laoarchitects.com/api/v1/generate-layout
❌ Error calling microservice, falling back to mockup: Error: ...
✅ Generated new mission layout: {...} (from mockup)
```

---

## 🧪 Testing

### Test 1: Nueva Misión con Microservicio
1. Ir a `/mission-builder/new`
2. Llenar formulario: 10 pasajeros, 90 días, Luna, NO científica
3. Click "Create Mission"
4. Abrir consola del navegador
5. Buscar: `🌐 Calling microservice:`
6. Verificar: `✅ Microservice response received:`
7. Ver módulos renderizados en 3D

### Test 2: Misión Existente sin Módulos
1. Crear una misión nueva (Test 1)
2. NO guardar módulos (no click en "💾 Save Mission")
3. Cerrar y volver a abrir la misión
4. Verificar en consola: `⚠️ No saved modules found, generating layout from microservice...`
5. Microservicio se llama de nuevo

### Test 3: Misión Guardada con Módulos
1. Crear misión y mover módulos
2. Click "💾 Save Mission"
3. Cerrar y volver a abrir
4. Verificar: `✅ Loaded saved modules: [...]`
5. Microservicio NO se llama
6. Módulos aparecen en posiciones guardadas

### Test 4: Fallback a Mockup (Simular Fallo)
1. Editar `MissionLayoutService.ts`
2. Cambiar URL a inválida: `const MICROSERVICE_URL = 'https://invalid-url.com';`
3. Crear nueva misión
4. Verificar en consola: `❌ Error calling microservice, falling back to mockup:`
5. Módulos se cargan desde `example1.json`

---

## 🔧 Troubleshooting

### Error: "Failed to fetch"
**Causa**: CORS o microservicio no accesible
**Solución**: 
- Verificar que el microservicio esté running
- Verificar CORS en `arkha_ms_module_manager/main.py`
- Usar fallback automático a mockup

### Error: "Microservice responded with status: 500"
**Causa**: Error interno en el microservicio Python
**Solución**:
- Revisar logs del contenedor Docker
- Verificar `Fase1.py`, `Fase2.py`, `Fase3.py`
- Usar fallback automático a mockup

### Módulos no se cargan después de guardar
**Causa**: Migración SQL no ejecutada
**Solución**:
- Ejecutar `docs/migrations/add_module_config_id.sql` en Supabase

---

## 📁 Archivos Modificados

### Frontend (Next.js)
- ✅ `src/services/MissionLayoutService.ts` - Integración con microservicio
- ✅ `src/components/ModuleViewer3D.tsx` - Lógica de carga condicional
- ✅ `docs/MICROSERVICE_INTEGRATION.md` - Esta documentación

### Backend (Python)
- ✅ `arkha_ms_module_manager/main.py` - Endpoint del microservicio
- ✅ `arkha_ms_module_manager/requirements.txt` - Agregado `numpy`
- ✅ `arkha_ms_module_manager/Dockerfile` - Configuración Docker
- ✅ `arkha_ms_module_manager/docker-compose.yml` - Puerto 8001

---

## ✅ Checklist de Integración

- [x] Microservicio Python desplegado en Coolify
- [x] Puerto 8001 configurado
- [x] Dominio `api-module-manager.laoarchitects.com` funcionando
- [x] CORS configurado en FastAPI
- [x] `MissionLayoutService` conectado al microservicio
- [x] Fallback automático a mockup si falla
- [x] Logs completos para debugging
- [x] Variable de entorno `NEXT_PUBLIC_MODULE_MANAGER_API_URL`
- [x] Lógica para nueva misión (con parámetros)
- [x] Lógica para misión existente sin módulos
- [x] Lógica para misión existente con módulos guardados
- [x] Documentación completa

---

## 🎉 ¡Todo Listo!

El sistema está completamente integrado. El microservicio Python se llamará automáticamente cuando:
1. Se cree una nueva misión
2. Se entre a una misión existente que no tenga módulos guardados

Si algo falla, el sistema automáticamente usa el mockup local (`example1.json`) como fallback.

