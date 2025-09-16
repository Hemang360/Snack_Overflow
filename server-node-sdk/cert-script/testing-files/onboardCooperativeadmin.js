








/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the cooperativeAdmin user.
        const userIdentity = await wallet.get('cooperativeAdmin');
        if (userIdentity) {
            console.log('An identity for the user "cooperativeAdmin" already exists in the wallet');
            return;
        }

        // Get the main admin identity to register the new user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the "admin" user does not exist in the wallet');
            console.log('Run registerOrg1Admin.js application before retrying');
            return;
        }

        // Build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the cooperativeAdmin user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'cooperativeAdmin',
            role: 'client',
            attrs: [{ name: 'role', value: 'cooperative', ecert: true }, { name: 'uuid', value: 'cooperativeAdmin', ecert: true }]
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: 'cooperativeAdmin',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('cooperativeAdmin', x509Identity);
        console.log('Successfully registered and enrolled user "cooperativeAdmin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "cooperativeAdmin": ${error}`);
        process.exit(1);
      }
}

main();
