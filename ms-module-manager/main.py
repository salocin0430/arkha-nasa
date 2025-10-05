"""
===============================================================================
ARKHA MODULE MANAGER MICROSERVICE
===============================================================================
Microservicio para generar layouts de módulos espaciales basado en parámetros
de misión.

API Endpoints:
- POST /api/v1/generate-layout: Genera un layout de módulos
- GET /health: Health check del servicio
- GET /docs: Documentación Swagger automática

AUTOR: Sistema de Gestión de Módulos ARKHA
VERSIÓN: 1.0.0
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
import uvicorn
import Fase1
import Fase2
import Fase3

# =============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# =============================================================================

app = FastAPI(
    title="ARKHA Module Manager API",
    description="Microservicio para generar layouts óptimos de módulos espaciales ARKHA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# MODELOS DE DATOS (PYDANTIC)
# =============================================================================

class MissionParameters(BaseModel):
    """Parámetros de entrada para generar el layout de la misión"""
    passengers: int = Field(..., ge=1, le=300, description="Número de pasajeros (1-300)")
    duration: int = Field(..., ge=1, le=3650, description="Duración de la misión en días (1-3650)")
    terrain: Literal["moon", "mars", "asteroid"] = Field(..., description="Tipo de terreno donde se desplegará")
    isScientific: bool = Field(default=False, description="Indica si es una misión científica")

    class Config:
        json_schema_extra = {
            "example": {
                "passengers": 10,
                "duration": 90,
                "terrain": "moon",
                "isScientific": False
            }
        }

class ModuleLayout(BaseModel):
    """Representa un módulo individual en el layout"""
    id: str = Field(..., description="ID del módulo según arkha_modules.json")
    position: List[float] = Field(..., min_length=3, max_length=3, description="Posición [x, y, z] en el espacio 3D")
    rotation: List[float] = Field(..., min_length=3, max_length=3, description="Rotación [x, y, z] en radianes")
    scale: List[float] = Field(..., min_length=3, max_length=3, description="Escala [x, y, z]")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "access_core_l1_v1",
                "position": [0, 0, 0],
                "rotation": [0, 0, 0],
                "scale": [1, 1, 1]
            }
        }

class MissionMetadata(BaseModel):
    """Metadatos adicionales sobre el layout generado"""
    generatedAt: str = Field(..., description="Timestamp de generación (ISO 8601)")
    algorithmVersion: str = Field(..., description="Versión del algoritmo usado")
    estimatedCost: int = Field(..., description="Costo estimado en tokens ARKHA")
    currency: str = Field(default="ARKHA", description="Moneda del costo")

class MissionLayoutResponse(BaseModel):
    """Respuesta completa del microservicio"""
    parameters: MissionParameters = Field(..., description="Parámetros de entrada usados")
    totalModules: int = Field(..., ge=0, description="Número total de módulos generados")
    modules: List[ModuleLayout] = Field(..., description="Lista de módulos con sus posiciones")
    metadata: MissionMetadata = Field(..., description="Metadatos del layout generado")

    class Config:
        json_schema_extra = {
            "example": {
                "parameters": {
                    "passengers": 10,
                    "duration": 90,
                    "terrain": "moon",
                    "isScientific": False
                },
                "totalModules": 13,
                "modules": [
                    {
                        "id": "access_core_l1_v1",
                        "position": [0, 0, 0],
                        "rotation": [0, 0, 0],
                        "scale": [1, 1, 1]
                    },
                    {
                        "id": "powercore_l1_v1",
                        "position": [5, 0, 0],
                        "rotation": [0, 1.5708, 0],
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
        }

class HealthResponse(BaseModel):
    """Respuesta del health check"""
    status: str
    version: str
    timestamp: str

# =============================================================================
# ENDPOINTS DE LA API
# =============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz - redirige a la documentación"""
    return {
        "message": "ARKHA Module Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check del servicio
    
    Verifica que el servicio esté operativo y retorna información básica.
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@app.post("/api/v1/generate-layout", response_model=MissionLayoutResponse, tags=["Layout Generation"])
async def generate_layout(parameters: MissionParameters):
    """
    Genera un layout óptimo de módulos espaciales
    
    Este endpoint recibe los parámetros de la misión y genera un layout
    óptimo de módulos espaciales basado en:
    - Número de pasajeros
    - Duración de la misión
    - Tipo de terreno
    - Si es misión científica o no
    
    El algoritmo considera:
    - Restricciones de adyacencia entre módulos
    - Prioridades de colocación
    - Optimización de espacio
    - Pisos prioritarios para cada tipo de módulo
    
    Args:
        parameters: Parámetros de la misión (MissionParameters)
    
    Returns:
        MissionLayoutResponse: Layout completo con posiciones de módulos
    
    Raises:
        HTTPException: Si hay errores en la generación del layout
    """
    try:
        # TODO: Aquí irá la lógica de Fase1.py y Fase2.py
        
        P = parameters.passengers
        T = parameters.duration
        TipoC = parameters.isScientific
        terrain = parameters.terrain
        inventario = Fase1.calcular_modulos_arka(P, T, TipoC)
        arkas_resultado = Fase2.colocar_inventario_completo(inventario[0])
        json_result = Fase3.generar_json_solo_001_011_004(arkas_resultado, P, T, terrain, TipoC)
        return json_result
    
        '''
        response = MissionLayoutResponse(
            parameters=parameters,
            totalModules=len(example_modules),
            modules=example_modules,
            metadata=MissionMetadata(
                generatedAt=datetime.utcnow().isoformat() + "Z",
                algorithmVersion="v2.1.0",
                estimatedCost=45000,
                currency="ARKHA"
            )
        )
        
        return response
        '''
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generando layout: {str(e)}"
        )

# =============================================================================
# EJECUTAR EL SERVIDOR
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload en desarrollo
        log_level="info"
    )

