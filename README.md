# 🚀 ARKHA - Space Habitat Design Platform

**NASA International Space Apps Challenge Project**

ARKHA is a comprehensive platform for designing and visualizing modular space habitats for missions to the Moon, Mars, and deep space. The project consists of two main applications working together:

---

## 🛠️ Technologies & Tools Used

### Frontend & 3D Rendering
- **Next.js 15.5.4** (App Router)
- **TypeScript 5**
- **React 19**
- **Three.js 0.180**
- **@react-three/fiber**
- **@react-three/drei**
- **Tailwind CSS 3.4**
- **Framer Motion 12**

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Zustand 5**

### Microservice
- **Python 3.9+**
- **FastAPI 0.109**
- **Uvicorn**
- **Pydantic 2.5**
- **NumPy 1.26**

### DevOps & Deployment
- **Docker**
- **Docker Compose**
- **Vercel**
- **Git**
- **GitHub**

### 3D Modeling
- **SketchUp**
- **Blender**
- **GLB Format**

### Architecture Patterns
- **Clean Architecture**
- **Repository Pattern**
- **Dependency Injection**

---

## 📦 Project Architecture

```
arkha-nasa/
├── Frontend-nextjs/          # Main web application (Next.js)
└── ms-module-manager/        # Layout generation microservice (Python/FastAPI)
```

---

## 🌐 Next.js Frontend

### What is it?

Interactive web application built with **Next.js 15** that allows users to design, visualize, and share modular space habitat configurations in 3D. Features authentication, community gallery, mission builder, and 3D viewer.

### Key Features

- 🎨 **Interactive 3D Viewer**: Space module rendering using Three.js
- 🏗️ **Mission Builder**: Design custom habitats based on mission parameters
- 👥 **Community Gallery**: Explore and share designs with other users
- 🔐 **Complete Authentication**: User system with Supabase Auth
- 📱 **Responsive Design**: Interface optimized for all devices
- 🌙 **Module Catalog**: 27 specialized ARKHA modules (laboratories, living quarters, systems, etc.)

### Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 3.4, Framer Motion
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State**: Zustand
- **Architecture**: Clean Architecture (Domain/Application/Infrastructure)

### Installation and Deployment

#### Prerequisites

- Node.js 20+ and npm
- Supabase account (for database and authentication)

#### Installation Steps

```bash
# 1. Navigate to frontend directory
cd Frontend-nextjs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp env.example .env.local

# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Run in Development

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

#### Build for Production

```bash
npm run build
npm start
```

### Project Structure

```
Frontend-nextjs/
├── src/
│   ├── app/                    # Pages and routes (App Router)
│   │   ├── page.tsx           # Main page
│   │   ├── login/             # Authentication
│   │   ├── gallery/           # Mission gallery
│   │   ├── mission-builder/   # Mission builder
│   │   └── profile/           # User profile
│   ├── components/            # React components
│   │   ├── ModuleViewer3D.tsx # Main 3D viewer
│   │   ├── PersistentNavbar.tsx
│   │   └── ui/                # UI components
│   ├── services/              # Business logic
│   │   ├── ModuleConfigService.ts
│   │   └── MissionLayoutService.ts
│   ├── hooks/                 # Custom React hooks
│   └── infrastructure/        # Supabase integration
├── public/
│   ├── models/                # 3D models (.glb)
│   │   ├── modules/           # 27 ARKHA modules
│   │   └── extraterrestrial_lands/
│   └── configs/               # JSON configurations
│       ├── arkha_modules.json # Module catalog
│       └── modules_catalog.json
└── docs/                      # Technical documentation
```

### 🎨 3D Models - Location and Format

#### Model Location

All 3D models are located in the `public/models/` folder:

```
public/models/
├── modules/                              # ARKHA Modules (27 files)
│   ├── ARKHA_base_L1_V1.glb             # Base module
│   ├── ARKHA_PowerCore_L1_V1.glb        # Power core
│   ├── ARKHA_AccessCore_L1_V1.glb       # Access core
│   ├── ARKHA_Lab_L2_V1.glb              # Laboratory
│   ├── ARKHA_LabTri_L2_V1.glb           # Triangular laboratory
│   ├── ARKHA_L2_ExerciseBay_V1.glb      # Exercise bay
│   ├── ARKHA_L3_MedBay_V1.glb           # Medical bay
│   ├── ARKHA_SanitaryBay_L2_V1.glb      # Sanitary bay
│   └── ... (and more specialized modules)
│
└── extraterrestrial_lands/               # Extraterrestrial terrains
    ├── SRF_MOON.glb                     # Lunar surface
    ├── SRF_MOON2.glb                    # Lunar surface (variant)
    └── Apollo_14.glb                    # Apollo 14 site
