/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Check for command-line arguments
        const assetId = process.argv[2];
        if (!assetId) {
            console.error('Error: Please provide an asset ID to query.');
            console.log('Usage: node queryHistoryOfAsset.js <assetId>');
            process.exit(1);
        }

        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if an identity exists for the user.
        // We'll use 'Cooperative01' which should have read permissions.
        const userId = 'Cooperative01';
        const identity = await wallet.get(userId);
        if (!identity) {
            console.log(`An identity for the user "${userId}" does not exist in the wallet.`);
            console.log('Run the enroll user script for this identity before retrying.');
            return;
        }

        // Create a new gateway and connect to the network.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network and contract.
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        // Define the arguments for the transaction
        const args = {
            assetId: assetId
        };

        // Evaluate the transaction (read-only query)
        console.log(`\n--> Evaluating transaction 'queryHistoryOfAsset' with asset ID: ${assetId}`);
        const result = await contract.evaluateTransaction('queryHistoryOfAsset', JSON.stringify(args));
        console.log("\n === Query History of Asset success === \n");
        console.log(JSON.parse(result.toString()));

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to query asset history: ${error}`);
        process.exit(1);
    }
}

main();
