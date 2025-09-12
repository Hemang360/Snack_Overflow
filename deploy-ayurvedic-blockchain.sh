#!/bin/bash
# deploy-ayurvedic-blockchain.sh
set -euo pipefail

echo "🌿 Ayurvedic Blockchain Deployment Script"
echo "======================================="

# Set environment variables
export CHANNEL_NAME="ayurvedicchannel"
export CC_NAME="ayurvedic-traceability"
export CC_VERSION="1.0"
export CC_SEQUENCE="1"
export FABRIC_TOOLS_IMAGE=${FABRIC_TOOLS_IMAGE:-hyperledger/fabric-tools:2.4}
ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
WORK_DIR="$(pwd)"

# Ensure directories
mkdir -p system-genesis-block channel-artifacts organizations

# Helper to run fabric tools container
run_tools() {
	docker run --rm \
		-v "$WORK_DIR":/workspace \
		-w /workspace \
		-e FABRIC_CFG_PATH=/workspace \
		$FABRIC_TOOLS_IMAGE "$@"
}

# Step 1: Generate crypto material
echo "📋 Step 1: Generating crypto material..."
run_tools cryptogen generate --config=./organizations/cryptogen/crypto-config-farmers.yaml --output=organizations
run_tools cryptogen generate --config=./organizations/cryptogen/crypto-config-collectors.yaml --output=organizations
run_tools cryptogen generate --config=./organizations/cryptogen/crypto-config-labs.yaml --output=organizations
run_tools cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output=organizations

# Step 2: Generate genesis block
echo "🧱 Step 2: Generating genesis block..."
run_tools configtxgen -profile AyurvedicGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# Step 3: Create channel configuration
echo "📺 Step 3: Creating channel configuration..."
run_tools configtxgen -profile AyurvedicChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME

# Step 4: Start the network (orderer + peer + api)
echo "🚀 Step 4: Starting the network..."
docker compose -f docker-compose.yaml up -d orderer.ayurvedic.com peer0.farmers.ayurvedic.com

# Wait for network to be ready
echo "⏰ Waiting for network to initialize..."
sleep 10

# Step 5-11 require env for peer CLI
export CORE_PEER_LOCALMSPID=FarmersOrgMSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/farmers.ayurvedic.com/users/Admin@farmers.ayurvedic.com/msp
export CORE_PEER_ADDRESS=peer0.farmers.ayurvedic.com:7051
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/farmers.ayurvedic.com/peers/peer0.farmers.ayurvedic.com/tls/ca.crt

# Step 5: Create channel
echo "📺 Step 5: Creating channel..."
run_tools peer channel create -o orderer.ayurvedic.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CHANNEL_NAME}.tx --tls \
	--cafile /workspace/organizations/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/msp/tlscacerts/tlsca.ayurvedic.com-cert.pem \
	--outputBlock /workspace/channel-artifacts/${CHANNEL_NAME}.block

# Step 6: Join peers to channel
echo "🔗 Step 6: Joining peers to channel..."
run_tools bash -lc "export CORE_PEER_LOCALMSPID=$CORE_PEER_LOCALMSPID; export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH; export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS; export CORE_PEER_TLS_ENABLED=$CORE_PEER_TLS_ENABLED; export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE; peer channel join -b /workspace/channel-artifacts/${CHANNEL_NAME}.block"

# Step 7: Package chaincode
echo "📦 Step 7: Packaging chaincode..."
run_tools peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ./chaincode/ayurvedic-traceability/ --lang node --label ${CC_NAME}_${CC_VERSION}

# Step 8: Install chaincode
echo "⚙️ Step 8: Installing chaincode..."
run_tools bash -lc "export CORE_PEER_LOCALMSPID=$CORE_PEER_LOCALMSPID; export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH; export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS; export CORE_PEER_TLS_ENABLED=$CORE_PEER_TLS_ENABLED; export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE; peer lifecycle chaincode install /workspace/${CC_NAME}.tar.gz"

# Get package ID
export PACKAGE_ID=$(run_tools bash -lc "peer lifecycle chaincode queryinstalled --output json" | jq -r ".installed_chaincodes[0].package_id")

# Step 9: Approve chaincode
echo "✅ Step 9: Approving chaincode..."
run_tools bash -lc "export CORE_PEER_LOCALMSPID=$CORE_PEER_LOCALMSPID; export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH; export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS; export CORE_PEER_TLS_ENABLED=$CORE_PEER_TLS_ENABLED; export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE; peer lifecycle chaincode approveformyorg -o orderer.ayurvedic.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile /workspace/organizations/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/msp/tlscacerts/tlsca.ayurvedic.com-cert.pem"

# Step 10: Commit chaincode
echo "🎯 Step 10: Committing chaincode..."
run_tools bash -lc "peer lifecycle chaincode commit -o orderer.ayurvedic.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --tls --cafile /workspace/organizations/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/msp/tlscacerts/tlsca.ayurvedic.com-cert.pem --peerAddresses peer0.farmers.ayurvedic.com:7051 --tlsRootCertFiles /workspace/organizations/peerOrganizations/farmers.ayurvedic.com/peers/peer0.farmers.ayurvedic.com/tls/ca.crt"

# Step 11: Initialize ledger
echo "🗃️ Step 11: Initializing ledger..."
run_tools bash -lc "peer chaincode invoke -o orderer.ayurvedic.com:7050 --tls --cafile /workspace/organizations/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/msp/tlscacerts/tlsca.ayurvedic.com-cert.pem -C $CHANNEL_NAME -n $CC_NAME --peerAddresses peer0.farmers.ayurvedic.com:7051 --tlsRootCertFiles /workspace/organizations/peerOrganizations/farmers.ayurvedic.com/peers/peer0.farmers.ayurvedic.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'"

# Start API (Fabric mode)
echo "🟢 Starting API"
MOCK_BLOCKCHAIN=false docker compose -f docker-compose.yaml up -d ayurvedic-api || true

echo "✅ Deployment completed successfully!"