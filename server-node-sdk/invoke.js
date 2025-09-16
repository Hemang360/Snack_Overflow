'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

const invokeTransaction = async (fcn, args, userID) => {

    const orgID = 'Org1';
    const channelName = 'mychannel';
    const chaincodeName = 'ehrChainCode';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples','test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const identity = await wallet.get(userID);
    if (!identity) {
        console.log(`An identity for the user ${userID} does not exist in the wallet`);
        console.log('Run the registerUser.js application before retrying');
        return {
            statusCode: 200,
            status: false,
            message: `An identity for the user ${userID} does not exist.`
        };
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    console.log("arguments at invoke: ", JSON.stringify(args))
    // Submit transaction with a single stringified JSON object
    let result = await contract.submitTransaction(fcn, JSON.stringify(args));

    console.log(`Response from ${fcn} chaincode: ${result.toString()}`);

    gateway.disconnect();

    // Try to parse result as JSON, if it fails return as string
    try {
        return JSON.parse(result.toString());
    } catch (e) {
        return result.toString();
    }
}

module.exports = {
    invokeTransaction
};