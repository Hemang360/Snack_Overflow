#!/bin/bash
cd frontend
if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null || true
    rm frontend.pid
fi
pkill -f "node server.js" || true
echo "🛑 Frontend server stopped"
