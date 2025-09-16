#!/bin/bash
cd server-node-sdk
if [ -f farmer-api.pid ]; then
    kill $(cat farmer-api.pid) 2>/dev/null || true
    rm farmer-api.pid
fi
pkill -f "node farmer-api.js" || true
echo "🛑 Herb Traceability Backend stopped"
