#!/bin/bash
cd server-node-sdk
pkill -f "node farmer-api.js" || true
sleep 2
node farmer-api.js &
echo $! > farmer-api.pid
echo "🌿 Herb Traceability Backend started on port 5000"
echo "📱 Farmer Mobile API: http://localhost:5000/api/farmer"
echo "🧪 Lab Web API: http://localhost:5000/api/lab"
echo "👤 Consumer API: http://localhost:5000/api/consumer"
