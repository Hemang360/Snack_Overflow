#!/bin/bash

# Herb Abhilekh - Simple Startup Script
# Starts the complete Herb Abhilekh Traceability System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/home/hemang/Snack_Overflow"
FABRIC_PATH="$PROJECT_ROOT/fabric-samples/test-network"
API_PATH="$PROJECT_ROOT/server-node-sdk"
FRONTEND_PATH="$PROJECT_ROOT/frontend"

print_header() {
    echo -e "${GREEN}"
    echo "Herb Abhilekh - Blockchain Traceability System"
    echo -e "${NC}"
}

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

check_dependencies() {
    log "Checking dependencies..."
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install Docker Compose."
    fi
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    log "All dependencies are available"
}

install_dependencies() {
    log "Installing Node.js dependencies..."
    if [ -f "$API_PATH/package.json" ]; then
        log "Installing API dependencies..."
        cd "$API_PATH"
        npm install --silent
    fi
    if [ -f "$FRONTEND_PATH/package.json" ]; then
        log "Installing frontend dependencies..."
        cd "$FRONTEND_PATH"
        npm install --silent
    fi
    
    cd "$PROJECT_ROOT"
    log "Dependencies installed"
}

cleanup_existing() {
    log "Cleaning up any existing processes..."
    pkill -f "enhanced-api.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    rm -f "$API_PATH"/*.pid
    rm -f "$FRONTEND_PATH"/*.pid
    log "Cleanup completed"
}

start_blockchain() {
    log "Starting Hyperledger Fabric network..."
    cd "$FABRIC_PATH"
    if docker ps | grep -q "peer0.org1.example.com"; then
        log "Blockchain network is already running"
    else
        ./network.sh up createChannel -ca
        if [ $? -eq 0 ]; then
            log "Blockchain network started successfully"
        else
            error "Failed to start blockchain network"
        fi
    fi
    
    cd "$PROJECT_ROOT"
}

deploy_chaincode() {
    log "Deploying herb traceability chaincode..."
    cd "$FABRIC_PATH"
    if docker ps | grep -q "herbTraceability"; then
        log "✓ Chaincode is already deployed"
    else
        ./network.sh deployCC -ccn herbTraceability -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
        if [ $? -eq 0 ]; then
            log "Chaincode deployed successfully"
        else
            error "Failed to deploy chaincode"
        fi
    fi
    
    cd "$PROJECT_ROOT"
}

register_admins() {
    log "Registering network administrators..."
    cd "$API_PATH"
    if [ -f "cert-script/registerOrg1Admin.js" ]; then
        node cert-script/registerOrg1Admin.js 2>/dev/null || log "✓ Org1 admin already registered"
    fi
    if [ -f "cert-script/registerOrg2Admin.js" ]; then
        node cert-script/registerOrg2Admin.js 2>/dev/null || log "✓ Org2 admin already registered"
    fi
    
    log "Administrators registered"
    cd "$PROJECT_ROOT"
}

start_api() {
    log "Starting API server..."
    cd "$API_PATH"
    if [ ! -f ".env" ]; then
        echo "PORT=5000" > .env
        echo "NODE_ENV=development" >> .env
        echo "JWT_SECRET=your-secret-key-here-$(date +%s)" >> .env
    fi
    
    nohup node enhanced-api.js > enhanced-api.log 2>&1 &
    API_PID=$!
    echo $API_PID > enhanced-api.pid
    log "Waiting for API server to initialize..."
    for i in {1..10}; do
        sleep 2
        if curl -s http://localhost:5000/health > /dev/null 2>&1; then
            log "API server started successfully (PID: $API_PID)"
            log "API available at: http://localhost:5000"
            break
        fi
        if [ $i -eq 10 ]; then
            error "API server failed to start within 20 seconds"
        fi
    done
    
    cd "$PROJECT_ROOT"
}

start_frontend() {
    log "Starting HTML frontend..."
    cd "$FRONTEND_PATH"
    nohup npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    log "Waiting for frontend to initialize..."
    for i in {1..15}; do
        sleep 2
        if curl -s http://localhost:8080 > /dev/null 2>&1; then
            log "Frontend started successfully (PID: $FRONTEND_PID)"
            log "Frontend available at: http://localhost:8080"
            break
        fi
        if [ $i -eq 15 ]; then
            error "Frontend failed to start within 30 seconds"
        fi
    done
    
    cd "$PROJECT_ROOT"
}

verify_system() {
    log "Verifying system health..."
    if docker ps | grep -q "peer0.org1.example.com"; then
        log "Blockchain network is running"
    else
        warn "Blockchain network may not be running properly"
    fi
    if curl -s http://localhost:5000/health | grep -q "healthy\|ok"; then
        log "API server is healthy"
    else
        warn "API server may not be responding properly"
    fi
    
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        log "Frontend is accessible"
    else
        warn "Frontend may not be accessible"
    fi
}

show_final_status() {
    echo ""
    echo -e "${BLUE}=================================================="
    echo "Herb Abhilekh System is now running!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${GREEN}Frontend:${NC} http://localhost:8080"
    echo -e "${GREEN}API:${NC} http://localhost:5000"
    echo -e "${GREEN}Health Check:${NC} http://localhost:5000/health"
    echo -e "${GREEN}API Docs:${NC} http://localhost:5000/api/openapi.json"
    echo ""
    echo -e "${YELLOW}Quick Start:${NC}"
    echo "   1. Open http://localhost:8080 in your browser"
    echo "   2. Select your role (Collector, Lab, Manufacturer, Admin)"
    echo "   3. Register a new account or login"
    echo "   4. Start using the blockchain traceability system!"
    echo ""
    echo -e "${BLUE}Logs:${NC}"
    echo "   • API logs: $API_PATH/enhanced-api.log"
    echo "   • Frontend logs: $FRONTEND_PATH/frontend.log"
    echo ""
    echo -e "${GREEN}System ready for use!${NC}"
    echo ""
}

print_header
log "Starting Herb Abhilekh system..."
echo ""
check_dependencies
install_dependencies
cleanup_existing
start_blockchain
deploy_chaincode
register_admins
start_api
start_frontend
verify_system
show_final_status
