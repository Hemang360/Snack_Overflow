#!/bin/bash

# Stop script for Herb Traceability Blockchain

echo "🛑 Stopping Herb Traceability Services..."

# Stop API server
if [ -f "server-node-sdk/api.pid" ]; then
    echo "Stopping API server..."
    kill $(cat server-node-sdk/api.pid) 2>/dev/null || true
    rm server-node-sdk/api.pid
fi

# Stop consumer portal
if [ -f "consumer-portal/portal.pid" ]; then
    echo "Stopping consumer portal..."
    kill $(cat consumer-portal/portal.pid) 2>/dev/null || true
    rm consumer-portal/portal.pid
fi

# Stop blockchain network
echo "Stopping blockchain network..."
cd fabric-samples/test-network
./network.sh down
cd ../..

echo "✅ All services stopped"
