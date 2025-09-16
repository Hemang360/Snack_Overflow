




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

        // 1. Enroll the CA admin to get a valid identity for registration
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user and imported it into the wallet.');
        }

        const adminUserIdentity = await wallet.get('admin');
        const provider = wallet.getProviderRegistry().getProvider(adminUserIdentity.type);
        const adminUser = await provider.getUserContext(adminUserIdentity, 'admin');

        // 2. Register the cooperativeAdmin user using the enrolled admin as the "registrar"
        const cooperativeAdminIdentity = await wallet.get('cooperativeAdmin');
        if (cooperativeAdminIdentity) {
            console.log('An identity for the cooperativeAdmin user already exists. Proceeding without re-registering.');
        } else {
            console.log('Registering cooperativeAdmin with the "cooperative" role...');
            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: 'cooperativeAdmin',
                role: 'client',
                attrs: [{ name: 'role', value: 'cooperative', ecert: true }, { name: 'uuid', value: 'cooperativeAdmin', ecert: true }]
            }, adminUser);

            const enrollment = await ca.enroll({ enrollmentID: 'cooperativeAdmin', enrollmentSecret: secret });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
            await wallet.put('cooperativeAdmin', x509Identity);
            console.log('Successfully registered and enrolled cooperativeAdmin user and imported it into the wallet.');
        }
    } catch (error) {
        console.error(`Failed to enroll cooperativeAdmin: ${error}`);
        process.exit(1);
    }
}

main();
