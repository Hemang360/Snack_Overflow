'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

const invokeTransaction = async (fcn, args, userID) => {
    const channelName = 'mychannel';
    const chaincodeName = 'ehrChainCode';

    if (!userID) {
        return {
            statusCode: 400,
            status: false,
            message: 'User ID is required'
        };
    }

    if (!fcn) {
        return {
            statusCode: 400,
            status: false,
            message: 'Function name is required'
        };
    }

    try {
        // Determine organization based on user ID and role
        let orgID = determineOrganization(userID);
        
        console.log(`Invoking ${fcn} for user ${userID} using organization ${orgID}`);

        // Load connection profile
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 
            'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), 
            `connection-${orgID}.json`.toLowerCase());
        
        if (!fs.existsSync(ccpPath)) {
            throw new Error(`Connection profile not found: ${ccpPath}`);
        }

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Setup wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if user identity exists in wallet
        const identity = await wallet.get(userID);
        if (!identity) {
            console.log(`An identity for the user ${userID} does not exist in the wallet`);
            return {
                statusCode: 400,
                status: false,
                message: `An identity for the user ${userID} does not exist in the wallet. Please register the user first.`
            };
        }

        // Connect to gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, { 
            wallet, 
            identity: userID, 
            discovery: { enabled: true, asLocalhost: true } 
        });

        // Get network and contract
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        console.log(`Invoke arguments for ${fcn}:`, JSON.stringify(args, null, 2));
        console.log(`Using organization: ${orgID} for user: ${userID}`);

        let result;
        
        // Handle different function call patterns
        if (!args || Object.keys(args).length === 0) {
            // Functions with no arguments
            result = await contract.submitTransaction(fcn);
        } else {
            // Functions with arguments - pass as stringified JSON
            result = await contract.submitTransaction(fcn, JSON.stringify(args));
        }

        console.log(`Response from ${fcn} chaincode: ${result.toString()}`);

        // Disconnect gateway
        gateway.disconnect();

        // Parse and return result
        try {
            const parsedResult = JSON.parse(result.toString());
            return {
                statusCode: 200,
                status: true,
                message: `Transaction ${fcn} completed successfully`,
                data: parsedResult,
                txId: result.toString().includes('"') ? undefined : result.toString() // Include raw response if not JSON
            };
        } catch (parseError) {
            // If result is not JSON, return as string
            return {
                statusCode: 200,
                status: true,
                message: `Transaction ${fcn} completed successfully`,
                data: result.toString()
            };
        }

    } catch (error) {
        console.error(`Failed to invoke transaction ${fcn} for user ${userID}:`, error.message);
        
        // Enhanced error handling
        let errorMessage = error.message;
        let statusCode = 500;

        if (error.message.includes('access denied')) {
            statusCode = 403;
            errorMessage = `Access denied: User ${userID} does not have permission to perform ${fcn}`;
        } else if (error.message.includes('already exists')) {
            statusCode = 409;
            errorMessage = `Resource already exists: ${error.message}`;
        } else if (error.message.includes('not found')) {
            statusCode = 404;
            errorMessage = `Resource not found: ${error.message}`;
        } else if (error.message.includes('Missing') || error.message.includes('required')) {
            statusCode = 400;
            errorMessage = `Invalid input: ${error.message}`;
        }

        return {
            statusCode: statusCode,
            status: false,
            message: `Failed to invoke transaction ${fcn}: ${errorMessage}`,
            error: {
                code: error.code || 'TRANSACTION_ERROR',
                details: error.message
            }
        };
    }
}

// Helper function to determine organization based on user ID
function determineOrganization(userID) {
    // Default to Org1
    let orgID = 'Org1';

    // Check if user belongs to Org2 (laboratories and lab overseers)
    if (userID.toLowerCase().includes('lab') ||
        userID === 'Laboratory01' ||
        userID === 'LabOverseer01' ||
        userID === 'labAdmin' ||
        userID.startsWith('Lab') ||
        userID.includes('Laboratory')) {
        orgID = 'Org2';
    }

    return orgID;
}

