#!/bin/bash

echo "🚀 ARKHA Module Manager Microservice"
echo "===================================="
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando con Python local..."
    pip install -r requirements.txt
    python main.py
    exit 0
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose no está instalado. Usando Docker simple..."
    docker build -t arkha-module-manager .
    docker run -p 8000:8000 arkha-module-manager
    exit 0
fi

# Usar Docker Compose
echo "✅ Docker Compose detectado. Iniciando servicios..."
docker-compose up --build -d

echo ""
echo "✅ Servicio iniciado exitosamente!"
echo ""
echo "📖 Documentación Swagger: http://localhost:8000/docs"
echo "📖 ReDoc: http://localhost:8000/redoc"
echo "🏥 Health Check: http://localhost:8000/health"
echo ""
echo "📝 Ver logs: docker-compose logs -f"
echo "🛑 Detener: docker-compose down"

