#!/bin/bash
cd server-node-sdk
if [ -f enhanced-api.pid ]; then
    kill $(cat enhanced-api.pid) 2>/dev/null || true
    rm enhanced-api.pid
fi
pkill -f "node enhanced-api.js" || true
echo "🛑 Enhanced Ayurvedic Blockchain API stopped"
