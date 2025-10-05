# 🚀 ARKHA - Space Habitat Design Platform

**NASA International Space Apps Challenge Project**

ARKHA es una plataforma integral para el diseño y visualización de hábitats espaciales modulares para misiones en la Luna, Marte y el espacio profundo. El proyecto consta de dos aplicaciones principales que trabajan en conjunto:

---

## 📦 Arquitectura del Proyecto

```
arkha-nasa/
├── Frontend-nextjs/          # Aplicación web principal (Next.js)
└── ms-module-manager/        # Microservicio de generación de layouts (Python/FastAPI)
```

---

## 🌐 Frontend Next.js

### ¿Qué es?

Aplicación web interactiva construida con **Next.js 15** que permite a los usuarios diseñar, visualizar y compartir configuraciones de hábitats espaciales modulares en 3D. Incluye autenticación, galería comunitaria, constructor de misiones y visualizador 3D.

### Características Principales

- 🎨 **Visualizador 3D Interactivo**: Renderizado de módulos espaciales usando Three.js
- 🏗️ **Constructor de Misiones**: Diseña hábitats personalizados según parámetros de misión
- 👥 **Galería Comunitaria**: Explora y comparte diseños con otros usuarios
- 🔐 **Autenticación Completa**: Sistema de usuarios con Supabase Auth
- 📱 **Responsive Design**: Interfaz optimizada para todos los dispositivos
- 🌙 **Catálogo de Módulos**: 25+ módulos ARKHA especializados (laboratorios, habitaciones, sistemas, etc.)

### Stack Tecnológico

- **Framework**: Next.js 15.5.4 (App Router)
- **Lenguaje**: TypeScript 5
- **UI**: React 19, Tailwind CSS 3.4, Framer Motion
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Estado**: Zustand
- **Arquitectura**: Clean Architecture (Domain/Application/Infrastructure)

### Instalación y Despliegue

#### Prerrequisitos

- Node.js 20+ y npm
- Cuenta de Supabase (para base de datos y autenticación)

#### Pasos de Instalación

```bash
# 1. Navegar al directorio del frontend
cd Frontend-nextjs

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.example .env.local

# Editar .env.local con tus credenciales de Supabase:
# NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

#### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

#### Construir para Producción

```bash
npm run build
npm start
```

### Estructura del Proyecto

```
Frontend-nextjs/
├── src/
│   ├── app/                    # Páginas y rutas (App Router)
│   │   ├── page.tsx           # Página principal
│   │   ├── login/             # Autenticación
│   │   ├── gallery/           # Galería de misiones
│   │   ├── mission-builder/   # Constructor de misiones
│   │   └── profile/           # Perfil de usuario
│   ├── components/            # Componentes React
│   │   ├── ModuleViewer3D.tsx # Visualizador 3D principal
│   │   ├── PersistentNavbar.tsx
│   │   └── ui/                # Componentes de interfaz
│   ├── services/              # Lógica de negocio
│   │   ├── ModuleConfigService.ts
│   │   └── MissionLayoutService.ts
│   ├── hooks/                 # React hooks personalizados
│   └── infrastructure/        # Integración con Supabase
├── public/
│   ├── models/                # Modelos 3D (.glb)
│   │   ├── modules/           # 25+ módulos ARKHA
│   │   └── extraterrestrial_lands/
│   └── configs/               # Configuraciones JSON
│       ├── arkha_modules.json # Catálogo de módulos
│       └── modules_catalog.json
└── docs/                      # Documentación técnica
```

### 🎨 Modelos 3D - Ubicación y Formato

#### Ubicación de los Modelos

Todos los modelos 3D se encuentran en la carpeta `public/models/`:

```
public/models/
├── modules/                              # Módulos ARKHA (25+ archivos)
│   ├── ARKHA_base_L1_V1.glb             # Módulo base
│   ├── ARKHA_PowerCore_L1_V1.glb        # Núcleo de energía
│   ├── ARKHA_AccessCore_L1_V1.glb       # Núcleo de acceso
│   ├── ARKHA_Lab_L2_V1.glb              # Laboratorio
│   ├── ARKHA_LabTri_L2_V1.glb           # Laboratorio triangular
│   ├── ARKHA_L2_ExerciseBay_V1.glb      # Bahía de ejercicio
│   ├── ARKHA_L3_MedBay_V1.glb           # Bahía médica
│   ├── ARKHA_SanitaryBay_L2_V1.glb      # Bahía sanitaria
│   └── ... (y más módulos especializados)
│
└── extraterrestrial_lands/               # Terrenos extraterrestres
    ├── SRF_MOON.glb                     # Superficie lunar
    ├── SRF_MOON2.glb                    # Superficie lunar (variante)
    └── Apollo_14.glb                    # Sitio Apollo 14
