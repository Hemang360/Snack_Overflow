// chaincode/ayurvedic-traceability/lib/ayurvedic-contract.js
'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class AyurvedicContract extends Contract {

    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        // Initialize conservation limits and geo-boundaries
        const conservationLimits = {
            'Withania_somnifera': { // Ashwagandha
                dailyLimit: 100, // kg per day per collector
                seasonStart: '10-01', // October 1st
                seasonEnd: '03-31',   // March 31st
                protectedZones: []
            },
            'Bacopa_monnieri': { // Brahmi
                dailyLimit: 50,
                seasonStart: '11-01',
                seasonEnd: '04-30',
                protectedZones: []
            }
        };

        await ctx.stub.putState('CONSERVATION_LIMITS', Buffer.from(JSON.stringify(conservationLimits)));
        
        // Initialize geo-boundaries for protected areas
        const protectedAreas = [
            {
                id: 'WESTERN_GHATS_ZONE_1',
                coordinates: [
                    { lat: 15.3173, lng: 75.7139 },
                    { lat: 15.5173, lng: 75.9139 },
                    { lat: 15.7173, lng: 75.7139 },
                    { lat: 15.3173, lng: 75.5139 }
                ],
                restrictions: ['no_collection', 'research_only']
            }
        ];

        await ctx.stub.putState('PROTECTED_AREAS', Buffer.from(JSON.stringify(protectedAreas)));
        
        console.info('============= END : Initialize Ledger ===========');
    }

    // Collection Event Management
    async RecordCollectionEvent(ctx, collectionEventString) {
        console.info('============= START : Record Collection Event ===========');

        const collectionEvent = JSON.parse(collectionEventString);
        const eventId = this.generateUniqueId('COLLECTION');
        
        // Validate geo-fencing
        const isValidLocation = await this.validateGeofencing(ctx, collectionEvent.gpsCoordinates, collectionEvent.species);
        if (!isValidLocation.valid) {
            throw new Error(`Collection not allowed: ${isValidLocation.reason}`);
        }

        // Validate seasonal restrictions
        const isValidSeason = await this.validateSeasonalRestrictions(ctx, collectionEvent.species, collectionEvent.collectionDate);
        if (!isValidSeason.valid) {
            throw new Error(`Collection not allowed: ${isValidSeason.reason}`);
        }

        // Validate daily limits
        const isWithinLimits = await this.validateDailyLimits(ctx, collectionEvent.collectorId, collectionEvent.species, collectionEvent.quantity, collectionEvent.collectionDate);
        if (!isWithinLimits.valid) {
            throw new Error(`Daily limit exceeded: ${isWithinLimits.reason}`);
        }

        const collectionRecord = {
            id: eventId,
            type: 'COLLECTION_EVENT',
            collectorId: collectionEvent.collectorId,
            collectorType: collectionEvent.collectorType, // 'farmer' or 'wild_collector'
            species: collectionEvent.species,
            commonName: collectionEvent.commonName,
            quantity: collectionEvent.quantity,
            unit: collectionEvent.unit,
            collectionDate: collectionEvent.collectionDate,
            gpsCoordinates: collectionEvent.gpsCoordinates,
            elevation: collectionEvent.elevation,
            weatherConditions: collectionEvent.weatherConditions,
            collectionMethod: collectionEvent.collectionMethod,
            plantPart: collectionEvent.plantPart,
            maturityStage: collectionEvent.maturityStage,
            timestamp: new Date().toISOString(),
            status: 'COLLECTED',
            validationsPassed: {
                geofencing: true,
                seasonal: true,
                dailyLimits: true
            }
        };

        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(collectionRecord)));
        
        // Update daily collection totals
        await this.updateDailyCollectionTotals(ctx, collectionEvent.collectorId, collectionEvent.species, collectionEvent.quantity, collectionEvent.collectionDate);

        console.info('============= END : Record Collection Event ===========');
        return JSON.stringify(collectionRecord);
    }

    // Quality Testing Management
    async RecordQualityTest(ctx, qualityTestString) {
        console.info('============= START : Record Quality Test ===========');

        const qualityTest = JSON.parse(qualityTestString);
        const testId = this.generateUniqueId('QUALITY_TEST');

        // Validate that the batch exists
        const batchExists = await this.batchExists(ctx, qualityTest.batchId);
        if (!batchExists) {
            throw new Error(`Batch ${qualityTest.batchId} does not exist`);
        }

        // Perform quality validations
        const qualityValidations = await this.performQualityValidations(ctx, qualityTest);

        const qualityRecord = {
            id: testId,
            type: 'QUALITY_TEST',
            batchId: qualityTest.batchId,
            labId: qualityTest.labId,
            testDate: qualityTest.testDate,
            species: qualityTest.species,
            testResults: {
                moisture: {
                    value: qualityTest.moisture,
                    unit: 'percentage',
                    threshold: qualityValidations.moistureThreshold,
                    passed: qualityTest.moisture <= qualityValidations.moistureThreshold
                },
                pesticideResidues: {
                    detected: qualityTest.pesticideResidues || [],
                    passed: qualityValidations.pesticidesPassed
                },
                heavyMetals: {
                    lead: qualityTest.heavyMetals?.lead || 0,
                    mercury: qualityTest.heavyMetals?.mercury || 0,
                    arsenic: qualityTest.heavyMetals?.arsenic || 0,
                    passed: qualityValidations.heavyMetalsPassed
                },
                microbiology: {
                    totalPlateCount: qualityTest.microbiology?.totalPlateCount || 0,
                    yeastMold: qualityTest.microbiology?.yeastMold || 0,
                    pathogenicBacteria: qualityTest.microbiology?.pathogenicBacteria || false,
                    passed: qualityValidations.microbiologyPassed
                },
                dnaBarcode: {
                    sequence: qualityTest.dnaBarcode?.sequence || '',
                    confidence: qualityTest.dnaBarcode?.confidence || 0,
                    speciesMatch: qualityTest.dnaBarcode?.speciesMatch || false,
                    passed: qualityValidations.dnaBarcodesPassed
                }
            },
            overallPassed: qualityValidations.overallPassed,
            certificationLevel: qualityValidations.overallPassed ? qualityTest.certificationLevel || 'STANDARD' : 'FAILED',
            timestamp: new Date().toISOString()
        };

        await ctx.stub.putState(testId, Buffer.from(JSON.stringify(qualityRecord)));
        
        // Update batch status based on quality test results
        await this.updateBatchQualityStatus(ctx, qualityTest.batchId, qualityRecord.overallPassed, testId);

        console.info('============= END : Record Quality Test ===========');
        return JSON.stringify(qualityRecord);
    }

    // Processing Step Management
    async RecordProcessingStep(ctx, processingStepString) {
        console.info('============= START : Record Processing Step ===========');

        const processingStep = JSON.parse(processingStepString);
        const stepId = this.generateUniqueId('PROCESSING_STEP');

        const processingRecord = {
            id: stepId,
            type: 'PROCESSING_STEP',
            batchId: processingStep.batchId,
            processorId: processingStep.processorId,
            processType: processingStep.processType, // cleaning, drying, grinding, extraction
            processDate: processingStep.processDate,
            inputQuantity: processingStep.inputQuantity,
            outputQuantity: processingStep.outputQuantity,
            processParameters: {
                temperature: processingStep.temperature,
                humidity: processingStep.humidity,
                duration: processingStep.duration,
                additionalParams: processingStep.additionalParams
            },
            qualityChecks: processingStep.qualityChecks || [],
            equipment: processingStep.equipment,
            operatorId: processingStep.operatorId,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED'
        };

        await ctx.stub.putState(stepId, Buffer.from(JSON.stringify(processingRecord)));
        
        // Update batch processing history
        await this.updateBatchProcessingHistory(ctx, processingStep.batchId, stepId);

        console.info('============= END : Record Processing Step ===========');
        return JSON.stringify(processingRecord);
    }

    // Batch Management and QR Code Generation
    async CreateProductBatch(ctx, batchString) {
        console.info('============= START : Create Product Batch ===========');

        const batchData = JSON.parse(batchString);
        const batchId = this.generateUniqueId('BATCH');
        const qrCode = this.generateQRCode(batchId);

        const batch = {
            id: batchId,
            type: 'PRODUCT_BATCH',
            productName: batchData.productName,
            species: batchData.species,
            manufacturerId: batchData.manufacturerId,
            creationDate: batchData.creationDate,
            expiryDate: batchData.expiryDate,
            quantity: batchData.quantity,
            unit: batchData.unit,
            sourceCollectionEvents: batchData.sourceCollectionEvents || [],
            processingHistory: [],
            qualityTests: [],
            qrCode: qrCode,
            certifications: batchData.certifications || [],
            status: 'CREATED',
            timestamp: new Date().toISOString()
        };

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
        await ctx.stub.putState(`QR_${qrCode}`, Buffer.from(batchId));

        console.info('============= END : Create Product Batch ===========');
        return JSON.stringify(batch);
    }

    // Validation Functions
    async validateGeofencing(ctx, gpsCoordinates, species) {
        const protectedAreasBuffer = await ctx.stub.getState('PROTECTED_AREAS');
        if (!protectedAreasBuffer || protectedAreasBuffer.length === 0) {
            return { valid: true };
        }

        const protectedAreas = JSON.parse(protectedAreasBuffer.toString());
        
        for (const area of protectedAreas) {
            if (this.isPointInPolygon(gpsCoordinates, area.coordinates)) {
                if (area.restrictions.includes('no_collection')) {
                    return { valid: false, reason: `Collection prohibited in protected area ${area.id}` };
                }
            }
        }

        return { valid: true };
    }

    async validateSeasonalRestrictions(ctx, species, collectionDate) {
        const limitsBuffer = await ctx.stub.getState('CONSERVATION_LIMITS');
        if (!limitsBuffer || limitsBuffer.length === 0) {
            return { valid: true };
        }

        const limits = JSON.parse(limitsBuffer.toString());
        const speciesLimits = limits[species];

        if (!speciesLimits) {
            return { valid: true };
        }

        const collectionDateObj = new Date(collectionDate);
        const monthDay = String(collectionDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(collectionDateObj.getDate()).padStart(2, '0');

        if (speciesLimits.seasonStart <= speciesLimits.seasonEnd) {
            // Same year season
            if (monthDay < speciesLimits.seasonStart || monthDay > speciesLimits.seasonEnd) {
                return { valid: false, reason: `Collection outside allowed season for ${species}` };
            }
        } else {
            // Cross-year season
            if (monthDay < speciesLimits.seasonStart && monthDay > speciesLimits.seasonEnd) {
                return { valid: false, reason: `Collection outside allowed season for ${species}` };
            }
        }

        return { valid: true };
    }

    async validateDailyLimits(ctx, collectorId, species, quantity, collectionDate) {
        const limitsBuffer = await ctx.stub.getState('CONSERVATION_LIMITS');
        if (!limitsBuffer || limitsBuffer.length === 0) {
            return { valid: true };
        }

        const limits = JSON.parse(limitsBuffer.toString());
        const speciesLimits = limits[species];

        if (!speciesLimits) {
            return { valid: true };
        }

        // Get today's collection total for this collector and species
        const dailyTotalKey = `DAILY_TOTAL_${collectorId}_${species}_${collectionDate}`;
        const dailyTotalBuffer = await ctx.stub.getState(dailyTotalKey);
        let currentTotal = 0;

        if (dailyTotalBuffer && dailyTotalBuffer.length > 0) {
            currentTotal = parseFloat(dailyTotalBuffer.toString());
        }

        if (currentTotal + quantity > speciesLimits.dailyLimit) {
            return { 
                valid: false, 
                reason: `Daily limit (${speciesLimits.dailyLimit}kg) would be exceeded. Current: ${currentTotal}kg, Requested: ${quantity}kg` 
            };
        }

        return { valid: true };
    }

    async performQualityValidations(ctx, qualityTest) {
        // Define quality thresholds (these could be made configurable)
        const qualityStandards = {
            'Withania_somnifera': {
                moistureThreshold: 12.0,
                maxPesticideResidues: ['none_detected'],
                maxHeavyMetals: { lead: 2.0, mercury: 0.1, arsenic: 1.0 },
                maxMicrobiology: { totalPlateCount: 100000, yeastMold: 1000 }
            },
            'Bacopa_monnieri': {
                moistureThreshold: 10.0,
                maxPesticideResidues: ['none_detected'],
                maxHeavyMetals: { lead: 2.0, mercury: 0.1, arsenic: 1.0 },
                maxMicrobiology: { totalPlateCount: 100000, yeastMold: 1000 }
            }
        };

        const standards = qualityStandards[qualityTest.species] || qualityStandards['default'];
        
        const moisturePassed = qualityTest.moisture <= standards.moistureThreshold;
        const pesticidesPassed = !qualityTest.pesticideResidues || qualityTest.pesticideResidues.length === 0;
        
        const heavyMetalsPassed = (
            (qualityTest.heavyMetals?.lead || 0) <= standards.maxHeavyMetals.lead &&
            (qualityTest.heavyMetals?.mercury || 0) <= standards.maxHeavyMetals.mercury &&
            (qualityTest.heavyMetals?.arsenic || 0) <= standards.maxHeavyMetals.arsenic
        );
        
        const microbiologyPassed = (
            (qualityTest.microbiology?.totalPlateCount || 0) <= standards.maxMicrobiology.totalPlateCount &&
            (qualityTest.microbiology?.yeastMold || 0) <= standards.maxMicrobiology.yeastMold &&
            !(qualityTest.microbiology?.pathogenicBacteria || false)
        );
        
        const dnaBarcodesPassed = qualityTest.dnaBarcode?.speciesMatch || false;
        
        const overallPassed = moisturePassed && pesticidesPassed && heavyMetalsPassed && microbiologyPassed && dnaBarcodesPassed;

        return {
            moistureThreshold: standards.moistureThreshold,
            moisturePassed,
            pesticidesPassed,
            heavyMetalsPassed,
            microbiologyPassed,
            dnaBarcodesPassed,
            overallPassed
        };
    }

    // Utility Functions
    generateUniqueId(prefix) {
        const timestamp = Date.now().toString();
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    }

    generateQRCode(batchId) {
        const hash = crypto.createHash('sha256');
        hash.update(batchId + Date.now());
        return hash.digest('hex').substring(0, 16).toUpperCase();
    }

    isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if (((polygon[i].lng > point.lng) !== (polygon[j].lng > point.lng)) &&
                (point.lat < (polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng) / (polygon[j].lng - polygon[i].lng) + polygon[i].lat)) {
                inside = !inside;
            }
        }
        return inside;
    }

    async updateDailyCollectionTotals(ctx, collectorId, species, quantity, collectionDate) {
        const dailyTotalKey = `DAILY_TOTAL_${collectorId}_${species}_${collectionDate}`;
        const dailyTotalBuffer = await ctx.stub.getState(dailyTotalKey);
        let currentTotal = 0;

        if (dailyTotalBuffer && dailyTotalBuffer.length > 0) {
            currentTotal = parseFloat(dailyTotalBuffer.toString());
        }

        const newTotal = currentTotal + quantity;
        await ctx.stub.putState(dailyTotalKey, Buffer.from(newTotal.toString()));
    }

    async batchExists(ctx, batchId) {
        const batchBuffer = await ctx.stub.getState(batchId);
        return batchBuffer && batchBuffer.length > 0;
    }

    // Update batch quality status and link quality test
    async updateBatchQualityStatus(ctx, batchId, passed, testId) {
        const batchBuffer = await ctx.stub.getState(batchId);
        if (!batchBuffer || batchBuffer.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }
        const batch = JSON.parse(batchBuffer.toString());
        if (!Array.isArray(batch.qualityTests)) {
            batch.qualityTests = [];
        }
        if (testId && !batch.qualityTests.includes(testId)) {
            batch.qualityTests.push(testId);
        }
        batch.status = passed ? 'QUALITY_PASSED' : 'QUALITY_FAILED';
        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
    }

    // Link a collection event to a batch
    async LinkCollectionEventToBatch(ctx, eventId, batchId) {
        const batchBuffer = await ctx.stub.getState(batchId);
        if (!batchBuffer || batchBuffer.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }
        const eventBuffer = await ctx.stub.getState(eventId);
        if (!eventBuffer || eventBuffer.length === 0) {
            throw new Error(`Collection event ${eventId} not found`);
        }
        const batch = JSON.parse(batchBuffer.toString());
        const event = JSON.parse(eventBuffer.toString());
        if (!Array.isArray(batch.sourceCollectionEvents)) {
            batch.sourceCollectionEvents = [];
        }
        if (!batch.sourceCollectionEvents.includes(eventId)) {
            batch.sourceCollectionEvents.push(eventId);
        }
        event.batchId = batchId;
        event.status = 'ASSIGNED_TO_BATCH';
        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(event)));
        return JSON.stringify({ success: true, batchId, eventId });
    }

    // Append a processing step id to batch history
    async updateBatchProcessingHistory(ctx, batchId, stepId) {
        const batchBuffer = await ctx.stub.getState(batchId);
        if (!batchBuffer || batchBuffer.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }
        const batch = JSON.parse(batchBuffer.toString());
        if (!Array.isArray(batch.processingHistory)) {
            batch.processingHistory = [];
        }
        batch.processingHistory.push(stepId);
        batch.status = 'PROCESSING_UPDATED';
        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
    }

    // ===== Query Functions =====
    async GetProductBatch(ctx, batchId) {
        const buffer = await ctx.stub.getState(batchId);
        if (!buffer || buffer.length === 0) {
            return '';
        }
        return buffer.toString();
    }

    async GetAllCollectionEvents(ctx) {
        const query = { selector: { type: 'COLLECTION_EVENT' } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = await this.getAllResults(iterator, false);
        return JSON.stringify(results);
    }

    async GetAllQualityTests(ctx) {
        const query = { selector: { type: 'QUALITY_TEST' } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = await this.getAllResults(iterator, false);
        return JSON.stringify(results);
    }

    async QueryCollectionsBySpecies(ctx, species, startDate, endDate) {
        const query = {
            selector: {
                type: 'COLLECTION_EVENT',
                species: species,
                collectionDate: { "$gte": startDate, "$lte": endDate }
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = await this.getAllResults(iterator, false);
        return JSON.stringify(results);
    }

    async QueryQualityTestsByLab(ctx, labId, startDate, endDate) {
        const query = {
            selector: {
                type: 'QUALITY_TEST',
                labId: labId,
                testDate: { "$gte": startDate, "$lte": endDate }
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = await this.getAllResults(iterator, false);
        return JSON.stringify(results);
    }

    async GetFullTraceability(ctx, batchId) {
        const batchBuffer = await ctx.stub.getState(batchId);
        if (!batchBuffer || batchBuffer.length === 0) {
            throw new Error('Batch not found');
        }
        const batch = JSON.parse(batchBuffer.toString());

        const collectionEvents = [];
        for (const eventId of (batch.sourceCollectionEvents || [])) {
            const ev = await ctx.stub.getState(eventId);
            if (ev && ev.length > 0) {
                collectionEvents.push(JSON.parse(ev.toString()));
            }
        }

        const processingSteps = [];
        for (const stepId of (batch.processingHistory || [])) {
            const st = await ctx.stub.getState(stepId);
            if (st && st.length > 0) {
                processingSteps.push(JSON.parse(st.toString()));
            }
        }

        const qualityTests = [];
        for (const testId of (batch.qualityTests || [])) {
            const qt = await ctx.stub.getState(testId);
            if (qt && qt.length > 0) {
                qualityTests.push(JSON.parse(qt.toString()));
            }
        }

        return JSON.stringify({ batch, collectionEvents, processingSteps, qualityTests });
    }

    async getAllResults(iterator, isHistory) {
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value) {
                if (isHistory) {
                    const jsonRes = {};
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                    allResults.push(jsonRes);
                } else {
                    try {
                        allResults.push(JSON.parse(res.value.value.toString('utf8')));
                    } catch (err) {
                        allResults.push(res.value.value.toString('utf8'));
                    }
                }
            }
            if (res.done) {
                await iterator.close();
                return allResults;
            }
        }
    }
}

module.exports = AyurvedicContract;
    