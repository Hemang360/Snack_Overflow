'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

// Main function that registers user in CA and onboards them in chaincode
const registerAndOnboardUser = async (adminID, userID, userRole, args, orgID = 'Org1') => {
    try {
        // Step 1: Register and enroll user in Fabric CA
        const caResult = await registerUserInCA(adminID, userID, userRole, orgID);
        if (caResult.statusCode !== 200) {
            return caResult;
        }

        // Step 2: Onboard user in chaincode - use admin identity that has proper role mapping
        const chainCodeResult = await onboardUserInChaincode(adminID, userID, userRole, args, orgID);
        
        return {
            statusCode: 200,
            userID: userID,
            role: userRole,
            message: `Successfully registered and onboarded ${userRole} user "${userID}"`,
            caRegistration: caResult,
            chaincodeOnboarding: chainCodeResult
        };

    } catch (error) {
        console.error(`Failed to register and onboard user "${userID}": ${error}`);
        return {
            statusCode: 500,
            message: `Failed to register and onboard user "${userID}": ${error.message}`
        };
    }
}

// Register user in Fabric CA
const registerUserInCA = async (adminID, userID, userRole, orgID = 'Org1') => {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caURL = ccp.certificateAuthorities[`ca.${orgID}.example.com`.toLowerCase()].url;
        const ca = new FabricCAServices(caURL);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if user already exists
        const userIdentity = await wallet.get(userID);
        if (userIdentity) {
            console.log(`An identity for the user "${userID}" already exists in the wallet`);
            return {
                statusCode: 200,
                message: `${userID} has already been enrolled.`
            };
        }

        // Check admin identity
        const adminIdentity = await wallet.get(adminID);
        if (!adminIdentity) {
            console.log(`An identity for the ${adminID} user "${adminID}" does not exist in the wallet`);
            return {
                statusCode: 400,
                message: `An identity for the ${adminID} user "${adminID}" does not exist in the wallet`
            };
        }

        // Build admin user object for CA authentication
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminID);

        // Set role value and affiliation based on user role
        let roleValue, affiliationValue;
        if (userRole === 'farmer') {
            roleValue = 'farmer';
            affiliationValue = 'org1.department1';
        } else if (userRole === 'manufacturer') {
            roleValue = 'manufacturer';
            affiliationValue = 'org1.department1';
        } else if (userRole === 'laboratory') {
            roleValue = 'laboratory';
            affiliationValue = 'org2.department1';
        } else if (userRole === 'labOverseer') {
            roleValue = 'labOverseer';
            affiliationValue = 'org2.department1';
        } else {
            throw new Error(`Unsupported user role: ${userRole}`);
        }

        // Register user with CA
        const secret = await ca.register({
            affiliation: affiliationValue,
            enrollmentID: userID,
            role: 'client',
            attrs: [
                { name: 'role', value: roleValue, ecert: true },
                { name: 'uuid', value: userID, ecert: true }
            ],
        }, adminUser);

        // Enroll user with explicit attribute requests
        const enrollment = await ca.enroll({
            enrollmentID: userID,
            enrollmentSecret: secret,
            attr_reqs: [
                { name: "role", optional: false },
                { name: "uuid", optional: false }
            ]
        });

        // Create X.509 identity
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgID === 'Org1' ? 'Org1MSP' : 'Org2MSP',
            type: 'X.509',
        };

        await wallet.put(userID, x509Identity);
        console.log(`Successfully registered and enrolled ${userRole} user "${userID}" in CA with role/uuid attributes`);

        return {
            statusCode: 200,
            message: `Successfully registered and enrolled ${userRole} user "${userID}" in CA`
        };

    } catch (error) {
        console.error(`Failed to register user "${userID}" in CA: ${error}`);
        return {
            statusCode: 500,
            message: `Failed to register user "${userID}" in CA: ${error.message}`
        };
    }
}

