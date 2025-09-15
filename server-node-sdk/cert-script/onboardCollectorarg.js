


/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Check for command-line arguments
        const newCollectorName = process.argv[2];
        if (!newCollectorName) {
            console.error('Error: Please provide a name for the new collector.');
            console.log('Usage: node onboardCollectorarg.js <name>');
            process.exit(1);
        }

        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the cooperativeAdmin user.
        const adminIdentity = await wallet.get('cooperativeAdmin');
        if (!adminIdentity) {
            console.log('An identity for the cooperativeAdmin user "cooperativeAdmin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Determine the next available collector ID
        let collectorIdFound = false;
        let collectorId = '';
        let counter = 1;
        while (!collectorIdFound) {
            const potentialId = `Collector-${newCollectorName.toLowerCase()}${counter}`;
            const identity = await wallet.get(potentialId);
            if (!identity) {
                collectorId = potentialId;
                collectorIdFound = true;
            } else {
                counter++;
            }
        }

        console.log(`Using new Collector ID: ${collectorId}`);

        // Build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'cooperativeAdmin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: collectorId,
            role: 'client',
            attrs: [{ name: 'role', value: 'collector', ecert: true }, { name: 'uuid', value: collectorId, ecert: true }],
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: collectorId,
            enrollmentSecret: secret,
            attr_reqs: [{ name: "role", optional: false }, { name: "uuid", optional: false }]
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(collectorId, x509Identity);
        console.log(`Successfully registered and enrolled collector user "${collectorId}" and imported it into the wallet`);

        // Create a new gateway and connect to the network.
        const gateway = new Gateway();
        // Use the newly created identity (collectorId) to connect
        await gateway.connect(ccp, { wallet, identity: collectorId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network and contract.
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        const args = {
            collectorId: collectorId,
            cooperativeName: "Cooperative01-ABC",
            name: newCollectorName,
            city: "Pune"
        };

        const res = await contract.submitTransaction('onboardCollector', JSON.stringify(args));
        console.log("\n === Onboard Collector success === \n", res.toString());

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to onboard collector: ${error}`);
        process.exit(1);
    }
}

main();
