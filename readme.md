# Ayurvedic Herbs Blockchain Traceability API (Backend Only)

A production-ready backend for Ayurvedic herbs traceability built on Hyperledger Fabric with an Express/Node.js API and RBAC. This repository now delivers only the backend and blockchain artifacts. Your web (React/TypeScript) and mobile (Kotlin) clients can integrate via the documented REST API.

## Table of Contents
- Overview
- Architecture
- Prerequisites
- Quick Start (API Only)
- Network & Chaincode
- API Endpoints
- Client Integration Notes
- Configuration
- Analytics & Exports
- Deployment (Docker/K8s)
- Troubleshooting

## Overview
- Blockchain: Hyperledger Fabric smart contracts for collection, quality tests, processing, batches, traceability.
- API: Node.js/Express, RBAC, analytics, CSV export.

## Architecture
- Chaincode: `chaincode/ayurvedic-traceability/lib/ayurvedic-contract.js`
  - Collection events, quality tests, processing steps
  - Batches with QR mapping, traceability graph
  - Queries: GetAllCollectionEvents, GetAllQualityTests, GetProductBatch, GetFullTraceability
- API: `api/server.js`
  - Auth, RBAC, protected routes, analytics, exports

## Prerequisites
- Docker, Docker Compose
- Node.js 16+ and npm
- Hyperledger Fabric binaries (peer/cryptogen/configtxgen)

## Quick Start (API Only)
```bash
# Install API deps
cd api && npm install

# Start API
node server.js

# Health
curl -s http://localhost:3000/health
# OpenAPI
curl -s http://localhost:3000/api/openapi.json | jq '.info'
```

If you do not have a running Fabric network yet, you can start in mock mode for development:
```bash
# Run with MOCK_BLOCKCHAIN to avoid Fabric dependency (in-memory state)
MOCK_BLOCKCHAIN=true node api/server.js
```

## Network & Chaincode
- Network config: `organizations/`, `configtx.yaml`, `docker-compose.yaml`
- Deploy helper: `deploy-ayurvedic-blockchain.sh`
- Wallet: `wallet/` should contain `appUser` identity when using real Fabric

## API Endpoints
- Health: GET `/health`
- OpenAPI: GET `/api/openapi.json`
- Public config: GET `/api/config`
- Auth:
  - POST `/api/auth/login` → `{ token, user, permissions }`
  - GET `/api/auth/me` (Bearer) → `{ user, permissions }`
  - POST `/api/auth/logout` (Bearer)
- Collections: POST/GET `/api/protected/collection-events`
- Quality: POST/GET `/api/protected/quality-tests`
- Processing: POST `/api/protected/processing-steps`
- Batches: POST `/api/protected/product-batches`, GET `/api/protected/product-batches/:batchId`
- Traceability: GET `/api/protected/traceability/:batchId`
- Analytics: GET `/api/protected/analytics/dashboard-stats`, `/api/protected/analytics/recent-activity`, `/api/protected/analytics/metrics`, `/api/protected/analytics/collection-summary`
- Reports: GET `/api/protected/reports/compliance`
- Export: GET `/api/protected/export/collection-events.csv`, `/api/protected/export/quality-tests.csv`
- Permissions: GET `/api/protected/permissions`

See the full schema at `/api/openapi.json`.

## Client Integration Notes
- Auth header: `Authorization: Bearer <token>`
- CORS: set `ALLOWED_ORIGINS` (comma-separated) for your web/mobile dev hosts
- Pagination: `page` and `pageSize` supported on list endpoints (default 1,50)
- Filtering: query parameters supported as described in `/api/openapi.json`

## Configuration
Environment variables (examples):
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
NODE_ENV=development
PORT=3000
# Real Fabric
CONNECTION_PROFILE=./organizations/peerOrganizations/farmers.ayurvedic.com/connection-farmers.json
CHANNEL_NAME=ayurvedicchannel
CONTRACT_NAME=ayurvedic-traceability
WALLET_PATH=./wallet
IDENTITY=appUser
MSP_ID=Org1MSP
# Mock mode
MOCK_BLOCKCHAIN=true
```

## Analytics & Exports
- `/api/protected/analytics/dashboard-stats`: totals, compliance rate
- `/api/protected/analytics/recent-activity`: last 50 events
- CSV exports for collections and tests, with filtering

## Deployment (Docker)
- Use `docker-compose.yaml` for Fabric and mount API as needed
- Ensure volumes for `wallet/` and connection profile are mounted

## Troubleshooting
- "Blockchain connection not available": ensure Fabric is up and wallet identity exists, or set `MOCK_BLOCKCHAIN=true`
- 401/403: verify login token and RBAC permissions
- CORS: set `ALLOWED_ORIGINS`