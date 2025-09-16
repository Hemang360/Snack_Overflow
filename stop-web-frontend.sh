#!/bin/bash

# Stop the new React/Vite frontend
cd web-frontend
if [ -f web-frontend.pid ]; then
    kill $(cat web-frontend.pid) 2>/dev/null || true
    rm web-frontend.pid
fi
pkill -f "vite" || true
echo "🛑 React Frontend stopped"
