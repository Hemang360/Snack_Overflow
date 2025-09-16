





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
        const newHerbbatchName = process.argv[2];
        if (!newHerbbatchName) {
            console.error('Error: Please provide a name for the new herbbatch.');
            console.log('Usage: node onboardHerbbatch.js <name>');
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

        // Determine the next available herbbatch ID
        let herbbatchIdFound = false;
        let herbbatchId = '';
        let counter = 1;
        while (!herbbatchIdFound) {
            const potentialId = `Herbbatch-${newHerbbatchName.toLowerCase()}${counter}`;
            const identity = await wallet.get(potentialId);
            if (!identity) {
                herbbatchId = potentialId;
                herbbatchIdFound = true;
            } else {
                counter++;
            }
        }

        console.log(`Using new Herbbatch ID: ${herbbatchId}`);

        // Build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'cooperativeAdmin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: herbbatchId,
            role: 'client',
            attrs: [{ name: 'role', value: 'herbbatch', ecert: true }, { name: 'uuid', value: herbbatchId, ecert: true }],
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: herbbatchId,
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
        await wallet.put(herbbatchId, x509Identity);
        console.log(`Successfully registered and enrolled herbbatch user "${herbbatchId}" and imported it into the wallet`);

        // Create a new gateway and connect to the network.
        const gateway = new Gateway();
        // Use the CooperativeAdmin identity to submit the transaction.
        await gateway.connect(ccp, { wallet, identity: 'cooperativeAdmin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network and contract.
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        const args = {
            herbbatchId: herbbatchId,
            name: newHerbbatchName,
            dob: "1991-05-15",
            city: "Mumbai"
        };

        const res = await contract.submitTransaction('onboardHerbbatch', JSON.stringify(args));
        console.log("\n === Onboard Herbbatch success === \n", res.toString());

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to onboard herbbatch: ${error}`);
        process.exit(1);
    }
}

main();
