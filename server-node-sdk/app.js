'use strict';

const express = require('express');
const helper = require('./helper');
const invoke = require('./invoke');
const query = require('./query');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.listen(5000, function () {
    console.log('Ayurveda Supply Chain server is running on 5000 port :) ');
});

app.get('/status', async function (req, res, next) {
    res.send("Ayurveda Supply Chain server is up.");
})

// Register farmer
app.post('/registerFarmer', async function (req, res, next) {
    try {
        let { adminId, userId, name, farmLocation } = req.body;

        if (!req.body.userId || !req.body.adminId) {
            throw new Error("Missing input data. Please enter all the farmer details.");
        }

        const role = 'farmer';
        const result = await helper.registerUser(adminId, adminId, userId, role, { name, farmLocation });
        res.status(200).send(result);
    } catch (error) {
        console.log("Error registering farmer: ", error);
        next(error);
    }
});

// Register manufacturer
app.post('/registerManufacturer', async function (req, res, next) {
    try {
        let { adminId, userId, companyName, name, location } = req.body;

        if (!req.body.userId || !req.body.adminId) {
            throw new Error("Missing input data. Please enter all the manufacturer details.");
        }

        const role = 'manufacturer';
        const result = await helper.registerUser(adminId, adminId, userId, role, { companyName, name, location });
        res.status(200).send(result);
    } catch (error) {
        console.log("Error registering manufacturer: ", error);
        next(error);
    }
});

// Register laboratory (Org2)
app.post('/registerLaboratory', async function (req, res, next) {
    try {
        let { adminId, userId, labName, location, accreditation, certifications } = req.body;

        if (!req.body.userId || !req.body.adminId) {
            throw new Error("Missing input data. Please enter all the laboratory details.");
        }

        const role = 'laboratory';
        const result = await helper.registerUser(adminId, adminId, userId, role, { labName, location, accreditation, certifications }, 'Org2');
        res.status(200).send(result);
    } catch (error) {
        console.log("Error registering laboratory: ", error);
        next(error);
    }
});

// Login user
app.post('/login', async function (req, res, next){
    try {
        let userId;

        if (req.body.userId) {
            userId = req.body.userId;
        } else {
            throw new Error("Missing user ID.");
        }

        const result = await helper.login(userId);
        res.status(200).send(result);
    } catch (error) {
        console.log("Error during login: ", error);
        next(error);
    }
});

// Onboard manufacturer (by regulator)
app.post('/onboardManufacturer', async function (req, res, next){
    try {
        const { userId, manufacturerId, companyName, name, location } = req.body;
        const result = await invoke.invokeTransaction('onboardManufacturer', { manufacturerId, companyName, name, location }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Onboard farmer (by regulator)
app.post('/onboardFarmer', async function (req, res, next){
    try {
        const { userId, farmerId, name, farmLocation } = req.body;
        const result = await invoke.invokeTransaction('onboardFarmer', { farmerId, name, farmLocation }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Onboard laboratory (by lab overseer from Org2)
app.post('/onboardLaboratory', async function (req, res, next){
    try {
        const { userId, laboratoryId, labName, location, accreditation, certifications } = req.body;
        const result = await invoke.invokeTransaction('onboardLaboratory', { laboratoryId, labName, location, accreditation, certifications }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create herb batch (by farmer)
app.post('/createHerbBatch', async function (req, res, next){
    try {
        const { 
            userId, 
            batchId, 
            herbName, 
            harvestDate, 
            farmLocation, 
            quantity,
            gpsCoordinates,
            collectorId,
            environmentalData
        } = req.body;
        
        const result = await invoke.invokeTransaction('createHerbBatch', { 
            batchId, 
            herbName, 
            harvestDate, 
            farmLocation, 
            quantity,
            gpsCoordinates,
            collectorId,
            environmentalData
        }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Add quality test (by laboratory from Org2)
app.post('/addQualityTest', async function (req, res, next){
    try {
        const {
            userId,
            batchId,
            labId,
            testType,
            testResults,
            testDate,
            certification,
            labLocation
        } = req.body;
        
        const result = await invoke.invokeTransaction('addQualityTest', { 
            batchId,
            labId,
            testType,
            testResults,
            testDate,
            certification,
            labLocation
        }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Add processing step (by manufacturer/processor)
app.post('/addProcessingStep', async function (req, res, next){
    try {
        const {
            userId,
            batchId,
            processingType,
            processingDate,
            processingLocation,
            processingConditions,
            outputMetrics,
            equipmentUsed,
            operatorId
        } = req.body;
        
        const result = await invoke.invokeTransaction('addProcessingStep', { 
            batchId,
            processingType,
            processingDate,
            processingLocation,
            processingConditions,
            outputMetrics,
            equipmentUsed,
            operatorId
        }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Transfer batch
app.post('/transferBatch', async function (req, res, next){
    try {
        const { userId, batchId, toEntityId, transferReason } = req.body;
        const result = await invoke.invokeTransaction('transferBatch', { batchId, toEntityId, transferReason }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create medicine (by manufacturer)
app.post('/createMedicine', async function (req, res, next){
    try {
        const { userId, medicineId, medicineName, batchIds, manufacturingDate, expiryDate } = req.body;
        const result = await invoke.invokeTransaction('createMedicine', { medicineId, medicineName, batchIds, manufacturingDate, expiryDate }, userId);
        res.send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Consumer verification - get complete supply chain info
app.post('/getConsumerInfo', async function (req, res, next){
    try {
        const { userId, medicineId } = req.body;
        const result = await query.getQuery('getConsumerInfo', { medicineId }, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get batch details
app.post('/getBatchDetails', async function (req, res, next){
    try {
        const { userId, batchId } = req.body;
        const result = await query.getQuery('getBatchDetails', { batchId }, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get medicine details
app.post('/getMedicineDetails', async function (req, res, next){
    try {
        const { userId, medicineId } = req.body;
        const result = await query.getQuery('getMedicineDetails', { medicineId }, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get batches by farmer
app.post('/getBatchesByFarmer', async function (req, res, next){
    try {
        const { userId, farmerId } = req.body;
        const result = await query.getQuery('getBatchesByFarmer', { farmerId }, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Track supply chain
app.post('/trackSupplyChain', async function (req, res, next){
    try {
        const { userId, itemId } = req.body;
        const result = await query.getQuery('trackSupplyChain', { itemId }, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Query history of asset
app.post('/queryHistoryOfAsset', async function (req, res, next){
    try {
        let userId = req.body.userId;
        let assetId = req.body.assetId;

        const result = await query.getQuery('queryHistoryOfAsset', { assetId }, userId);
        res.status(200).send(JSON.parse(result.data));
    } catch (error) {
        next(error);
    }
});

// Fetch ledger (regulator only)
app.post('/fetchLedger', async function (req, res, next){
    try {
        let userId = req.body.userId;
        const result = await query.getQuery('fetchLedger', {}, userId);
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    res.status(400).send(err.message);
})

module.exports = app;