#!/bin/bash
cd server-node-sdk
pkill -f "node enhanced-api.js" || true
sleep 2
node enhanced-api.js &
echo $! > enhanced-api.pid
echo "🌿 Enhanced Ayurvedic Blockchain API started on port 5000"
echo "📚 OpenAPI Spec: http://localhost:5000/api/openapi.json"
echo "🏥 Health Check: http://localhost:5000/health"
echo "🔐 Auth Endpoints: /api/auth/*"
echo "📦 Protected Endpoints: /api/protected/*"
echo "👤 Public Endpoints: /api/public/*"
