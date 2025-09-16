/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        // Check for command-line arguments
        const userId = process.argv[2];
        if (!userId) {
            console.error('Error: Please provide a user ID to check.');
            console.log('Usage: node checkWalletAttributes.js <userId>');
            process.exit(1);
        }

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Get the user's identity from the wallet.
        const identity = await wallet.get(userId);
        if (!identity) {
            console.log(`An identity for the user "${userId}" does not exist in the wallet.`);
            console.log('Ensure you have run an enrollment script for this user first.');
            return;
        }

        // Get the provider registry and the provider for the identity type.
        const provider = wallet.getProviderRegistry().getProvider(identity.type);

        // Get the user context, which contains the certificate details.
        const userContext = await provider.getUserContext(identity, userId);

        // The user object contains the enrollment information. Log it to inspect.
        console.log(`\nUser Identity details for: ${userId}`);
        console.log('--------------------------------------------------');
        console.log(userContext.getIdentity()._certificate);
        console.log('--------------------------------------------------');

        console.log('\nInstructions:');
        console.log('1. Copy the text between the dashed lines above.');
        console.log('2. Go to an online X.509 certificate parser (e.g., https://www.sslshopper.com/certificate-decoder.html).');
        console.log('3. Paste the copied certificate text and click "Decode".');
        console.log('4. The decoded certificate will show the attributes passed during ca.register.');

    } catch (error) {
        console.error(`Failed to check wallet identity: ${error}`);
        process.exit(1);
    }
}

main();
