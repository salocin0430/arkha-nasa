# ARKHA Module Manager Microservice

Microservicio para generar layouts óptimos de módulos espaciales ARKHA basado en parámetros de misión.

## 🚀 Características

- **API RESTful** con FastAPI
- **Documentación automática** con Swagger UI
- **Validación de datos** con Pydantic
- **Containerización** con Docker
- **CORS habilitado** para integración frontend

## 📋 Requisitos

- Python 3.11+
- Docker (opcional, para containerización)
- Docker Compose (opcional, para orquestación)

## 🛠️ Instalación

### Opción 1: Ejecución Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python main.py
```

El servidor estará disponible en: `http://localhost:8000`

### Opción 2: Docker

```bash
# Construir la imagen
docker build -t arkha-module-manager .

# Ejecutar el contenedor
docker run -p 8000:8000 arkha-module-manager
```

### Opción 3: Docker Compose (Recomendado)

```bash
# Iniciar el servicio
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el servicio
docker-compose down
```

## 📖 Documentación de la API

Una vez iniciado el servidor, accede a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔌 Endpoints

### POST /api/v1/generate-layout

Genera un layout óptimo de módulos espaciales.

**Request Body:**
```json
{
  "passengers": 10,
  "duration": 90,
  "terrain": "moon",
  "isScientific": false
}
```

**Response:**
```json
{
  "parameters": {
    "passengers": 10,
    "duration": 90,
    "terrain": "moon",
    "isScientific": false
  },
  "totalModules": 13,
  "modules": [
    {
      "id": "access_core_l1_v1",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ],
  "metadata": {
    "generatedAt": "2025-01-15T10:30:00Z",
    "algorithmVersion": "v2.1.0",
    "estimatedCost": 45000,
    "currency": "ARKHA"
  }
}
```

### GET /health

Health check del servicio.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🧪 Prueba con curl

```bash
# Health check
curl http://localhost:8000/health

# Generar layout
curl -X POST http://localhost:8000/api/v1/generate-layout \
  -H "Content-Type: application/json" \
  -d '{
    "passengers": 10,
    "duration": 90,
    "terrain": "moon",
    "isScientific": false
  }'
```

## 🔧 Configuración

El servicio corre en el puerto `8000` por defecto. Puedes cambiarlo editando:
- `main.py`: línea `uvicorn.run(..., port=8000)`
- `docker-compose.yml`: línea `ports: - "8000:8000"`

## 📐 Valores de Rotación (Eje Y)

Para orientar módulos correctamente:

```javascript
{
  "0°":   [0, 0, 0],           // Frente
  "90°":  [0, 1.5708, 0],      // Derecha
  "180°": [0, 3.14159, 0],     // Atrás
  "270°": [0, 4.71239, 0],     // Izquierda
  "45°":  [0, 0.785398, 0],    // Diagonal
  "135°": [0, 2.356194, 0],
  "225°": [0, 3.926991, 0],
  "315°": [0, 5.497787, 0]
}
```

## 🏗️ Estructura del Proyecto

```
arkha_ms_module_manager/
├── main.py              # API principal con FastAPI
├── Fase1.py            # Algoritmo de cálculo de módulos
├── Fase2.py            # Algoritmo de colocación inteligente
├── requirements.txt    # Dependencias Python
├── Dockerfile          # Imagen Docker
├── docker-compose.yml  # Orquestación Docker
├── .dockerignore       # Archivos excluidos de Docker
└── README.md           # Esta documentación
```

## 🔄 Próximos Pasos

- [ ] Integrar algoritmos de Fase1.py y Fase2.py
- [ ] Implementar conversión de matriz ARKA a coordenadas 3D
- [ ] Agregar autenticación/autorización
- [ ] Implementar cache de resultados
- [ ] Agregar tests unitarios

## 📝 Versión

**v1.0.0** - Estructura base del microservicio con contrato definido

## 👥 Autor

Sistema de Gestión de Módulos ARKHA
