




/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the cooperative.
        const userIdentity = await wallet.get('Cooperative01');
        if (userIdentity) {
            console.log('An identity for the cooperative "Cooperative01" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('Admin identity not found. Run registerOrg1Admin.js first.');
            return;
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the cooperative, enroll the cooperative, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'Cooperative01',
            role: 'client',
            attrs: [
                { name: 'role', value: 'cooperative', ecert: true },
                { name: 'uuid', value: 'Cooperative01', ecert: true }
            ],
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: 'Cooperative01',
            enrollmentSecret: secret,
            attr_reqs: [
                { name: "role", optional: false },
                { name: "uuid", optional: false }
            ]
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('Cooperative01', x509Identity);
        console.log('Successfully registered and enrolled cooperative "Cooperative01" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to register cooperative "Cooperative01": ${error}`);
        process.exit(1);
    }
}

main();
