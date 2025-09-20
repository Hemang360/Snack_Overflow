'use strict';

const express = require('express');
const helper = require('./helper');
const invoke = require('./invoke');
const query = require('./query');
const auth = require('./auth'); // Import the authentication system
const cors = require('cors');
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration for app and website
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from mobile apps (no origin) and specified domains
        const allowedOrigins = [
            'http://localhost:3000', // React development
            'http://localhost:3001', // Alternative React port
            'https://yourdomain.com', // Production website
            'https://app.yourdomain.com', // Production app
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Device-Info'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

app.listen(5000, function () {
    console.log('Ayurveda Supply Chain server is running on port 5000 with enhanced security :) ');
});

app.get('/status', async function (req, res, next) {
    res.send("Ayurveda Supply Chain server is up with enhanced authentication.");
});

// ===== AUTHENTICATION ENDPOINTS =====

// Register farmer with authentication
app.post('/auth/register/farmer', auth.authLimiter, async function (req, res, next) {
    try {
        const { email, password, confirmPassword, name, farmLocation, contact, certifications, documentCids, deviceInfo } = req.body;

        if (!name || !farmLocation) {
            throw new Error("Missing required farmer details: name, farmLocation");
        }

        const userData = {
            email,
            password,
            confirmPassword,
            userType: 'farmer',
            deviceInfo: deviceInfo || extractDeviceInfo(req),
            // Farmer-specific data
            name,
            farmLocation,
            contact: contact || '',
            certifications: certifications || [],
            documentCids: documentCids || []
        };

        const result = await auth.registerUser(userData, helper);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Error registering farmer: ", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Register manufacturer with authentication
app.post('/auth/register/manufacturer', auth.authLimiter, async function (req, res, next) {
    try {
        const { 
            email, password, confirmPassword, companyName, name, location, 
            licenses, contact, documentCids, deviceInfo 
        } = req.body;

        if (!companyName || !name || !location) {
            throw new Error("Missing required manufacturer details: companyName, name, location");
        }

        const userData = {
            email,
            password,
            confirmPassword,
            userType: 'manufacturer',
            deviceInfo: deviceInfo || extractDeviceInfo(req),
            // Manufacturer-specific data
            companyName,
            name,
            location,
            licenses: licenses || [],
            contact: contact || '',
            documentCids: documentCids || []
        };

        const result = await auth.registerUser(userData, helper);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Error registering manufacturer: ", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Register laboratory with authentication
app.post('/auth/register/laboratory', auth.authLimiter, async function (req, res, next) {
    try {
        const { 
            email, password, confirmPassword, labName, location, 
            accreditation, certifications, contact, documentCids, deviceInfo 
        } = req.body;

        if (!labName || !location) {
            throw new Error("Missing required laboratory details: labName, location");
        }

        const userData = {
            email,
            password,
            confirmPassword,
            userType: 'laboratory',
            deviceInfo: deviceInfo || extractDeviceInfo(req),
            // Laboratory-specific data
            labName,
            location,
            accreditation: accreditation || {},
            certifications: certifications || [],
            contact: contact || '',
            documentCids: documentCids || []
        };

        const result = await auth.registerUser(userData, helper);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Error registering laboratory: ", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Login endpoint
app.post('/auth/login', auth.loginLimiter, async function (req, res, next) {
    try {
        const { email, password, deviceInfo } = req.body;

        const credentials = {
            email,
            password,
            deviceInfo: deviceInfo || extractDeviceInfo(req)
        };

        const result = await auth.loginUser(credentials);
        
        if (result.success) {
            // Set secure HTTP-only cookie for refresh token (web only)
            res.cookie('refreshToken', result.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }

        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Refresh token endpoint
app.post('/auth/refresh', async function (req, res, next) {
    try {
        // Try to get refresh token from body (mobile) or cookie (web)
        const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
        
        const result = await auth.refreshToken(refreshToken);
        
        if (result.success && req.cookies.refreshToken) {
            // Update refresh token cookie for web clients
            res.cookie('refreshToken', result.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }

        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Logout endpoint
app.post('/auth/logout', async function (req, res, next) {
    try {
        const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
        
        const result = await auth.logoutUser(refreshToken);
        
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Change password endpoint
app.post('/auth/change-password', auth.verifyToken, async function (req, res, next) {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const result = await auth.changePassword(userId, oldPassword, newPassword);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get user profile endpoint
app.get('/auth/profile', auth.verifyToken, async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const result = await auth.getUserProfile(userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ===== PROTECTED SUPPLY CHAIN ENDPOINTS =====

// Create herb batch (protected)
app.post('/createHerbBatch', auth.verifyToken, auth.requireRole('farmer'), async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const {
            batchId, herbName, scientificName, harvestDate, farmLocation, quantity, unit,
            gpsCoordinates, collectorId, environmentalData, cultivationMethod,
            harvestMethod, plantPart, images, documentCids
        } = req.body;

        // Validate required fields
        if (!batchId || !herbName || !harvestDate || !farmLocation || !quantity || !gpsCoordinates) {
            throw new Error("Missing required batch creation fields");
        }

        // Validate GPS coordinates
        if (!gpsCoordinates.latitude || !gpsCoordinates.longitude) {
            throw new Error("GPS coordinates must include latitude and longitude");
        }

        const result = await invoke.invokeTransaction('createHerbBatch', {
            batchId, herbName, scientificName, harvestDate, farmLocation,
            quantity, unit: unit || 'kg', gpsCoordinates, collectorId,
            environmentalData, cultivationMethod, harvestMethod,
            plantPart, images, documentCids
        }, userId);
        
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Add quality test (protected - laboratory only)
app.post('/addQualityTest', auth.verifyToken, auth.requireRole('laboratory'), async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const {
            batchId, labId, testType, testResults, testDate, certification,
            labLocation, testStatus, testMethod, equipmentUsed,
            observations, images, documentCids
        } = req.body;

        // Validate required fields
        if (!batchId || !labId || !testType || !testDate || !testStatus) {
            throw new Error("Missing required quality test fields");
        }

        // Validate test status
        if (!['PASS', 'FAIL'].includes(testStatus)) {
            throw new Error("Test status must be either 'PASS' or 'FAIL'");
        }

        const result = await invoke.invokeTransaction('addQualityTest', {
            batchId, labId, testType, testResults, testDate, certification,
            labLocation, testStatus, testMethod, equipmentUsed,
            observations, images, documentCids
        }, userId);
        
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Add processing step (protected - manufacturer only)
app.post('/addProcessingStep', auth.verifyToken, auth.requireRole('manufacturer'), async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const {
            batchId, processingType, processingDate, processingLocation,
            inputQuantity, outputQuantity, processingDetails, equipmentUsed,
            operatorId, temperature, duration, additionalParameters,
            images, notes, documentCids
        } = req.body;

        // Validate required fields
        if (!batchId || !processingType || !processingDate || !processingLocation) {
            throw new Error("Missing required processing step fields");
        }

        const result = await invoke.invokeTransaction('addProcessingStep', {
            batchId, processingType, processingDate, processingLocation,
            inputQuantity, outputQuantity, processingDetails, equipmentUsed,
            operatorId, temperature, duration, additionalParameters,
            images, notes, documentCids
        }, userId);
        
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Transfer batch (protected)
app.post('/transferBatch', auth.verifyToken, async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const { batchId, toEntityId, transferReason, transferLocation, documents, documentCids } = req.body;
        
        if (!batchId || !toEntityId) {
            throw new Error("Missing required transfer fields: batchId, toEntityId");
        }

        const result = await invoke.invokeTransaction('transferBatch', { 
            batchId, toEntityId, transferReason, transferLocation, documents, documentCids
        }, userId);
        
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create medicine (protected - manufacturer only)
app.post('/createMedicine', auth.verifyToken, auth.requireRole('manufacturer'), async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const { 
            medicineId, medicineName, batchIds, manufacturingDate, expiryDate,
            dosageForm, strength, packagingDetails, storageConditions,
            batchNumber, regulatoryApprovals, documentCids
        } = req.body;
        
        // Validate required fields
        if (!medicineId || !medicineName || !batchIds || !manufacturingDate || !expiryDate) {
            throw new Error("Missing required medicine creation fields");
        }

        if (!Array.isArray(batchIds) || batchIds.length === 0) {
            throw new Error("batchIds must be a non-empty array");
        }

        const result = await invoke.invokeTransaction('createMedicine', { 
            medicineId, medicineName, batchIds, manufacturingDate, expiryDate,
            dosageForm, strength, packagingDetails, storageConditions,
            batchNumber, regulatoryApprovals, documentCids
        }, userId);
        
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// ===== QUERY ENDPOINTS (PROTECTED) =====

// Consumer verification - get complete supply chain info (public with optional auth)
app.post('/getConsumerInfo', async function (req, res, next) {
    try {
        const { medicineId } = req.body;
        const userId = req.user ? req.user.userId : null; // Optional authentication
        
        if (!medicineId) {
            throw new Error("Missing medicineId");
        }
        
        const result = await query.getQuery('getConsumerInfo', { medicineId }, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get batch details (protected)
app.post('/getBatchDetails', auth.verifyToken, async function (req, res, next) {
    try {
        const { batchId } = req.body;
        const userId = req.user.userId;
        
        if (!batchId) {
            throw new Error("Missing batchId");
        }
        
        const result = await query.getQuery('getBatchDetails', { batchId }, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get medicine details (protected)
app.post('/getMedicineDetails', auth.verifyToken, async function (req, res, next) {
    try {
        const { medicineId } = req.body;
        const userId = req.user.userId;
        
        if (!medicineId) {
            throw new Error("Missing medicineId");
        }
        
        const result = await query.getQuery('getMedicineDetails', { medicineId }, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get batches by farmer (protected - farmer or authorized users)
app.post('/getBatchesByFarmer', auth.verifyToken, async function (req, res, next) {
    try {
        const { farmerId } = req.body;
        const userId = req.user.userId;
        
        // Allow farmers to query their own batches or authorized roles to query any
        const allowedRoles = ['regulator', 'labOverseer'];
        if (req.user.role === 'farmer' && farmerId !== userId) {
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only query your own batches'
                });
            }
        }
        
        if (!farmerId) {
            throw new Error("Missing farmerId");
        }
        
        const result = await query.getQuery('getBatchesByFarmer', { farmerId }, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Track supply chain (public with optional auth)
app.post('/trackSupplyChain', async function (req, res, next) {
    try {
        const { itemId } = req.body;
        const userId = req.user ? req.user.userId : null;
        
        if (!itemId) {
            throw new Error("Missing itemId");
        }
        
        const result = await query.getQuery('trackSupplyChain', { itemId }, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Query history of asset (protected)
app.post('/queryHistoryOfAsset', auth.verifyToken, async function (req, res, next) {
    try {
        const { assetId } = req.body;
        const userId = req.user.userId;
        
        if (!assetId) {
            throw new Error("Missing assetId");
        }

        const result = await query.getQuery('queryHistoryOfAsset', { assetId }, userId);
        
        // Try to parse the result data if it's a string
        try {
            const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
            res.status(200).json(parsedData);
        } catch (parseError) {
            res.status(200).json({ success: true, data: result });
        }
    } catch (error) {
        next(error);
    }
});

// Fetch ledger (protected - regulator only)
app.post('/fetchLedger', auth.verifyToken, auth.requireRole('regulator'), async function (req, res, next) {
    try {
        const userId = req.user.userId;
        
        const result = await query.getQuery('fetchLedger', {}, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// ===== LEGACY ENDPOINTS (DEPRECATED) =====
// Keep these for backward compatibility but add deprecation warnings

app.post('/registerFarmer', async function (req, res, next) {
    console.warn('DEPRECATED: /registerFarmer endpoint is deprecated. Use /auth/register/farmer instead.');
    try {
        let { adminId, userId, name, farmLocation, contact, certifications, documentCids } = req.body;

        if (!userId || !adminId || !name || !farmLocation) {
            throw new Error("Missing required farmer details: adminId, userId, name, farmLocation");
        }

        const role = 'farmer';
        const result = await helper.registerAndOnboardUser(adminId, userId, role, { 
            name, farmLocation, contact, certifications, documentCids 
        }, 'Org1');
        
        res.status(result.statusCode).send({
            ...result,
            warning: 'This endpoint is deprecated. Please use /auth/register/farmer for enhanced security.'
        });
    } catch (error) {
        console.log("Error registering farmer: ", error);
        next(error);
    }
});

app.post('/registerManufacturer', async function (req, res, next) {
    console.warn('DEPRECATED: /registerManufacturer endpoint is deprecated. Use /auth/register/manufacturer instead.');
    try {
        let { adminId, userId, companyName, name, location, licenses, contact, documentCids } = req.body;

        if (!userId || !adminId || !companyName || !name || !location) {
            throw new Error("Missing required manufacturer details: adminId, userId, companyName, name, location");
        }

        const role = 'manufacturer';
        const result = await helper.registerAndOnboardUser(adminId, userId, role, { 
            companyName, name, location, licenses, contact, documentCids 
        }, 'Org1');
        
        res.status(result.statusCode).send({
            ...result,
            warning: 'This endpoint is deprecated. Please use /auth/register/manufacturer for enhanced security.'
        });
    } catch (error) {
        console.log("Error registering manufacturer: ", error);
        next(error);
    }
});

app.post('/registerLaboratory', async function (req, res, next) {
    console.warn('DEPRECATED: /registerLaboratory endpoint is deprecated. Use /auth/register/laboratory instead.');
    try {
        let { adminId, userId, labName, location, accreditation, certifications, contact, documentCids } = req.body;

        if (!userId || !adminId || !labName || !location) {
            throw new Error("Missing required laboratory details: adminId, userId, labName, location");
        }

        const role = 'laboratory';
        const result = await helper.registerAndOnboardUser(adminId, userId, role, { 
            labName, location, accreditation, certifications, contact, documentCids 
        }, 'Org2');
        
        res.status(result.statusCode).send({
            ...result,
            warning: 'This endpoint is deprecated. Please use /auth/register/laboratory for enhanced security.'
        });
    } catch (error) {
        console.log("Error registering laboratory: ", error);
        next(error);
    }
});

app.post('/login', async function (req, res, next) {
    console.warn('DEPRECATED: /login endpoint is deprecated. Use /auth/login instead.');
    try {
        const { userId } = req.body;

        if (!userId) {
            throw new Error("Missing user ID.");
        }

        const result = await helper.login(userId);
        res.status(result.statusCode).send({
            ...result,
            warning: 'This endpoint is deprecated. Please use /auth/login for enhanced security.'
        });
    } catch (error) {
        console.log("Error during login: ", error);
        next(error);
    }
});

// ===== UTILITY FUNCTIONS =====

// Extract device information from request
function extractDeviceInfo(req) {
    const userAgent = req.headers['user-agent'] || '';
    const xDeviceInfo = req.headers['x-device-info'];
    
    if (xDeviceInfo) {
        try {
            return JSON.parse(xDeviceInfo);
        } catch (e) {
            console.warn('Invalid X-Device-Info header:', e.message);
        }
    }
    
    // Basic device info extraction from user agent
    const isWeb = !userAgent.includes('Mobile') || userAgent.includes('iPad');
    const isMobile = !isWeb;
    
    return {
        type: isWeb ? 'web' : 'mobile',
        userAgent: userAgent,
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    };
}

// Health check for load balancers
app.get('/health', async function (req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0'
    });
});

// API documentation endpoint
app.get('/api/docs', async function (req, res) {
    res.json({
        version: '2.0.0',
        description: 'Ayurveda Supply Chain API with Enhanced Authentication',
        endpoints: {
            authentication: {
                'POST /auth/register/farmer': 'Register a new farmer with email/password',
                'POST /auth/register/manufacturer': 'Register a new manufacturer with email/password',
                'POST /auth/register/laboratory': 'Register a new laboratory with email/password',
                'POST /auth/login': 'Login with email/password',
                'POST /auth/refresh': 'Refresh access token',
                'POST /auth/logout': 'Logout and invalidate tokens',
                'POST /auth/change-password': 'Change user password',
                'GET /auth/profile': 'Get user profile'
            },
            supply_chain: {
                'POST /createHerbBatch': 'Create a new herb batch (farmer only)',
                'POST /addQualityTest': 'Add quality test results (laboratory only)',
                'POST /addProcessingStep': 'Add processing step (manufacturer only)',
                'POST /transferBatch': 'Transfer batch ownership',
                'POST /createMedicine': 'Create medicine from batches (manufacturer only)',
                'POST /getConsumerInfo': 'Get consumer information (public)',
                'POST /getBatchDetails': 'Get batch details (authenticated)',
                'POST /getMedicineDetails': 'Get medicine details (authenticated)',
                'POST /getBatchesByFarmer': 'Get batches by farmer (authenticated)',
                'POST /trackSupplyChain': 'Track supply chain (public)',
                'POST /queryHistoryOfAsset': 'Query asset history (authenticated)',
                'POST /fetchLedger': 'Fetch complete ledger (regulator only)'
            }
        },
        authentication: {
            type: 'JWT Bearer Token',
            header: 'Authorization: Bearer <token>',
            expires: '15 minutes (access token), 7 days (refresh token)'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment ? err.message : 'Internal server error';
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: errorMessage,
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: '/api/docs'
    });
});

module.exports = app;