// Onboard user in chaincode using the appropriate admin identity
const onboardUserInChaincode = async (adminID, userID, userRole, args, orgID) => {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Use the admin identity that has the right MSP for chaincode operations
        // The refactored chaincode will automatically map admin identities to proper roles
        const gateway = new Gateway();
        await gateway.connect(ccp, { 
            wallet, 
            identity: adminID, 
            discovery: { enabled: true, asLocalhost: true }
        });
        
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        let result;
        
        if (userRole === 'farmer') {
            const onboardArgs = {
                farmerId: userID,
                name: args.name,
                farmLocation: args.farmLocation,
                contact: args.contact || '',
                certifications: args.certifications || [],
                documentCids: args.documentCids || []
            };
            
            result = await contract.submitTransaction('onboardFarmer', JSON.stringify(onboardArgs));
            
        } else if (userRole === 'manufacturer') {
            const onboardArgs = {
                manufacturerId: userID,
                companyName: args.companyName,
                name: args.name,
                location: args.location,
                licenses: args.licenses || [],
                contact: args.contact || '',
                documentCids: args.documentCids || []
            };
            
            result = await contract.submitTransaction('onboardManufacturer', JSON.stringify(onboardArgs));
            
        } else if (userRole === 'laboratory') {
            const onboardArgs = {
                laboratoryId: userID,
                labName: args.labName,
                location: args.location,
                accreditation: args.accreditation || {},
                certifications: args.certifications || [],
                contact: args.contact || '',
                documentCids: args.documentCids || []
            };
            
            result = await contract.submitTransaction('onboardLaboratory', JSON.stringify(onboardArgs));
        }

        gateway.disconnect();

        if (result) {
            console.log(`Chaincode onboarding response for ${userID}:`, result.toString());
            try {
                return JSON.parse(result.toString());
            } catch (e) {
                return {
                    statusCode: 200,
                    message: result.toString()
                };
            }
        } else {
            return {
                statusCode: 200,
                message: `${userRole} ${userID} registered successfully, but chaincode onboarding was skipped`
            };
        }

    } catch (error) {
        console.error(`Chaincode onboarding failed for ${userID}:`, error.message);
        
        // Improved error handling for different types of errors
        if (error.message.includes('Access denied')) {
            return {
                statusCode: 403,
                message: `Access denied: The admin identity ${adminID} does not have permission to onboard ${userRole} users.`
            };
        }
        
        if (error.message.includes('Missing role or uuid')) {
            return {
                statusCode: 500,
                message: `Identity error: The admin identity ${adminID} is missing required attributes. This should be resolved with the refactored chaincode.`
            };
        }
        
        if (error.message.includes('already exists')) {
            return {
                statusCode: 409,
                message: `User ${userID} already exists in the chaincode.`
            };
        }
        
        return {
            statusCode: 500,
            message: `Chaincode onboarding failed: ${error.message}`
        };
    }
}

// Legacy function - kept for backward compatibility
const registerUser = async (adminID, delegateId, userID, userRole, args, orgID = 'Org1') => {
    // Use the new registerAndOnboardUser function
    return await registerAndOnboardUser(adminID, userID, userRole, args, orgID);
}

// Login function - check if user exists in wallet
const login = async (userID) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get(userID);
        if (!identity) {
            console.log(`An identity for the user ${userID} does not exist in the wallet`);
            return {
                statusCode: 400,
                message: `An identity for the user ${userID} does not exist.`
            };
        } else {
            return {
                statusCode: 200,
                userID: userID,
                message: `User login successful: ${userID}`
            };
        }
    } catch (error) {
        console.error(`Login failed for ${userID}:`, error.message);
        return {
            statusCode: 500,
            message: `Login failed: ${error.message}`
        };
    }
}

module.exports = {
    registerUser,
    login,
    registerAndOnboardUser,
    registerUserInCA,
    onboardUserInChaincode
};