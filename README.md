# 🌿 Herb Abhilekh - Blockchain Traceability System

A production-ready blockchain-based traceability system for Ayurvedic herbs and products, ensuring authenticity and quality from farm to consumer.

## 🎯 Problem Solved

This system addresses the fragmented Ayurvedic herbal supply chain by providing:
- **Immutable blockchain records** of every step from collection to consumer
- **Geo-tagged collection events** with GPS validation
- **Automated quality testing** with pass/fail logic
- **Consumer verification** via QR codes and SMS gateway
- **Comprehensive analytics** and compliance reporting

## 🚀 Quick Start


API available at: `http://localhost:3000`

## 🔑 Demo Credentials
- **Username**: `demo`
- **Password**: `demo123`
- **Role**: Super Administrator

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - User logout

### Core Operations
- `POST /api/protected/collection-events` - Create collection event
- `GET /api/protected/collection-events` - List collection events
- `POST /api/protected/quality-tests` - Create quality test
- `GET /api/protected/quality-tests` - List quality tests
- `POST /api/protected/product-batches` - Create product batch
- `GET /api/protected/product-batches` - List product batches

### Analytics & Verification
- `GET /api/protected/analytics` - Dashboard analytics
- `POST /api/sms-webhook` - SMS verification
- `GET /api/protected/traceability/:batchId` - Full traceability chain




## 🏗️ Architecture

- **Express.js** API server with validation layer
- **Role-based access control** (RBAC) with 12 user roles
- **Blockchain integration** (Hyperledger Fabric + mock mode)
- **Comprehensive validation** and error handling
- **RESTful API** design with OpenAPI documentation

## 🔗 Blockchain Features


### Smart Contract Functions
- ✅ `RecordCollectionEvent` - Geo-tagged herb collection
- ✅ `RecordQualityTest` - Laboratory quality testing with pass/fail logic
- ✅ `RecordProcessingStep` - Processing and handling steps
- ✅ `CreateProductBatch` - Product batch creation with QR codes
- ✅ `GetFullTraceability` - Complete supply chain traceability
- ✅ `QueryCollectionsBySpecies` - Species-based queries with date ranges
- ✅ `QueryQualityTestsByLab` - Lab-specific quality test queries

### Real Certificates and Ledger
When running in production mode (`MOCK_BLOCKCHAIN=false`):
- ✅ **Real X.509 certificates** for identity management
- ✅ **Persistent ledger** stored on Hyperledger Fabric network
- ✅ **Immutable transactions** with cryptographic proof
- ✅ **Multi-peer consensus** for transaction validation
- ✅ **Certificate Authority (CA)** integration for user enrollment

## 📋 Environment Variables

Create a `.env` file based on `env.example`:

```bash


# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Blockchain Configuration
MOCK_BLOCKCHAIN=false
CONNECTION_PROFILE=./fabric-config/connection-org1.json
CHANNEL_NAME=ayurvedicchannel
CONTRACT_NAME=ayurvedic-traceability
WALLET_PATH=./wallet
IDENTITY=appUser
MSP_ID=Org1MSP

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production

# API Configuration
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🎯 Key Features

### 1. **Complete Traceability Chain**
- Farm collection with GPS coordinates
- Processing steps (cleaning, drying, grinding)
- Quality testing with automated pass/fail
- Product batch creation with QR codes
- Consumer verification

### 2. **Multi-Role Access Control**
- **Farmers**: Record collection events
- **Processors**: Record processing steps
- **Lab Technicians**: Record quality tests
- **Manufacturers**: Create product batches
- **Consumers**: Verify products via QR codes
- **Regulators**: Access compliance reports

### 3. **Consumer-Facing Features**
- QR code generation for each batch
- SMS verification for rural areas
- Web portal for product verification
- Interactive traceability maps

### 4. **Analytics & Reporting**
- Dashboard with key metrics
- Compliance reporting
- CSV data export
- Real-time activity monitoring

## 📖 Documentation

- **OpenAPI Spec**: `/api/openapi.json`
- **Health Check**: `/health`
- **API Config**: `/api/config`

## 🎯 Ready for Frontend Development

This API is production-ready for:
- **React/TypeScript** web dashboard
- **Kotlin** mobile application
- **Third-party integrations**