```

#### ARKHA Module Catalog

The system uses 27 specialized modules organized by categories:

| Category | Modules | Description |
|----------|---------|-------------|
| **Base** | Base L1 | Octagonal foundational structure |
| **Power** | PowerCore L1 | Energy center with batteries and thermal control |
| **Access** | AccessCore L1, TransCore L2 | Airlock, EVA, stairs and elevators |
| **Circulation** | Circulation L1 | Connecting corridors between modules |
| **Laboratories** | Lab L2, LabTri L2 | Bio Lab, Physical Lab, Geo Lab |
| **Habitat** | SleepWard L2/Tri, Recreation L1/Tri | Dormitories and rest areas |
| **Services** | Sanitary L2/Tri, MealPrep L3/Tri | Bathrooms, kitchen and food preparation |
| **Operations** | GalleyComputer L3/Tri, MedBay L3/Tri | Central control and medical area |
| **Support** | Systems L2/Tri, Storage L2/Tri | HVAC, communications and storage |
| **Life** | Huerta L1/Tri, Exercise L2/Tri | Greenhouses and gym |

**Nomenclature:**
- `L1`, `L2`, `L3`: Module level (1=Base, 2=Middle, 3=Upper)
- `Tri`: Expanded version (triple size)
- `V1`: Design version

#### Why do we use GLB format?

**GLB (GL Transmission Format Binary)** is the standard format for 3D models on the web for the following reasons:

1. **📦 Compact Binary Format**
   - Single file containing geometry, textures, materials, and animations
   - Reduced file size (up to 10x smaller than other formats)
   - Faster loading in web applications

2. **🌐 Industry Standard**
   - Official format by Khronos Group (creators of WebGL)
   - Natively supported by Three.js and React Three Fiber
   - Compatible with most 3D tools (Blender, SketchUp, Maya, etc.)

3. **⚡ Web Optimized**
   - Designed specifically for internet transmission
   - Progressive loading and streaming
   - Low memory consumption in browser

4. **🎯 All-in-One**
   - No external files required (embedded textures and materials)
   - Easy to manage and distribute
   - Fewer HTTP requests = better performance

5. **🔧 Easy Integration**
   ```typescript
   // Loading a GLB model in React Three Fiber is simple:
   import { useGLTF } from '@react-three/drei';
   
   const { scene } = useGLTF('/models/modules/ARKHA_Lab_L2_V1.glb');
   ```

### ⚙️ Module Configuration File

The `public/configs/arkha_modules.json` file is the **heart of the system**. It defines all modules, their properties, and how they are rendered in the 3D viewer.

#### File Structure

```json
{
  "id": "arkha_modules",
  "name": "ARKHA Space Modules",
  "defaultTime": 12,
  "cameraPosition": [0, 20, 40],
  "cameraTarget": [0, 0, 0],
  "baseModel": { ... },
  "modules": [ ... ],
  "lighting": { ... },
  "environment": { ... }
}
```

#### Global Configuration

| Property | Type | Description |
|----------|------|-------------|
| `cameraPosition` | `[x, y, z]` | Initial camera position in 3D space |
| `cameraTarget` | `[x, y, z]` | Point where the camera looks |
| `defaultTime` | `number` | Time of day for lighting (0-24) |
| `floorMaterial` | `string` | Floor material (marble, concrete, etc.) |

#### Module Configuration

Each module in the `modules` array has the following structure:

```json
{
  "id": "base_l1_v1",
  "name": "Structural base - Octagon",
  "code": "ARKHA_base_L1_V1",
  "item": "001",
  "type": "Base Module",
  "description": "Octagonal foundational structure...",
  "area": "9.21 m²",
  "volume": "36.15 m³",
  "position": [0, 0, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "typeModel": "glb",
  "path": "/models/modules/ARKHA_base_L1_V1.glb",
  "interactive": true,
  "hidden": false,
  "lighting": {
    "enabled": true,
    "intensity": 110,
    "angle": 65,
    "color": "0xffffff",
    "position": [0, 2.8, 0],
    "type": "point"
  }
}
```

#### Key Properties

**Identification:**
- `id`: Unique module identifier
- `code`: Official ARKHA code
- `item`: Catalog item number
- `type`: Module category

**Physical Properties:**
- `area`: Usable area in square meters
- `volume`: Habitable volume in cubic meters
- `description`: Functional module description

**3D Transformation:**
- `position`: Coordinates [x, y, z] in space
- `rotation`: Rotation [x, y, z] in radians
- `scale`: Scale [x, y, z] (1 = original size)

**Rendering:**
- `path`: Path to GLB model file
- `interactive`: Whether user can select/move it
- `hidden`: Whether it's hidden by default
- `typeModel`: Model format (glb, obj, etc.)

**Module Lighting:**
- `enabled`: Activate individual light
- `intensity`: Light intensity (0-200)
- `type`: Light type (point, spot, directional)
- `color`: Color in hexadecimal format
- `position`: Position relative to module

#### Global Lighting

```json
"lighting": {
  "ambient": {
    "color": "0x404040",
    "intensity": 1.5
  },
  "directional": {
    "color": "0xffffff",
    "intensity": 2.5,
    "position": [15, 20, 10],
    "castShadow": true
  }
}
```

- **Ambient Light**: Base lighting affecting the entire scene
- **Directional Light**: Directional light (simulates the sun)

#### Environment

```json
"environment": {
  "skyColor": "0x000000",
  "groundColor": "0x000000",
  "fogEnabled": false
}
```

#### Usage Example

To add a new module to the catalog:

1. **Add the GLB model** to `public/models/modules/`
2. **Create JSON entry**:

```json
{
  "id": "new_module_v1",
  "name": "New Experimental Module",
  "code": "ARKHA_NewModule_L2_V1",
  "item": "028",
  "type": "Experimental Module",
  "description": "New module description",
  "area": "12.5 m²",
  "volume": "35.0 m³",
  "position": [0, 0, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "typeModel": "glb",
  "path": "/models/modules/ARKHA_NewModule_L2_V1.glb",
  "interactive": true,
  "hidden": false,
  "lighting": {
    "enabled": true,
    "intensity": 110,
    "angle": 65,
    "color": "0xffffff",
    "position": [0, 2.8, 0],
    "type": "point"
  }
}
```

3. **Restart the server** to load changes

#### File Validation

The file must be valid JSON. You can validate it with:

```bash
# Using Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('public/configs/arkha_modules.json')))"

# Or using an online tool: https://jsonlint.com/
```

#### Configuration File Location

```
public/configs/
├── arkha_modules.json      # Main module catalog (27 modules)
├── modules_catalog.json    # Simplified catalog for UI
├── mission_example.json    # Mission configuration example
└── mission_test.json       # Test configuration
```

---

## 🐍 Python Microservice (Module Manager)

### What is it?

RESTful microservice built with **FastAPI** that generates optimal space module layouts based on mission parameters (destination, duration, crew size, mission type). Uses three-phase optimization algorithms to create viable configurations.

### Key Features

- 🧮 **3-Phase Optimization Algorithm**:
  - **Phase 1**: Calculate required modules based on parameters
  - **Phase 2**: Optimize distribution and connections
  - **Phase 3**: Generate 3D layout with positions and rotations
- 🔌 **RESTful API**: Documented endpoints with Swagger/OpenAPI
- 🚀 **High Performance**: Fast processing of complex layouts
- 🐳 **Dockerized**: Easy deployment with Docker Compose

### Tech Stack

- **Framework**: FastAPI 0.109.0
- **Language**: Python 3.9+
- **Server**: Uvicorn
- **Validation**: Pydantic 2.5
- **Calculations**: NumPy 1.26

### Installation and Deployment

#### Option 1: Docker (Recommended)

```bash
# 1. Navigate to microservice directory
cd ms-module-manager

# 2. Build and run with Docker Compose
docker-compose up --build

# Service will be available at http://localhost:8000
```

#### Option 2: Local Installation

```bash
# 1. Navigate to microservice directory
cd ms-module-manager

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
python main.py
```

Service will be available at `http://localhost:8000`

### API Endpoints

#### `POST /api/v1/generate-layout`

Generates a module layout based on mission parameters.

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

Service health check.

#### `GET /docs`

Interactive Swagger UI documentation.

### Project Structure

```
ms-module-manager/
├── main.py           # Main FastAPI application
├── Fase1.py          # Calculate required modules
├── Fase2.py          # Distribution optimization
├── Fase3.py          # 3D layout generation
├── requirements.txt  # Python dependencies
├── Dockerfile        # Docker configuration
├── docker-compose.yml
└── README.md
```

---

## 🔗 Frontend ↔ Microservice Integration

The Next.js frontend communicates with the Python microservice to generate automatic layouts:

```typescript
// In frontend (MissionLayoutService.ts)
const response = await axios.post('http://localhost:8000/api/v1/generate-layout', {
  destination: 'Moon',
  crew_size: 4,
  mission_duration: 180,
  mission_type: 'Scientific'
});

const layout = response.data.layout;
// Render modules in 3D viewer
```

---

## 🚀 Complete Deployment (Both Applications)

### Local Development

```bash
# Terminal 1: Python Microservice
cd ms-module-manager
docker-compose up

# Terminal 2: Next.js Frontend
cd Frontend-nextjs
npm run dev
```

### Production

#### Frontend (Vercel - Recommended)

```bash
cd Frontend-nextjs
npm run build

# Deploy to Vercel
vercel deploy --prod
```

#### Microservice (Docker on server)

```bash
cd ms-module-manager
docker-compose up -d
```

Or use services like:
- **Railway**
- **Render**
- **AWS ECS**
- **Google Cloud Run**

---

## 📚 Additional Documentation

- **Database**: See `Frontend-nextjs/docs/database-schema.md` for Supabase schema
- **Microservice**: See `ms-module-manager/README.md` for technical details
- **Integration**: See `Frontend-nextjs/docs/MICROSERVICE_INTEGRATION.md`

---

## 🎨 Color Palette

- **Electric Blue**: `#0042A6` (Primary)
- **Deep Blue**: `#07173F` (Secondary)
- **Neon Yellow**: `#EAFE07` (Accent)

---

## 👥 Contribution

This project was developed for the **NASA International Space Apps Challenge 2025**.

---

## 📄 License

This project is open source and available under the MIT license.

---

## 🆘 Support

For issues or questions:
1. Review documentation in `/docs`
2. Verify Supabase is configured correctly
3. Ensure microservice is running on port 8000
4. Check environment variables in `.env.local`

---

**Happy space habitat designing! 🌙🚀✨**