// Enhanced invoke function with transaction validation
const invokeTransactionWithValidation = async (fcn, args, userID, expectedRole = null) => {
    // Pre-validation
    if (!fcn || !userID) {
        return {
            statusCode: 400,
            status: false,
            message: 'Function name and user ID are required'
        };
    }

    // Validate arguments based on function
    const validationResult = validateTransactionArgs(fcn, args);
    if (!validationResult.valid) {
        return {
            statusCode: 400,
            status: false,
            message: `Invalid arguments for ${fcn}: ${validationResult.message}`
        };
    }

    return await invokeTransaction(fcn, args, userID);
}

// Validation helper for transaction arguments
function validateTransactionArgs(fcn, args) {
    if (!args) {
        return { valid: false, message: 'Arguments are required' };
    }

    switch (fcn) {
        case 'onboardFarmer':
            if (!args.farmerId || !args.name || !args.farmLocation) {
                return { valid: false, message: 'farmerId, name, and farmLocation are required' };
            }
            break;

        case 'onboardManufacturer':
            if (!args.manufacturerId || !args.companyName || !args.name || !args.location) {
                return { valid: false, message: 'manufacturerId, companyName, name, and location are required' };
            }
            break;

        case 'onboardLaboratory':
            if (!args.laboratoryId || !args.labName || !args.location) {
                return { valid: false, message: 'laboratoryId, labName, and location are required' };
            }
            break;

        case 'createHerbBatch':
            if (!args.batchId || !args.herbName || !args.harvestDate || !args.farmLocation || !args.quantity || !args.gpsCoordinates) {
                return { valid: false, message: 'batchId, herbName, harvestDate, farmLocation, quantity, and gpsCoordinates are required' };
            }
            if (!args.gpsCoordinates.latitude || !args.gpsCoordinates.longitude) {
                return { valid: false, message: 'GPS coordinates must include latitude and longitude' };
            }
            break;

        case 'addQualityTest':
            if (!args.batchId || !args.labId || !args.testType || !args.testDate || !args.testStatus) {
                return { valid: false, message: 'batchId, labId, testType, testDate, and testStatus are required' };
            }
            if (!['PASS', 'FAIL'].includes(args.testStatus)) {
                return { valid: false, message: 'testStatus must be either PASS or FAIL' };
            }
            break;

        case 'addProcessingStep':
            if (!args.batchId || !args.processingType || !args.processingDate || !args.processingLocation) {
                return { valid: false, message: 'batchId, processingType, processingDate, and processingLocation are required' };
            }
            break;

        case 'transferBatch':
            if (!args.batchId || !args.toEntityId) {
                return { valid: false, message: 'batchId and toEntityId are required' };
            }
            break;

        case 'createMedicine':
            if (!args.medicineId || !args.medicineName || !args.batchIds || !args.manufacturingDate || !args.expiryDate) {
                return { valid: false, message: 'medicineId, medicineName, batchIds, manufacturingDate, and expiryDate are required' };
            }
            if (!Array.isArray(args.batchIds) || args.batchIds.length === 0) {
                return { valid: false, message: 'batchIds must be a non-empty array' };
            }
            break;

        default:
            // For other functions, basic validation
            break;
    }

    return { valid: true };
}

// Batch operations helper
const invokeBatchOperations = async (operations, userID) => {
    const results = [];
    
    for (const operation of operations) {
        try {
            const result = await invokeTransaction(operation.fcn, operation.args, userID);
            results.push({
                operation: operation.fcn,
                success: result.status,
                result: result
            });
        } catch (error) {
            results.push({
                operation: operation.fcn,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

module.exports = {
    invokeTransaction,
    invokeTransactionWithValidation,
    invokeBatchOperations,
    determineOrganization,
    validateTransactionArgs
};