



'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

// Register collector with blockchain credentials
const registerCollector = async (cooperativeId, collectorId, collectorData) => {
    const orgID = 'Org1';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples','test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const orgMSP = ccp.organizations[orgID].mspid;

    // Create a new CA client for interacting with the CA.
    const caOrg = ccp.organizations[orgID].certificateAuthorities[0]
    const caURL = ccp.certificateAuthorities[caOrg].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if collector already enrolled
    const collectorIdentity = await wallet.get(collectorId);
    if (collectorIdentity) {
        console.log(`An identity for collector ${collectorId} already exists in the wallet.`);
        return {
            statusCode: 409,
            message: `Collector ${collectorId} has already been enrolled.`
        };
    }

    // Use CA admin for registration (has registration authority)
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('CA admin identity does not exist in the wallet.');
        return {
            statusCode: 400,
            message: 'CA admin identity not found. Please run registerOrg1Admin.js first.'
        };
    }

    // Build user object for authenticating with the CA using admin
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Also verify cooperative exists for blockchain operations
    const cooperativeIdentity = await wallet.get(cooperativeId);
    if (!cooperativeIdentity) {
        console.log(`Cooperative identity ${cooperativeId} does not exist in the wallet.`);
        return {
            statusCode: 400,
            message: `Cooperative ${cooperativeId} identity not found. Please register cooperative first.`
        };
    }

    // Register collector with CA using admin (who has registration authority)
    const secret = await ca.register({
        affiliation: `${orgID}.department1`.toLowerCase(),
        enrollmentID: collectorId,
        role: 'client',
        attrs: [
            {name: 'role', value: 'collector', ecert: true},
            {name: 'uuid', value: collectorId, ecert: true},
        ]
    }, adminUser);

    // Enroll collector
    const enrollment = await ca.enroll({
        enrollmentID: collectorId,
        enrollmentSecret: secret,
        attr_reqs: [
            {name: 'role', optional: false},
            {name: 'uuid', optional: false},
        ]
    });

    // Create X.509 identity
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: orgMSP,
        type: 'X.509',
    };

    // Store collector identity in wallet
    await wallet.put(collectorId, x509Identity);
    console.log(`Successfully registered and enrolled collector ${collectorId}`);

    // Register collector in blockchain using cooperative identity
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: cooperativeId, discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('ehrChainCode');

    const args = {
        collectorId: collectorId,
        cooperativeName: collectorData.cooperativeName,
        name: collectorData.name,
        city: collectorData.city,
        password: collectorData.password,
        specialization: collectorData.specialization || ''
    };

    // Call chaincode to register collector
    const buffer = await contract.submitTransaction('registerCollector', JSON.stringify(args));
    gateway.disconnect();

    return {
        statusCode: 200,
        collectorId: collectorId,
        message: `Collector ${collectorId} registered successfully.`,
        chaincodeResponse: buffer.toString()
    };
}

// Collector login function
const loginCollector = async (collectorId, password) => {
    const orgID = 'Org1';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Check wallet for collector identity
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(collectorId);
    if (!identity) {
        console.log(`Identity for collector ${collectorId} does not exist in wallet`);
        return {
            statusCode: 404,
            message: `Collector ${collectorId} not found. Please register first.`
        };
    }

    // Connect to blockchain to validate login
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: collectorId, discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('ehrChainCode');

    try {
        // Call chaincode login function
        const args = {
            collectorId: collectorId,
            password: password
        };

        const result = await contract.submitTransaction('loginCollector', JSON.stringify(args));
        gateway.disconnect();

        const loginResult = JSON.parse(result.toString());

        return {
            statusCode: 200,
            collectorId: collectorId,
            message: 'Login successful',
            collectorData: loginResult
        };

    } catch (error) {
        gateway.disconnect();
        console.log(`Login failed for collector ${collectorId}:`, error.message);

        return {
            statusCode: 401,
            message: error.message || 'Login failed'
        };
    }
}

// Register herbbatch (updated to use new chaincode structure)
const registerHerbbatch = async (collectorId, herbbatchData) => {
    const orgID = 'Org1';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples','test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Check wallet for collector identity
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(collectorId);
    if (!identity) {
        console.log(`Identity for collector ${collectorId} does not exist in wallet`);
        return {
            statusCode: 404,
            message: `Collector ${collectorId} not found. Please login first.`
        };
    }

    // Connect to blockchain
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: collectorId, discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('ehrChainCode');

    const args = {
        herbbatchId: herbbatchData.herbbatchId,
        name: herbbatchData.name,
        dob: herbbatchData.dob,
        city: herbbatchData.city,
        collectorId: collectorId
    };

    try {
        const buffer = await contract.submitTransaction('registerHerbbatch', JSON.stringify(args));
        gateway.disconnect();

        return {
            statusCode: 200,
            herbbatchId: herbbatchData.herbbatchId,
            message: `Herbbatch ${herbbatchData.herbbatchId} registered successfully.`,
            chaincodeResponse: buffer.toString()
        };

    } catch (error) {
        gateway.disconnect();
        console.log(`Herbbatch registration failed:`, error.message);

        return {
            statusCode: 400,
            message: error.message || 'Herbbatch registration failed'
        };
    }
}

// Get collector details
const getCollectorDetails = async (collectorId, requesterId) => {
    const orgID = 'Org1';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(requesterId);
    if (!identity) {
        return {
            statusCode: 404,
            message: `Requester ${requesterId} not found.`
        };
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: requesterId, discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('ehrChainCode');

    try {
        const args = { collectorId: collectorId };
        const result = await contract.evaluateTransaction('getCollectorById', JSON.stringify(args));
        gateway.disconnect();

        return {
            statusCode: 200,
            collectorData: JSON.parse(result.toString())
        };

    } catch (error) {
        gateway.disconnect();
        return {
            statusCode: 400,
            message: error.message || 'Failed to get collector details'
        };
    }
}

// Legacy function for backward compatibility (redirects to new collector system)
const registerUser = async (adminID, collectorId, userID, userRole, args) => {
    console.log('Legacy registerUser function called, redirecting to appropriate function...');

    if (userRole === 'collector') {
        return await registerCollector(adminID, userID, {
            cooperativeName: args.cooperativeName || 'Default Cooperative',
            name: args.name,
            city: args.city,
            password: args.password || 'defaultpass123', // Should be provided
            specialization: args.specialization || ''
        });
    } else if (userRole === 'herbbatch') {
        return await registerHerbbatch(collectorId, {
            herbbatchId: userID,
            name: args.name,
            dob: args.dob,
            city: args.city
        });
    } else {
        return {
            statusCode: 400,
            message: `Unsupported user role: ${userRole}`
        };
    }
}

// Legacy login function
const login = async (userID) => {
    console.log('Legacy login function called for user:', userID);

    // Try to determine if this is a collector by checking wallet
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(userID);
    if (!identity) {
        return {
            statusCode: 404,
            message: `User ${userID} not found. Please register first.`
        };
    } else {
        return {
            statusCode: 200,
            userID: userID,
            message: `User found in wallet: ${userID}. Use specific login functions for authentication.`
        };
    }
}

module.exports = {
    registerCollector,
    loginCollector,
    registerHerbbatch,
    getCollectorDetails,
    registerUser, // Legacy support
    login        // Legacy support
};