```

#### ¿Por qué usamos el formato GLB?

**GLB (GL Transmission Format Binary)** es el formato estándar para modelos 3D en la web por las siguientes razones:

1. **📦 Formato Binario Compacto**
   - Archivo único que contiene geometría, texturas, materiales y animaciones
   - Tamaño de archivo reducido (hasta 10x más pequeño que otros formatos)
   - Carga más rápida en aplicaciones web

2. **🌐 Estándar de la Industria**
   - Formato oficial de Khronos Group (creadores de WebGL)
   - Soportado nativamente por Three.js y React Three Fiber
   - Compatible con la mayoría de herramientas 3D (Blender, SketchUp, Maya, etc.)

3. **⚡ Optimizado para Web**
   - Diseñado específicamente para transmisión por internet
   - Carga progresiva y streaming
   - Bajo consumo de memoria en el navegador

4. **🎯 Todo en Uno**
   - No requiere archivos externos (texturas, materiales embebidos)
   - Fácil de gestionar y distribuir
   - Menos requests HTTP = mejor rendimiento

5. **🔧 Fácil Integración**
   ```typescript
   // Cargar un modelo GLB en React Three Fiber es simple:
   import { useGLTF } from '@react-three/drei';
   
   const { scene } = useGLTF('/models/modules/ARKHA_Lab_L2_V1.glb');
   ```


---

## 🐍 Microservicio Python (Module Manager)

### ¿Qué es?

Microservicio RESTful construido con **FastAPI** que genera layouts óptimos de módulos espaciales basándose en parámetros de misión (destino, duración, número de tripulantes, tipo de misión). Utiliza algoritmos de optimización en tres fases para crear configuraciones viables.

### Características Principales

- 🧮 **Algoritmo de Optimización en 3 Fases**:
  - **Fase 1**: Cálculo de módulos necesarios según parámetros
  - **Fase 2**: Optimización de distribución y conexiones
  - **Fase 3**: Generación de layout 3D con posiciones y rotaciones
- 🔌 **API RESTful**: Endpoints documentados con Swagger/OpenAPI
- 🚀 **Alto Rendimiento**: Procesamiento rápido de layouts complejos
- 🐳 **Dockerizado**: Fácil despliegue con Docker Compose

### Stack Tecnológico

- **Framework**: FastAPI 0.109.0
- **Lenguaje**: Python 3.9+
- **Servidor**: Uvicorn
- **Validación**: Pydantic 2.5
- **Cálculos**: NumPy 1.26

### Instalación y Despliegue

#### Opción 1: Docker (Recomendado)

```bash
# 1. Navegar al directorio del microservicio
cd ms-module-manager

# 2. Construir y ejecutar con Docker Compose
docker-compose up --build

# El servicio estará disponible en http://localhost:8000
```

#### Opción 2: Instalación Local

```bash
# 1. Navegar al directorio del microservicio
cd ms-module-manager

# 2. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar el servidor
python main.py
```

El servicio estará disponible en `http://localhost:8000`

### Endpoints de la API

#### `POST /api/v1/generate-layout`

Genera un layout de módulos basado en parámetros de misión.

**Request Body:**
```json
{
  "destination": "Moon",
  "crew_size": 4,
  "mission_duration": 180,
  "mission_type": "Scientific",
  "priority_modules": ["Lab", "MedBay"]
}
```

**Response:**
```json
{
  "success": true,
  "layout": {
    "modules": [...],
    "connections": [...],
    "statistics": {...}
  }
}
```

#### `GET /health`

Health check del servicio.

#### `GET /docs`

Documentación interactiva Swagger UI.

### Estructura del Proyecto

```
ms-module-manager/
├── main.py           # Aplicación FastAPI principal
├── Fase1.py          # Cálculo de módulos necesarios
├── Fase2.py          # Optimización de distribución
├── Fase3.py          # Generación de layout 3D
├── requirements.txt  # Dependencias Python
├── Dockerfile        # Configuración Docker
├── docker-compose.yml
└── README.md
```

---

## 🔗 Integración Frontend ↔ Microservicio

El frontend Next.js se comunica con el microservicio Python para generar layouts automáticos:

```typescript
// En el frontend (MissionLayoutService.ts)
const response = await axios.post('http://localhost:8000/api/v1/generate-layout', {
  destination: 'Moon',
  crew_size: 4,
  mission_duration: 180,
  mission_type: 'Scientific'
});

const layout = response.data.layout;
// Renderizar módulos en el visualizador 3D
```

---

## 🚀 Despliegue Completo (Ambas Aplicaciones)

### Desarrollo Local

```bash
# Terminal 1: Microservicio Python
cd ms-module-manager
docker-compose up

# Terminal 2: Frontend Next.js
cd Frontend-nextjs
npm run dev
```

### Producción

#### Frontend (Vercel - Recomendado)

```bash
cd Frontend-nextjs
npm run build

# Desplegar en Vercel
vercel deploy --prod
```

#### Microservicio (Docker en servidor)

```bash
cd ms-module-manager
docker-compose up -d
```

O usar servicios como:
- **Railway**
- **Render**
- **AWS ECS**
- **Google Cloud Run**

---

## 📚 Documentación Adicional

- **Base de Datos**: Ver `Frontend-nextjs/docs/database-schema.md` para esquema de Supabase
- **Microservicio**: Ver `ms-module-manager/README.md` para detalles técnicos
- **Integración**: Ver `Frontend-nextjs/docs/MICROSERVICE_INTEGRATION.md`

---

## 🎨 Paleta de Colores

- **Electric Blue**: `#0042A6` (Primario)
- **Deep Blue**: `#07173F` (Secundario)
- **Neon Yellow**: `#EAFE07` (Acento)

---

## 👥 Contribución

Este proyecto fue desarrollado para el **NASA International Space Apps Challenge 2025**.

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar la documentación en `/docs`
2. Verificar que Supabase esté configurado correctamente
3. Asegurar que el microservicio esté ejecutándose en el puerto 8000
4. Verificar las variables de entorno en `.env.local`

---

**¡Feliz diseño de hábitats espaciales! 🌙🚀✨**