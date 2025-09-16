#!/bin/bash

# Ayurvedic Blockchain Frontend Deployment Script
# Deploys the complete frontend testing interface

set -e

echo "🌿 Ayurvedic Blockchain Frontend Deployment"
echo "==========================================="

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

# 1. Install frontend dependencies
print_step "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# 2. Stop any existing frontend server
print_step "Stopping existing frontend server..."
pkill -f "node frontend/server.js" || true
sleep 2

# 3. Start the frontend server
print_step "Starting frontend server..."
cd frontend

nohup node server.js > frontend.log 2>&1 &
echo $! > frontend.pid

sleep 3

# 4. Verify frontend is running
print_step "Verifying frontend is accessible..."
if curl -s http://localhost:3000 > /dev/null; then
    print_info "✅ Frontend server started successfully"
else
    echo "❌ Frontend server failed to start. Check frontend.log for details."
    exit 1
fi

cd ..

# 5. Create management scripts
print_step "Creating frontend management scripts..."
cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
pkill -f "node server.js" || true
sleep 2
node server.js &
echo $! > frontend.pid
echo "🌿 Frontend server started on http://localhost:3000"
echo "📱 Open your browser and navigate to the URL above"
EOF

cat > stop-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null || true
    rm frontend.pid
fi
pkill -f "node server.js" || true
echo "🛑 Frontend server stopped"
EOF

chmod +x start-frontend.sh stop-frontend.sh

# 6. Display summary
echo ""
echo -e "${GREEN}🎉 Frontend Deployment Complete!${NC}"
echo ""
echo "=============================================="
echo "🌿 Ayurvedic Blockchain Frontend"
echo "=============================================="
echo ""
echo -e "${GREEN}🔗 Access Points:${NC}"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:5000"
echo "• Health Check: http://localhost:5000/health"
echo ""
echo -e "${YELLOW}🎯 Frontend Features:${NC}"
echo "• Role-based authentication (Admin, Collector, Lab, Manufacturer)"
echo "• Complete API testing interface"
echo "• QR code scanner for consumers"
echo "• Dashboard for each user role"
echo "• Real-time API responses"
echo "• Modern responsive design"
echo ""
echo -e "${YELLOW}👥 User Roles Available:${NC}"
echo "• Admin: Full system access, user management, analytics"
echo "• Collector: Create collection events, view history"
echo "• Lab: Create quality tests, view test results"
echo "• Manufacturer: Create product batches, view inventory"
echo "• Consumer: QR code scanning (no login required)"
echo ""
echo -e "${YELLOW}🧪 Testing Features:${NC}"
echo "• Complete API endpoint testing"
echo "• Real-time form submissions"
echo "• QR code verification"
echo "• Traceability timeline display"
echo "• Error handling and validation"
echo ""
echo -e "${GREEN}🛠️  Management Commands:${NC}"
echo "• Start Frontend: ./start-frontend.sh"
echo "• Stop Frontend: ./stop-frontend.sh"
echo "• Start Backend: ./start-enhanced-api.sh"
echo "• Stop Backend: ./stop-enhanced-api.sh"
echo "• View Frontend Logs: tail -f frontend/frontend.log"
echo "• View Backend Logs: tail -f server-node-sdk/enhanced-api.log"
echo ""
echo -e "${GREEN}📱 How to Test:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Select a user role (Admin, Collector, Lab, Manufacturer)"
echo "3. Register a new user or use existing credentials"
echo "4. Use the dashboard to test all API endpoints"
echo "5. Try the QR scanner for consumer testing"
echo "6. Use the API Testing Console for direct endpoint testing"
echo ""
echo -e "${GREEN}✅ Frontend is ready for comprehensive testing!${NC}"
echo ""
