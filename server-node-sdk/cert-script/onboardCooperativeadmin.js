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
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get('cooperativeAdmin');
        if (identity) {
            console.log('An identity for the cooperativeAdmin user already exists in the wallet. Delete the wallet directory to re-enroll.');
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });

        // Register the cooperativeAdmin user with the 'cooperative' role
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'cooperativeAdmin',
            role: 'client',
            attrs: [{ name: 'role', value: 'cooperative', ecert: true }, { name: 'uuid', value: 'cooperativeAdmin', ecert: true }]
        }, enrollment.signer);

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('cooperativeAdmin', x509Identity);
        console.log('Successfully enrolled cooperativeAdmin user and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll cooperativeAdmin: ${error}`);
        process.exit(1);
    }
}

main();
