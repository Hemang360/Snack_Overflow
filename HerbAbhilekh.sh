
#!/bin/bash
set -e

# runs  Herb Abhilekh (Hopefully )  //GOD WORK DAMN IT


FABRIC_PATH="${PWD}/fabric-samples/test-network"
API_PATH="${PWD}/server-node-sdk"
FRONTEND_PATH="${PWD}/frontend"  # need to update this ppath after new frontend works # maybe this is the issue

echo "will it work...?"


# Install on recloning aftreeeer fuckup/ change
cd "$API_PATH" && npm install
cd "$FRONTEND_PATH" && npm install
cd "${PWD}"

#  doesnt work ? not needed?
#pkill -f "enhanced-api.js" || true
#pkill -f "vite" || true

# Start blockchain | idk what hyperledger is written in, its not human language for sure, where tf is the error
cd "$FABRIC_PATH"
if ! docker ps | grep -q "peer0.org1.example.com"; then
    ./network.sh up createChannel -ca -s couchdb         # couchdb works sometimes, sometimes no, .. depends on ai fuckup
fi

# deploy chaincode
if ! docker ps | grep -q "herbTraceability"; then
    ./network.sh deployCC -ccn herbTraceability -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
fi
cd "${PWD}"

# Register admins
cd "$API_PATH"
node cert-script/registerOrg1Admin.js || true  #it works?
node cert-script/registerOrg2Admin.js || true # this does work

# Start API / useles shit
cd "$API_PATH"
[ ! -f ".env" ] && echo "PORT=5000" > .env
nohup node enhanced-api.js > enhanced-api.log 2>&1 &  #this seems fucked up after latest chaincode change
sleep 5

# Start frontend
cd "$FRONTEND_PATH"
nohup npm start > frontend.log 2>&1 &   #yea, these logs dont work currently
sleep 5

cd "${PWD}"
echo "Herb Abhilekh running!  OR I AM STILL DILLUTIONAL"
echo "Frontend: http://localhost:8080"
echo "API:      http://localhost:5000"










#To test network.

#$ cd fabric-samples/test-network
#$ ./network.sh up

#$ docker ps    // to check running container or check in docker desktop

#$ ./network.sh down     // to down network

#to run network with ca and create mychannel

#$ cd fabric-samples/test-network

#Create network with ca cert:

#$ ./network.sh up createChannel -ca -s couchdb

#Chain code deployment command

 #   Deploy chain code

 #   $ ./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

# igf need to down the network

   # $ ./network.sh down

#Register Admin

#$ cd server-node-sdk/
#$ node cert-script/registerOrg1Admin.js
#$ node cert-script/registerOrg2Admin.js
