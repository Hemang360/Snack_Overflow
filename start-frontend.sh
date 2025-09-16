#!/bin/bash
cd frontend
pkill -f "node server.js" || true
sleep 2
node server.js &
echo $! > frontend.pid
echo "🌿 Frontend server started on http://localhost:3000"
echo "📱 Open your browser and navigate to the URL above"
