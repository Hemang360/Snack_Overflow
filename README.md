README

# Electronic Health Record Blockchain Platform

A decentralized Electronic Health Records (EHR) system built on Hyperledger Fabric blockchain technology, enabling secure and transparent health data management across multiple healthcare stakeholders.

## Tech Stack

- **Hyperledger Fabric** - Blockchain framework (Node SDK JavaScript)
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **Next.js** - Frontend framework
- **IPFS** - Distributed file storage
- **CouchDB** - State database

## System Architecture

### Actors and Roles

1. **Government** - Network owner with admin access
2. **Cooperatives** - Network organizations managing collectors
3. **Collectors (Doctors)** - Healthcare practitioners managing herb batch records
4. **Lab Companies** - Laboratory organizations with agents
5. **Lab Agents** - Laboratory technicians performing tests
6. **Herb Batches (Patients)** - End users owning their health records

### Access Control Matrix

| Role | Read Access | Write Access |
|------|-------------|--------------|
| Government | All records | Admin functions |
| Cooperative | Collector data | Onboard collectors |
| Collector | Authorized herb batch records | Add medical records |
| Lab Agent | Assigned test results | Add/update lab results |
| Herb Batch | Own records | Grant access permissions |

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

## Installation & Setup

### 1. Download Hyperledger Fabric

```bash
# Download fabric binaries and samples
./install-fabric.sh
```

### 2. Start the Test Network

```bash
cd fabric-samples/test-network

# Start network with Certificate Authority and create channel
./network.sh up createChannel -ca -s couchdb

# Verify containers are running
docker ps
```

### 3. Deploy Chaincode

```bash
# Deploy the EHR chaincode
./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```

### 4. Register Network Administrators

```bash
cd server-node-sdk/

# Register Org1 Admin
node cert-script/registerOrg1Admin.js

# Register Org2 Admin (for lab organization)
node cert-script/registerOrg2Admin.js
```

### 5. Onboard Initial Users

```bash
# Onboard cooperative
node cert-script/onboardCooperative01.js

# Onboard collector
node cert-script/onboardCollector.js
```

### 6. Start API Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The API server will be running on `http://localhost:5000`

## API Endpoints

### Authentication & Registration

- `POST /registerHerbbatch` - Register new herb batch (patient)
- `POST /loginHerbbatch` - Authenticate herb batch user

### Medical Records Management

- `POST /addRecord` - Add medical record (collectors only)
- `POST /getAllRecordsByHerbbatchId` - Get all records for a herb batch
- `POST /getRecordById` - Get specific medical record

### Lab Results Management

- `POST /addLabResult` - Add lab test results (lab agents only)
- `POST /getAllLabResultsByHerbbatchId` - Get all lab results for herb batch
- `POST /getLabResultById` - Get specific lab result

### Access Control

- `POST /grantAccess` - Grant collector access to herb batch records
- `POST /queryHistoryOfAsset` - Query transaction history

### Administrative

- `POST /fetchLedger` - Fetch all ledger data (admin only)
- `GET /status` - Check server status

## Example Usage

### Register a New Herb Batch (Patient)

```bash
curl -X POST http://localhost:5000/registerHerbbatch \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "cooperativeAdmin",
    "collectorId": "Collector-001",
    "userId": "HB-001",
    "name": "John Doe",
    "dob": "1990-01-01",
    "city": "New York"
  }'
```

### Add Medical Record

```bash
curl -X POST http://localhost:5000/addRecord \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "Collector-001",
    "herbbatchId": "HB-001",
    "diagnosis": "Hypertension",
    "prescription": "Lisinopril 10mg daily"
  }'
```

### Add Lab Results

```bash
curl -X POST http://localhost:5000/addLabResult \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "LabAgent-001",
    "herbbatchId": "HB-001",
    "testType": "Blood Pressure",
    "testResults": "140/90 mmHg",
    "notes": "Elevated reading"
  }'
```

## Data Structure

### Herb Batch Record
```json
{
  "herbbatchId": "HB-001",
  "name": "John Doe",
  "dob": "1990-01-01",
  "city": "New York",
  "authorizedCollectors": ["Collector-001"]
}
```

### Medical Record
```json
{
  "recordId": "R-txid123",
  "herbbatchId": "HB-001",
  "collectorId": "Collector-001",
  "diagnosis": "Hypertension",
  "prescription": "Lisinopril 10mg daily",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Lab Result
```json
{
  "labResultId": "LAB-txid456",
  "herbbatchId": "HB-001",
  "labAgentId": "LabAgent-001",
  "testType": "Blood Pressure",
  "testResults": "140/90 mmHg",
  "notes": "Elevated reading",
  "timestamp": "2024-01-01T11:00:00Z"
}
```

## Blockchain Explorer Setup (Optional)

### 1. Copy Network Configuration

```bash
cd fabric-explorer/
cp -r ../fabric-samples/test-network/organizations/ .
```

### 2. Set Environment Variables

```bash
export EXPLORER_CONFIG_FILE_PATH=./config.json
export EXPLORER_PROFILE_DIR_PATH=./connection-profile
export FABRIC_CRYPTO_PATH=./organizations
```

### 3. Start Explorer

```bash
# Start with logs
docker-compose up

# Or start in background
docker-compose up -d
```

### 4. Access Explorer

Open `http://localhost:8080` in your browser

## Stopping the Network

```bash
# Stop API server
# Press Ctrl+C in the terminal running npm run dev

# Stop blockchain explorer
cd fabric-explorer/
docker-compose down

# Stop blockchain network
cd fabric-samples/test-network/
./network.sh down
```

## Project Structure

```
├── server-node-sdk/
│   ├── app.js              # Express API server
│   ├── helper.js           # User registration utilities
│   ├── invoke.js           # Blockchain transaction functions
│   ├── query.js            # Blockchain query functions
│   └── cert-script/        # User onboarding scripts
├── fabric-samples/         # Hyperledger Fabric samples
├── fabric-explorer/        # Blockchain explorer setup
└── chaincode/
    └── ehrChainCode.js     # Smart contract logic
```

## Security Features

- **Identity Management** - Certificate-based user authentication
- **Access Control** - Role-based permissions for data access
- **Data Integrity** - Immutable blockchain ledger
- **Privacy** - Patient-controlled access permissions
- **Audit Trail** - Complete transaction history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
