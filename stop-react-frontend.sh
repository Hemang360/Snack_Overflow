#!/bin/bash

echo "🛑 Stopping React Frontend..."

# Kill any React development server processes
pkill -f "vite"
pkill -f "npm run dev"

echo "React frontend stopped successfully!"
