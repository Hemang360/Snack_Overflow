#!/bin/bash

# Start the new React/Vite frontend
cd web-frontend
pkill -f "vite" || true
sleep 2
npm run dev &
echo $! > web-frontend.pid
echo "🌿 New React Frontend started on http://localhost:5173"
echo "📱 Modern React/Vite application with Tailwind CSS"
echo "🔗 Backend API: http://localhost:5000"
