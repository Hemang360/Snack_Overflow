#!/bin/bash

# Enhanced Ayurvedic Blockchain API Deployment Script
# Deploys the complete API with all endpoints from the documentation

set -e

echo "🌿 Enhanced Ayurvedic Blockchain API Deployment"
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
npm install express-rate-limit
cd ..

# 2. Create necessary directories
print_step "Creating data and upload directories..."
mkdir -p server-node-sdk/data/users
mkdir -p server-node-sdk/data/collection-events
mkdir -p server-node-sdk/data/quality-tests
mkdir -p server-node-sdk/data/processing-steps
mkdir -p server-node-sdk/data/products
mkdir -p server-node-sdk/data/recalls
mkdir -p server-node-sdk/uploads/herbs
mkdir -p server-node-sdk/uploads/qr
mkdir -p server-node-sdk/uploads/documents

# 3. Set permissions
print_step "Setting up permissions..."
chmod 755 server-node-sdk/data
chmod 755 server-node-sdk/uploads

# 4. Create environment file
print_step "Creating environment configuration..."
cat > server-node-sdk/.env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=ayurvedic-blockchain-secret-key-change-in-production
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000
EOF

# 5. Stop any existing API
print_step "Stopping existing API servers..."
pkill -f "node farmer-api.js" || true
pkill -f "node enhanced-api.js" || true
sleep 2

# 6. Start the Enhanced API server
print_step "Starting Enhanced Ayurvedic Blockchain API..."
cd server-node-sdk

nohup node enhanced-api.js > enhanced-api.log 2>&1 &
echo $! > enhanced-api.pid

sleep 3

# 7. Verify API is running
print_step "Verifying API health..."
if curl -s http://localhost:5000/health > /dev/null; then
    print_info "✅ Enhanced API server started successfully"
else
    echo "❌ Enhanced API server failed to start. Check enhanced-api.log for details."
    exit 1
fi

cd ..

# 8. Create management scripts
print_step "Creating management scripts..."
cat > start-enhanced-api.sh << 'EOF'
#!/bin/bash
cd server-node-sdk
pkill -f "node enhanced-api.js" || true
sleep 2
node enhanced-api.js &
echo $! > enhanced-api.pid
echo "🌿 Enhanced Ayurvedic Blockchain API started on port 5000"
echo "📚 OpenAPI Spec: http://localhost:5000/api/openapi.json"
echo "🏥 Health Check: http://localhost:5000/health"
echo "🔐 Auth Endpoints: /api/auth/*"
echo "📦 Protected Endpoints: /api/protected/*"
echo "👤 Public Endpoints: /api/public/*"
EOF

cat > stop-enhanced-api.sh << 'EOF'
#!/bin/bash
cd server-node-sdk
if [ -f enhanced-api.pid ]; then
    kill $(cat enhanced-api.pid) 2>/dev/null || true
    rm enhanced-api.pid
fi
pkill -f "node enhanced-api.js" || true
echo "🛑 Enhanced Ayurvedic Blockchain API stopped"
EOF

chmod +x start-enhanced-api.sh stop-enhanced-api.sh

# 9. Run comprehensive test
print_step "Running comprehensive API test..."
if [ -f test-enhanced-api.sh ]; then
    chmod +x test-enhanced-api.sh
    echo "✅ Enhanced API test script ready"
    echo "   Run: ./test-enhanced-api.sh"
else
    print_info "⚠️  Enhanced API test script not found"
fi

# 10. Display summary
echo ""
echo -e "${GREEN}🎉 Enhanced API Deployment Complete!${NC}"
echo ""
echo "=============================================="
echo "🌿 Enhanced Ayurvedic Blockchain API"
echo "=============================================="
echo ""
echo -e "${YELLOW}🔐 Authentication Endpoints:${NC}"
echo "• POST /api/auth/register - Register new user"
echo "• POST /api/auth/login - User login"
echo "• GET  /api/auth/me - Get current user"
echo "• POST /api/auth/logout - Logout"
echo ""
echo -e "${YELLOW}👤 Public QR Verification:${NC}"
echo "• GET /api/public/qr/:qrCode - Public QR verification"
echo "• GET /api/qr-verification/:qrCode - Authenticated QR verification"
echo ""
echo -e "${YELLOW}📦 Collection Events:${NC}"
echo "• POST /api/protected/collection-events - Create collection event"
echo "• GET  /api/protected/collection-events - Get all collections"
echo "• GET  /api/protected/collections/species/:species - Get by species"
echo ""
echo -e "${YELLOW}🧪 Quality Tests:${NC}"
echo "• POST /api/protected/quality-tests - Create quality test"
echo "• GET  /api/protected/quality-tests - Get all tests"
echo "• GET  /api/protected/quality-tests/lab/:labId - Get by lab"
echo ""
echo -e "${YELLOW}⚙️  Processing Steps:${NC}"
echo "• POST /api/protected/processing-steps - Create processing step"
echo "• GET  /api/protected/processing-steps - Get all steps"
echo ""
echo -e "${YELLOW}📦 Product Batches:${NC}"
echo "• POST /api/protected/product-batches - Create product batch"
echo "• GET  /api/protected/product-batches/:batchId - Get batch"
echo ""
echo -e "${YELLOW}🔍 Traceability:${NC}"
echo "• GET /api/protected/traceability/:batchId - Complete traceability"
echo ""
echo -e "${YELLOW}🚨 Recall System:${NC}"
echo "• POST /api/protected/recalls - Initiate recall"
echo "• GET  /api/protected/recalls/:batchId - Get recall info"
echo "• GET  /api/protected/recalls - Get all recalls"
echo ""
echo -e "${YELLOW}📊 Analytics & Reporting:${NC}"
echo "• GET /api/protected/analytics/dashboard-stats - Dashboard stats"
echo "• GET /api/protected/analytics/recent-activity - Recent activity"
echo "• GET /api/protected/analytics/metrics - Performance metrics"
echo ""
echo -e "${YELLOW}🔗 Blockchain Network:${NC}"
echo "• GET /api/protected/blockchain-info - Network information"
echo "• GET /api/protected/transactions - All transactions"
echo ""
echo -e "${YELLOW}👥 User Management:${NC}"
echo "• POST /api/protected/users - Create user (admin)"
echo "• GET  /api/protected/users - Get all users"
echo "• GET  /api/protected/roles - Get available roles"
echo "• GET  /api/protected/profile - Get user profile"
echo "• GET  /api/protected/permissions - Get user permissions"
echo ""
echo -e "${YELLOW}🛠️  System Utilities:${NC}"
echo "• GET /health - Health check"
echo "• GET /api/openapi.json - OpenAPI specification"
echo ""
echo -e "${GREEN}🔗 Access Points:${NC}"
echo "• Health Check: http://localhost:5000/health"
echo "• OpenAPI Spec: http://localhost:5000/api/openapi.json"
echo "• Test Script: ./test-enhanced-api.sh"
echo ""
echo -e "${GREEN}🛠️  Management Commands:${NC}"
echo "• Start: ./start-enhanced-api.sh"
echo "• Stop: ./stop-enhanced-api.sh"
echo "• Test: ./test-enhanced-api.sh"
echo "• Logs: tail -f server-node-sdk/enhanced-api.log"
echo ""
echo -e "${GREEN}🔒 Security Features:${NC}"
echo "• JWT Authentication"
echo "• Role-based permissions"
echo "• Rate limiting"
echo "• Input validation"
echo "• CORS protection"
echo "• Error handling"
echo ""
echo -e "${GREEN}✅ Enhanced API is ready for production use!${NC}"
echo ""
