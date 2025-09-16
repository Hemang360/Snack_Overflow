#!/bin/bash

# Herb Traceability Workflow Deployment Script
# Deploys the backend for: Farmer Mobile App → Lab Web Portal → Consumer QR Scanning

set -e

echo "🌿 Herb Traceability Workflow Backend Deployment"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 1. Install dependencies
print_step "Installing Node.js dependencies..."
cd server-node-sdk
npm install
cd ..

# 2. Create necessary directories
print_step "Creating upload and data directories..."
mkdir -p server-node-sdk/uploads/herbs
mkdir -p server-node-sdk/uploads/qr
mkdir -p server-node-sdk/data/collections

# 3. Set permissions
print_step "Setting up permissions..."
chmod 755 server-node-sdk/uploads
chmod 755 server-node-sdk/data

# 4. Create environment file
print_step "Creating environment configuration..."
cat > server-node-sdk/.env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=herb-traceability-secret-key-change-in-production
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
EOF

# 5. Start the API server
print_step "Starting Herb Traceability API..."
cd server-node-sdk

# Kill any existing process
pkill -f "node farmer-api.js" || true
sleep 2

# Start the API
nohup node farmer-api.js > farmer-api.log 2>&1 &
echo $! > farmer-api.pid

sleep 3

# 6. Verify API is running
print_step "Verifying API health..."
if curl -s http://localhost:5000/health > /dev/null; then
    print_info "✅ API server started successfully"
else
    echo "❌ API server failed to start. Check farmer-api.log for details."
    exit 1
fi

cd ..

# 7. Create startup script
print_step "Creating startup scripts..."
cat > start-backend.sh << 'EOF'
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
EOF

cat > stop-backend.sh << 'EOF'
#!/bin/bash
cd server-node-sdk
if [ -f farmer-api.pid ]; then
    kill $(cat farmer-api.pid) 2>/dev/null || true
    rm farmer-api.pid
fi
pkill -f "node farmer-api.js" || true
echo "🛑 Herb Traceability Backend stopped"
EOF

chmod +x start-backend.sh stop-backend.sh

# 8. Run workflow test
print_step "Running workflow demonstration..."
if [ -f test-workflow.sh ]; then
    chmod +x test-workflow.sh
    echo "✅ Workflow test script ready"
else
    print_info "⚠️  Workflow test script not found"
fi

# 9. Display summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "=============================================="
echo "🌿 Herb Traceability Backend is now running"
echo "=============================================="
echo ""
echo -e "${YELLOW}📱 Mobile App Integration:${NC}"
echo "• Farmer Registration: POST /api/farmer/register"
echo "• Herb Upload: POST /api/farmer/upload-herb"
echo "• Collection History: GET /api/farmer/collections"
echo "• Authentication: JWT Bearer token required"
echo ""
echo -e "${YELLOW}💻 Web Portal Integration:${NC}"
echo "• Lab Registration: POST /api/lab/register"
echo "• Add Test Results: POST /api/lab/add-test"
echo "• Test History: GET /api/lab/tests"
echo "• Authentication: JWT Bearer token required"
echo ""
echo -e "${YELLOW}👤 Consumer Access:${NC}"
echo "• Trace Product: GET /api/consumer/trace/{qrCode}"
echo "• Web Page: GET /trace/{qrCode}"
echo "• No authentication required"
echo ""
echo -e "${GREEN}🔗 Access Points:${NC}"
echo "• API Health: http://localhost:5000/health"
echo "• API Documentation: ./API_DOCUMENTATION.md"
echo "• Workflow Test: ./test-workflow.sh"
echo ""
echo -e "${GREEN}📋 Workflow Summary:${NC}"
echo "1. Farmer uploads herb data via mobile app → Gets QR code"
echo "2. QR code printed and pasted on herb container"
echo "3. Lab scans QR code and adds test results via web portal"
echo "4. Consumer scans QR code and sees complete journey"
echo ""
echo -e "${GREEN}🛠️  Management Commands:${NC}"
echo "• Start: ./start-backend.sh"
echo "• Stop: ./stop-backend.sh"
echo "• Test: ./test-workflow.sh"
echo "• Logs: tail -f server-node-sdk/farmer-api.log"
echo ""
echo -e "${GREEN}✅ Backend is ready for frontend integration!${NC}"
echo ""
