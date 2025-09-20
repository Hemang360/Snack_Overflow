'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

const getQuery = async (fcn, args, userID) => {
    const channelName = 'mychannel';
    const chaincodeName = 'ehrChainCode';

    // Allow queries without userID for public functions like consumer info
    if (!fcn) {
        return {
            statusCode: 400,
            status: false,
            message: 'Function name is required'
        };
    }

    try {
        // Determine organization based on user ID
        let orgID = determineOrganization(userID);
        
        console.log(`Querying ${fcn} for user ${userID || 'anonymous'} using organization ${orgID}`);

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

        // For public queries (like consumer info), use a default identity if userID not provided
        let identityToUse = userID;
        if (!userID && isPublicQuery(fcn)) {
            // Try to find any available identity for public queries
            const availableIdentities = await getAvailableIdentities(wallet);
            if (availableIdentities.length > 0) {
                identityToUse = availableIdentities[0];
                console.log(`Using identity ${identityToUse} for public query ${fcn}`);
            }
        }

        // Check if identity exists in wallet
        if (identityToUse) {
            const identity = await wallet.get(identityToUse);
            if (!identity) {
                console.log(`An identity for the user ${identityToUse} does not exist in the wallet`);
                return {
                    statusCode: 400,
                    status: false,
                    message: `An identity for the user ${identityToUse} does not exist in the wallet. Please register the user first.`
                };
            }
        }

        // Connect to gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, { 
            wallet, 
            identity: identityToUse, 
            discovery: { enabled: true, asLocalhost: true } 
        });

        // Get network and contract
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        console.log(`Query arguments for ${fcn}:`, JSON.stringify(args, null, 2));
        console.log(`Using organization: ${orgID} for user: ${identityToUse || 'anonymous'}`);

        let result;
        
        // Handle different query patterns
        if (!args || Object.keys(args).length === 0) {
            // Functions that don't require arguments (like fetchLedger)
            result = await contract.evaluateTransaction(fcn);
        } else {
            // Functions that require arguments
            result = await contract.evaluateTransaction(fcn, JSON.stringify(args));
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
                message: `Query ${fcn} completed successfully`,
                data: parsedResult
            };
        } catch (parseError) {
            // If result is not JSON, return as string
            return {
                statusCode: 200,
                status: true,
                message: `Query ${fcn} completed successfully`,
                data: result.toString()
            };
        }

    } catch (error) {
        console.error(`Failed to query ${fcn} for user ${userID || 'anonymous'}:`, error.message);
        
        // Enhanced error handling
        let errorMessage = error.message;
        let statusCode = 500;

        if (error.message.includes('access denied')) {
            statusCode = 403;
            errorMessage = `Access denied: User ${userID} does not have permission to query ${fcn}`;
        } else if (error.message.includes('not found')) {
            statusCode = 404;
            errorMessage = `Resource not found: ${error.message}`;
        } else if (error.message.includes('Missing') || error.message.includes('required')) {
            statusCode = 400;
            errorMessage = `Invalid query parameters: ${error.message}`;
        }

        return {
            statusCode: statusCode,
            status: false,
            message: `Failed to execute query ${fcn}: ${errorMessage}`,
            error: {
                code: error.code || 'QUERY_ERROR',
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
    if (userID && (
        userID.toLowerCase().includes('lab') ||
        userID === 'Laboratory01' ||
        userID === 'LabOverseer01' ||
        userID === 'labAdmin' ||
        userID.startsWith('Lab') ||
        userID.includes('Laboratory')
    )) {
        orgID = 'Org2';
    }

    return orgID;
}

// Helper function to check if a query is public (doesn't require specific user permissions)
function isPublicQuery(fcn) {
    const publicQueries = [
        'getConsumerInfo',
        'getBatchDetails',
        'getMedicineDetails',
        'trackSupplyChain'
    ];
    
    return publicQueries.includes(fcn);
}

// Helper function to get available identities from wallet
async function getAvailableIdentities(wallet) {
    try {
        // This is a simplified approach - in a real scenario you might want to
        // have a dedicated public identity or use a more sophisticated approach
        const commonIdentities = [
            'regulatorAdmin',
            'Regulator01',
            'labAdmin',
            'LabOverseer01'
        ];
        
        const availableIdentities = [];
        for (const id of commonIdentities) {
            const identity = await wallet.get(id);
            if (identity) {
                availableIdentities.push(id);
            }
        }
        
        return availableIdentities;
    } catch (error) {
        console.error('Error getting available identities:', error.message);
        return [];
    }
}

// Enhanced query function with parameter validation
const getQueryWithValidation = async (fcn, args, userID) => {
    // Pre-validation
    if (!fcn) {
        return {
            statusCode: 400,
            status: false,
            message: 'Function name is required'
        };
    }

    // Validate arguments based on function
    const validationResult = validateQueryArgs(fcn, args);
    if (!validationResult.valid) {
        return {
            statusCode: 400,
            status: false,
            message: `Invalid arguments for ${fcn}: ${validationResult.message}`
        };
    }

    return await getQuery(fcn, args, userID);
}

// Validation helper for query arguments
function validateQueryArgs(fcn, args) {
    if (!args && requiresArgs(fcn)) {
        return { valid: false, message: 'Arguments are required for this query' };
    }

    switch (fcn) {
        case 'getConsumerInfo':
        case 'getMedicineDetails':
            if (!args.medicineId) {
                return { valid: false, message: 'medicineId is required' };
            }
            break;

        case 'getBatchDetails':
            if (!args.batchId) {
                return { valid: false, message: 'batchId is required' };
            }
            break;

        case 'getBatchesByFarmer':
            if (!args.farmerId) {
                return { valid: false, message: 'farmerId is required' };
            }
            break;

        case 'trackSupplyChain':
            if (!args.itemId) {
                return { valid: false, message: 'itemId is required' };
            }
            break;

        case 'queryHistoryOfAsset':
            if (!args.assetId) {
                return { valid: false, message: 'assetId is required' };
            }
            break;

        case 'fetchLedger':
            // No arguments required
            break;

        default:
            // For other functions, basic validation
            break;
    }

    return { valid: true };
}

// Helper function to check if a function requires arguments
function requiresArgs(fcn) {
    const noArgsRequired = [
        'fetchLedger'
    ];
    
    return !noArgsRequired.includes(fcn);
}

// Batch queries helper
const getBatchQueries = async (queries, userID) => {
    const results = [];
    
    for (const query of queries) {
        try {
            const result = await getQuery(query.fcn, query.args, userID);
            results.push({
                query: query.fcn,
                success: result.status,
                result: result
            });
        } catch (error) {
            results.push({
                query: query.fcn,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// Helper function to format consumer info for better readability
const formatConsumerInfo = (consumerInfo) => {
    try {
        const data = typeof consumerInfo === 'string' ? JSON.parse(consumerInfo) : consumerInfo;
        
        return {
            medicine: {
                id: data.medicine?.id,
                name: data.medicine?.name,
                manufacturer: data.medicine?.manufacturer,
                expiryDate: data.medicine?.expiryDate,
                verificationStatus: 'Verified',
                qrCodeData: data.medicine?.qrCode
            },
            ingredients: data.ingredients?.map(ingredient => ({
                batchId: ingredient.batchId,
                herbName: ingredient.herbName,
                scientificName: ingredient.scientificName,
                origin: {
                    location: ingredient.harvestLocation,
                    harvestDate: ingredient.harvestDate,
                    geoZone: ingredient.geoZone
                },
                quality: {
                    status: ingredient.qualityStatus,
                    quantity: ingredient.quantity
                }
            })) || [],
            supplyChainTimeline: data.supplyChain?.map(event => ({
                event: event.event,
                date: event.date,
                location: event.location,
                participants: event.agents?.map(agent => ({
                    role: agent.role,
                    entity: agent.who
                })) || []
            })) || [],
            certificates: data.certificates?.map(cert => ({
                type: cert.type,
                testType: cert.testType,
                date: cert.date,
                status: cert.status,
                issuedBy: cert.laboratory
            })) || [],
            verificationTimestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error formatting consumer info:', error.message);
        return consumerInfo; // Return original data if formatting fails
    }
}

// Helper function to format batch details
const formatBatchDetails = (batchDetails) => {
    try {
        const data = typeof batchDetails === 'string' ? JSON.parse(batchDetails) : batchDetails;
        
        if (data.resourceType === 'Bundle' && data.entry) {
            const specimen = data.entry.find(e => e.resource?.resourceType === 'Specimen')?.resource;
            const metadata = JSON.parse(data.extension?.find(ext => ext.url === 'batch-metadata')?.valueString || '{}');
            
            return {
                batchId: data.id,
                herbInfo: {
                    name: metadata.herbName,
                    scientificName: metadata.scientificName,
                    plantPart: specimen?.collection?.bodySite?.text
                },
                harvest: {
                    date: specimen?.collection?.collectedDateTime,
                    location: specimen?.subject?.display,
                    method: specimen?.collection?.method?.text,
                    quantity: specimen?.collection?.quantity,
                    geoZone: metadata.geoZone
                },
                quality: {
                    status: metadata.qualityStatus,
                    testedBy: metadata.testedBy,
                    lastTestDate: metadata.lastTestDate
                },
                processing: {
                    stage: metadata.processingStage,
                    lastProcessingDate: metadata.lastProcessingDate,
                    currentQuantity: metadata.currentQuantity
                },
                ownership: {
                    currentOwner: metadata.currentOwner,
                    farmer: metadata.farmerId,
                    lastTransferDate: metadata.lastTransferDate
                },
                timestamps: {
                    created: metadata.createdAt,
                    lastUpdated: data.timestamp
                }
            };
        }
        
        return data;
    } catch (error) {
        console.error('Error formatting batch details:', error.message);
        return batchDetails;
    }
}

module.exports = {
    getQuery,
    getQueryWithValidation,
    getBatchQueries,
    determineOrganization,
    validateQueryArgs,
    formatConsumerInfo,
    formatBatchDetails,
    isPublicQuery,
    getAvailableIdentities
};