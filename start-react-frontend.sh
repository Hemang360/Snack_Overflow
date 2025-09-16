#!/bin/bash

echo "🌿 Starting React Frontend..."

# Change to React frontend directory
cd /home/hemang/Snack_Overflow/frontend-react

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the React development server
echo "Starting React development server on port 3000..."
npm run dev

echo "React frontend started successfully!"
echo "Access at: http://localhost:3000"
