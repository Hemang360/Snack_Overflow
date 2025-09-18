# Herb AbhiLekh 

This is the blockchain branch of the project which hosts the blockchain + current working apis for backend to acess into the ChainCode.
## Getting started with Herb AbhiLekh

Herb AbhiLekh is a Decentralized ledger and logging system which bridges the gap between having a lalrge supply chain and a regulated supply chain. 
The disconnect between the thousands of different hospitals, dispensaries, manufacturers, and source of  supply chain , the herb-collectors/farmers.
A farmer who is the source of the ingredients for our product creation is soo far removed from the consumers, consumers have no idea about "autenticity", 
"truthfulness" and "company - integraty" of the product. 


Adultration and greed is the root of a compromised supply chain which our product aims to rewrite in the eyes of public the nature of ayurveda production.



We have used Hyperledger fabric blockchain architecture to create a permissed ledger. Using smart-contracts as a validation method to keep a barrier for 
malicious intents and purposes. 



We have used the fabric-samples directory given by official hyperledger fabric to setup the network and used the Chaincode to create a chain-of-proof events of herb transport and processing.





## Tech stack

    - Hyperledger Fabric blockchain (Node SDK JavaScript)
    - Node.js
    - Next.js
    - React
    - TypeScript
    - Android Studio
    
# Steps to setup project

## Download fabric binarys and fabric sample repo

    $ ./install-fabric.sh 

## To test network 
    $ docker ps    // to check running container or check in docker desktop
    
    $ cd fabric-samples/test-network // contians the neccesary files, scripts and certificates to setup faric netowork
    $ ./network.sh down     // to down network

## to run network and deploy chaincode

    From the root directory
    
    $ ./HerbAbhilekh.sh
 
 

### API List
 
### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- [x] `POST /api/auth/logout` - User logout

### Core Operations
- `POST /api/protected/collection-events` - Create collection event
- `GET /api/protected/collection-events` - List collection events
- `POST /api/protected/quality-tests` - Create quality test
- `GET /api/protected/quality-tests` - List quality tests
- `POST /api/protected/product-batches` - Create product batch
- `GET /api/protected/product-batches` - List product batches


- `GET /api/public/qr/:qrCode` - QR code lookup (public)


### Api responses 

POST /api/auth/login
Content-Type: application/json

{
  "username": "farmer_john",
  "password": "secure123"
}

Response:
{
  "success": true,
  "user": { "id": "...", "username": "farmer_john", "role": "collector" },
  "token": "jwt_token_here",
  "permissions": [...]
}

etc.....

## chaincode logic

    - lets first understand the actors in our chaincode

    1. Goverment - network owner
    2. Hospital - Network orgination 
    3. Practicing physician / Doctor - member of hospital
    4. Diagnostics center - org OR peer of hospital
    5. Pharmacies - Org OR peer of hospital
    6. Researchers / R&D - org
    7. Insurance companies - org
    8. Patient - end user


   ## now lets see there read write access

        1. Goverment - network owner - admin access
        2. Hospital - Network orgination - Read/Write (doctor data)
        3. Practicing physician/Doctor - Read/Write (Patient data w.r.t to hospital)
        4. Diagnostics center - Read/Write (Patient records w.r.t to diagnostics center)
        5. Pharmacies - Read/Write (Patient prescriptions w.r.t to pharma center)
        6. Researchers / R&D - Read data of hospital conect, pateint based on consent. 
        7. Insurance companies - Read/Write (Patient claims)
        8. Patient - Read/Write (All generated patient data)



### Environment Variables 
  
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

  
  
  
