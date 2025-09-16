#!/bin/bash

# Herb Traceability Blockchain Deployment Script
# This script sets up the Hyperledger Fabric network and deploys the herb traceability chaincode

set -e

echo "🌿 Herb Traceability Blockchain Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v14 or higher)."
        exit 1
    fi
    
    print_info "All prerequisites met ✓"
}

# Stop any running containers
cleanup() {
    print_info "Cleaning up previous deployment..."
    cd fabric-samples/test-network
    ./network.sh down || true
    cd ../..
    docker ps -aq | xargs -r docker stop || true
    docker ps -aq | xargs -r docker rm || true
    docker volume prune -f || true
    print_info "Cleanup complete ✓"
}

# Download Fabric binaries if not present
download_fabric() {
    if [ ! -d "fabric-samples/bin" ]; then
        print_info "Downloading Hyperledger Fabric..."
        ./install-fabric.sh
    else
        print_info "Fabric binaries already present ✓"
    fi
}

# Start the test network
start_network() {
    print_info "Starting Hyperledger Fabric test network..."
    cd fabric-samples/test-network
    
    # Start network with CouchDB
    ./network.sh up createChannel -ca -s couchdb
    
    # Verify network is running
    if docker ps | grep -q "hyperledger/fabric-peer"; then
        print_info "Network started successfully ✓"
    else
        print_error "Failed to start network"
        exit 1
    fi
    
    cd ../..
}

# Deploy chaincode
deploy_chaincode() {
    print_info "Deploying herb traceability chaincode..."
    cd fabric-samples/test-network
    
    # Deploy the chaincode
    ./network.sh deployCC -ccn herbTraceability -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
    
    if [ $? -eq 0 ]; then
        print_info "Chaincode deployed successfully ✓"
    else
        print_error "Failed to deploy chaincode"
        exit 1
    fi
    
    cd ../..
}

# Register admins
register_admins() {
    print_info "Registering network administrators..."
    cd server-node-sdk
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing Node.js dependencies..."
        npm install
    fi
    
    # Register Org1 Admin (Farmers/Collectors organization)
    print_info "Registering Farmers/Collectors organization admin..."
    node cert-script/registerOrg1Admin.js || print_warning "Org1 admin may already be registered"
    
    # Register Org2 Admin (Labs organization)
    print_info "Registering Labs organization admin..."
    node cert-script/registerOrg2Admin.js || print_warning "Org2 admin may already be registered"
    
    cd ..
    print_info "Admin registration complete ✓"
}

# Initialize ledger with zones and species
initialize_ledger() {
    print_info "Initializing ledger with approved zones and species..."
    cd server-node-sdk
    
    # Create a temporary script to initialize the ledger
    cat > init-ledger.js << 'EOF'
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('Admin identity does not exist in the wallet');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('herbTraceability');

        console.log('Initializing ledger...');
        await contract.submitTransaction('initLedger');
        console.log('Ledger initialized successfully!');

        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to initialize ledger: ${error}`);
    }
}

main();
EOF

    node init-ledger.js
    rm init-ledger.js
    
    cd ..
    print_info "Ledger initialization complete ✓"
}

# Start API server
start_api() {
    print_info "Starting API server..."
    cd server-node-sdk
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=change-this-secret-in-production
EOF
        print_info "Created .env file"
    fi
    
    # Start the API server in background
    print_info "Starting herb traceability API on port 5000..."
    nohup npm start > api.log 2>&1 &
    echo $! > api.pid
    
    sleep 5
    
    # Check if API is running
    if curl -s http://localhost:5000/health > /dev/null; then
        print_info "API server started successfully ✓"
    else
        print_error "Failed to start API server. Check api.log for details."
        exit 1
    fi
    
    cd ..
}

# Start consumer portal
start_portal() {
    print_info "Starting consumer portal..."
    cd consumer-portal
    
    # Start a simple HTTP server
    print_info "Starting consumer portal on port 8080..."
    python3 -m http.server 8080 > portal.log 2>&1 &
    echo $! > portal.pid
    
    cd ..
    print_info "Consumer portal started ✓"
}

# Main deployment flow
main() {
    echo ""
    print_info "Starting deployment process..."
    echo ""
    
    check_prerequisites
    cleanup
    download_fabric
    start_network
    deploy_chaincode
    register_admins
    initialize_ledger
    start_api
    start_portal
    
    echo ""
    print_info "🎉 Deployment complete!"
    echo ""
    echo "================================================"
    echo "Services running:"
    echo "  - Blockchain Network: http://localhost:7051"
    echo "  - API Server: http://localhost:5000"
    echo "  - API Health Check: http://localhost:5000/health"
    echo "  - Consumer Portal: http://localhost:8080"
    echo "================================================"
    echo ""
    print_info "To stop all services, run: ./stop.sh"
    print_info "To view API logs: tail -f server-node-sdk/api.log"
    echo ""
}

# Run main function
main
