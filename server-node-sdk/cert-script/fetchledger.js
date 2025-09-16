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
        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the cooperativeAdmin user.
        const userId = 'cooperativeAdmin';
        const identity = await wallet.get(userId);
        if (!identity) {
            console.log(`An identity for the user "${userId}" does not exist in the wallet.`);
            console.log('Run the enrollAdmin.js application before retrying.');
            return;
        }

        // Create a new gateway and connect to the network using the cooperativeAdmin identity.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network and contract.
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        // Evaluate the transaction (read-only query) to fetch all assets
        console.log(`\n--> Evaluating transaction 'fetchLedger'`);
        const result = await contract.evaluateTransaction('fetchLedger');
        console.log("\n === Fetch Ledger success === \n");
        console.log(JSON.parse(result.toString()));

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to fetch ledger: ${error}`);
        process.exit(1);
    }
}

main();
