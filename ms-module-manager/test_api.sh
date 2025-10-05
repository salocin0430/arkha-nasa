#!/bin/bash

echo "🧪 Testing ARKHA Module Manager API"
echo "===================================="
echo ""

# Health Check
echo "1️⃣  Testing Health Check..."
curl -s http://localhost:8000/health | jq '.'
echo ""
echo ""

# Generate Layout
echo "2️⃣  Testing Generate Layout..."
curl -s -X POST http://localhost:8000/api/v1/generate-layout \
  -H "Content-Type: application/json" \
  -d '{
    "passengers": 10,
    "duration": 90,
    "terrain": "moon",
    "isScientific": false
  }' | jq '.'

echo ""
echo "✅ Tests completed!"
echo "📖 View full docs at: http://localhost:8000/docs"

