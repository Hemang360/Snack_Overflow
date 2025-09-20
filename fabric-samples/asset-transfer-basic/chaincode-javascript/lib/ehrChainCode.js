

/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class ehrChainCode extends Contract {

    generateRecordId(ctx, type) {
        const txId = ctx.stub.getTxID();
        return `${type}-${txId}`;
    }

    getCallerAttributes(ctx) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const uuid = ctx.clientIdentity.getAttributeValue('uuid');

        if (!role || !uuid) {
            throw new Error('Missing role or uuid in client certificate');
        }

        return { role, uuid };
    }

    // Validation helper functions
    validateGeoLocation(latitude, longitude, approvedZones) {
        // Simple validation for demonstration - checks if coordinates are within approved zones
        for (const zone of approvedZones) {
            if (latitude >= zone.minLat && latitude <= zone.maxLat &&
                longitude >= zone.minLong && longitude <= zone.maxLong) {
                return { valid: true, zone: zone.name };
            }
        }
        return { valid: false, zone: null };
    }

    validateSeasonalHarvest(herbName, harvestDate) {
        // Sample seasonal restrictions (in practice, this would be from National Medicinal Plants Board data)
        const seasonalRestrictions = {
            'Ashwagandha': { startMonth: 10, endMonth: 3 }, // Oct-Mar
            'Turmeric': { startMonth: 8, endMonth: 11 }, // Aug-Nov
            'Brahmi': { startMonth: 6, endMonth: 9 }, // Jun-Sep
            'Neem': { startMonth: 1, endMonth: 12 }, // Year-round
            'Tulsi': { startMonth: 1, endMonth: 12 } // Year-round
        };

        const restriction = seasonalRestrictions[herbName];
        if (!restriction) {
            return { valid: true, message: "No seasonal restrictions defined" };
        }

        const harvestMonth = new Date(harvestDate).getMonth() + 1; // getMonth() is 0-based

        if (restriction.startMonth <= restriction.endMonth) {
            // Same calendar year restriction
            if (harvestMonth >= restriction.startMonth && harvestMonth <= restriction.endMonth) {
                return { valid: true, message: "Within allowed harvest season" };
            }
        } else {
            // Cross-year restriction (e.g., Oct-Mar)
            if (harvestMonth >= restriction.startMonth || harvestMonth <= restriction.endMonth) {
                return { valid: true, message: "Within allowed harvest season" };
            }
        }

        return {
            valid: false,
            message: `${herbName} can only be harvested between month ${restriction.startMonth} and ${restriction.endMonth}`
        };
    }

    validateQuality(herbName, qualityMetrics) {
        // Sample quality thresholds (moisture, pesticide limits, etc.)
        const qualityStandards = {
            'Ashwagandha': { maxMoisture: 12, maxPesticide: 0.5, minPurity: 95 },
            'Turmeric': { maxMoisture: 10, maxPesticide: 0.3, minPurity: 97 },
            'Brahmi': { maxMoisture: 14, maxPesticide: 0.2, minPurity: 92 },
            'Neem': { maxMoisture: 11, maxPesticide: 0.1, minPurity: 90 },
            'Tulsi': { maxMoisture: 13, maxPesticide: 0.1, minPurity: 94 }
        };

        const standard = qualityStandards[herbName];
        if (!standard) {
            return { valid: true, message: "No quality standards defined", warnings: [] };
        }

        const issues = [];
        const warnings = [];

        if (qualityMetrics.moisture > standard.maxMoisture) {
            issues.push(`Moisture content ${qualityMetrics.moisture}% exceeds limit ${standard.maxMoisture}%`);
        }

        if (qualityMetrics.pesticide > standard.maxPesticide) {
            issues.push(`Pesticide residue ${qualityMetrics.pesticide}ppm exceeds limit ${standard.maxPesticide}ppm`);
        }

        if (qualityMetrics.purity < standard.minPurity) {
            issues.push(`Purity ${qualityMetrics.purity}% below minimum ${standard.minPurity}%`);
        }

        // Add warnings for values close to limits
        if (qualityMetrics.moisture > standard.maxMoisture * 0.8) {
            warnings.push("Moisture level approaching maximum limit");
        }

        return {
            valid: issues.length === 0,
            message: issues.length === 0 ? "Quality standards met" : "Quality issues detected",
            issues,
            warnings
        };
    }

    validateSustainability(farmLocation, herbName, quantity) {
        // Sample sustainability rules and conservation limits
        const conservationLimits = {
            'Ashwagandha': { maxQuantityPerSeason: 500, vulnerabilityStatus: 'moderate' },
            'Turmeric': { maxQuantityPerSeason: 1000, vulnerabilityStatus: 'low' },
            'Brahmi': { maxQuantityPerSeason: 200, vulnerabilityStatus: 'high' },
            'Neem': { maxQuantityPerSeason: 800, vulnerabilityStatus: 'low' },
            'Tulsi': { maxQuantityPerSeason: 300, vulnerabilityStatus: 'moderate' }
        };

        const limit = conservationLimits[herbName];
        if (!limit) {
            return { valid: true, message: "No conservation limits defined", sustainabilityScore: 80 };
        }

        const quantityNum = parseFloat(quantity.replace(/[^0-9.]/g, '')); // Extract numeric value
        const issues = [];
        const recommendations = [];

        if (quantityNum > limit.maxQuantityPerSeason) {
            issues.push(`Harvest quantity ${quantity} exceeds seasonal limit ${limit.maxQuantityPerSeason}kg`);
        }

        if (limit.vulnerabilityStatus === 'high') {
            recommendations.push("This species requires special conservation measures due to high vulnerability");
        }

        // Calculate sustainability score based on various factors
        let sustainabilityScore = 100;
        if (quantityNum > limit.maxQuantityPerSeason) sustainabilityScore -= 30;
        if (limit.vulnerabilityStatus === 'high') sustainabilityScore -= 20;
        if (limit.vulnerabilityStatus === 'moderate') sustainabilityScore -= 10;

        return {
            valid: issues.length === 0,
            message: issues.length === 0 ? "Sustainability requirements met" : "Sustainability concerns detected",
            issues,
            recommendations,
            sustainabilityScore: Math.max(sustainabilityScore, 0),
            vulnerabilityStatus: limit.vulnerabilityStatus
        };
    }

    validateProcessingConditions(processingType, conditions, herbName) {
        // Sample processing validations
        const processingStandards = {
            'drying': {
                'Turmeric': { maxTemp: 60, minDuration: 48, maxMoisture: 10 },
                'Ashwagandha': { maxTemp: 50, minDuration: 72, maxMoisture: 12 },
                'Brahmi': { maxTemp: 45, minDuration: 60, maxMoisture: 14 }
            },
            'grinding': {
                'Turmeric': { maxTemp: 40, meshSize: '80-100', maxDuration: 30 },
                'Ashwagandha': { maxTemp: 35, meshSize: '60-80', maxDuration: 25 }
            }
        };

        const standard = processingStandards[processingType]?.[herbName];
        if (!standard) {
            return { valid: true, message: "No processing standards defined", warnings: [] };
        }

        const issues = [];
        const warnings = [];

        if (processingType === 'drying') {
            if (conditions.temperature > standard.maxTemp) {
                issues.push(`Drying temperature ${conditions.temperature}°C exceeds maximum ${standard.maxTemp}°C`);
            }
            if (conditions.duration < standard.minDuration) {
                issues.push(`Drying duration ${conditions.duration}h below minimum ${standard.minDuration}h`);
            }
        }

        if (processingType === 'grinding') {
            if (conditions.temperature > standard.maxTemp) {
                issues.push(`Grinding temperature ${conditions.temperature}°C exceeds maximum ${standard.maxTemp}°C`);
            }
        }

        return {
            valid: issues.length === 0,
            message: issues.length === 0 ? "Processing conditions validated" : "Processing issues detected",
            issues,
            warnings,
            standard
        };
    }

    // Onboard farmer
    async onboardFarmer(ctx, args) {
        const { farmerId, name, farmLocation } = JSON.parse(args);
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        if (orgMSP !== 'Org1MSP' || role !== 'regulator') {
            throw new Error('Only regulator can onboard farmer.');
        }

        const existing = await ctx.stub.getState(farmerId);
        if (existing && existing.length > 0) {
            throw new Error(`Farmer ${farmerId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'FARMER');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const record = {
            resourceType: "Provenance",
            recordId,
            farmerId,
            name,
            farmLocation,
            regulatorId: callerId,
            target: [{ reference: farmerId }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: farmLocation },
            why: "Farmer onboarding",
            activity: { coding: [{ code: "CREATE", display: "Create" }] },
            agent: [{
                type: { coding: [{ code: "REGULATOR", display: "Regulator" }] },
                who: { reference: callerId }
            }],
            entity: [{
                role: "source",
                what: { reference: farmerId }
            }],
            timestamp
        };

        await ctx.stub.putState(farmerId, Buffer.from(stringify(record)));
        return stringify(record);
    }

    // Onboard laboratory (by regulator in Org2)
    async onboardLaboratory(ctx, args) {
        const { laboratoryId, labName, location, accreditation, certifications } = JSON.parse(args);
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        if (orgMSP !== 'Org2MSP' || role !== 'labOverseer') {
            throw new Error('Only lab overseer from Org2 can onboard laboratories.');
        }

        const existing = await ctx.stub.getState(laboratoryId);
        if (existing && existing.length > 0) {
            throw new Error(`Laboratory ${laboratoryId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'LAB');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const record = {
            resourceType: "Provenance",
            recordId,
            laboratoryId,
            labName,
            location,
            accreditation,
            certifications,
            labOverseerId: callerId,
            target: [{ reference: laboratoryId }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: location },
            why: "Laboratory onboarding",
            activity: { coding: [{ code: "CREATE", display: "Create" }] },
            agent: [{
                type: { coding: [{ code: "LAB_OVERSEER", display: "Lab Overseer" }] },
                who: { reference: callerId }
            }],
            entity: [{
                role: "source",
                what: { reference: laboratoryId }
            }],
            timestamp
        };

        await ctx.stub.putState(laboratoryId, Buffer.from(stringify(record)));
        return stringify(record);
    }

    // Onboard manufacturer
    async onboardManufacturer(ctx, args) {
        const { manufacturerId, companyName, name, location } = JSON.parse(args);
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        if (orgMSP !== 'Org1MSP' || role !== 'regulator') {
            throw new Error('Only regulator can onboard manufacturer.');
        }

        const existing = await ctx.stub.getState(manufacturerId);
        if (existing && existing.length > 0) {
            throw new Error(`Manufacturer ${manufacturerId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'MFG');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const record = {
            resourceType: "Provenance",
            recordId,
            manufacturerId,
            companyName,
            name,
            location,
            regulatorId: callerId,
            target: [{ reference: manufacturerId }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: location },
            why: "Manufacturer onboarding",
            activity: { coding: [{ code: "CREATE", display: "Create" }] },
            agent: [{
                type: { coding: [{ code: "REGULATOR", display: "Regulator" }] },
                who: { reference: callerId }
            }],
            entity: [{
                role: "source",
                what: { reference: manufacturerId }
            }],
            timestamp
        };

        await ctx.stub.putState(manufacturerId, Buffer.from(stringify(record)));
        return stringify(record);
    }

    // Create herb batch with basic validations (farmers don't provide quality metrics)
    async createHerbBatch(ctx, args) {
        const {
            batchId,
            herbName,
            harvestDate,
            farmLocation,
            quantity,
            gpsCoordinates, // { latitude, longitude }
            collectorId,
            environmentalData // { temperature, humidity, soilType }
        } = JSON.parse(args);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'farmer') {
            throw new Error('Only farmers can create herb batches');
        }

        const existing = await ctx.stub.getState(batchId);
        if (existing && existing.length > 0) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        // 1. Geo-fencing validation
        const approvedZones = [
            { name: 'Kerala Traditional Zone', minLat: 8.0, maxLat: 12.8, minLong: 74.8, maxLong: 77.4 },
            { name: 'Karnataka Medicinal Zone', minLat: 11.5, maxLat: 18.5, minLong: 74.0, maxLong: 78.6 },
            { name: 'Tamil Nadu Herbal Zone', minLat: 8.0, maxLat: 13.6, minLong: 76.2, maxLong: 80.3 },
            { name: 'Uttarakhand Mountain Zone', minLat: 28.4, maxLat: 31.5, minLong: 77.6, maxLong: 81.1 },
            { name: 'Gujarat Arid Zone', minLat: 20.1, maxLat: 24.7, minLong: 68.1, maxLong: 74.5 }
        ];

        const geoValidation = this.validateGeoLocation(
            gpsCoordinates.latitude,
            gpsCoordinates.longitude,
            approvedZones
        );

        if (!geoValidation.valid) {
            throw new Error(`Collection location not within approved harvesting zones. GPS: ${gpsCoordinates.latitude}, ${gpsCoordinates.longitude}`);
        }

        // 2. Seasonal harvest validation
        const seasonalValidation = this.validateSeasonalHarvest(herbName, harvestDate);
        if (!seasonalValidation.valid) {
            throw new Error(`Seasonal restriction violation: ${seasonalValidation.message}`);
        }

        // 3. Sustainability validation (no quality metrics needed)
        const sustainabilityValidation = this.validateSustainability(farmLocation, herbName, quantity);
        if (!sustainabilityValidation.valid) {
            throw new Error(`Sustainability concerns: ${sustainabilityValidation.issues.join(', ')}`);
        }

        const recordId = this.generateRecordId(ctx, 'BATCH');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create Collection Event (FHIR-style) - without quality metrics
        const collectionEvent = {
            resourceType: "CollectionEvent",
            id: `collection-${recordId}`,
            eventType: "harvest",
            species: herbName,
            location: {
                coordinates: gpsCoordinates,
                zone: geoValidation.zone,
                address: farmLocation
            },
            timestamp: harvestDate,
            collector: {
                id: collectorId || callerId,
                farmerId: callerId
            },
            quantity: quantity,
            environmentalData: environmentalData,
            validations: {
                geoFencing: geoValidation,
                seasonal: seasonalValidation,
                sustainability: sustainabilityValidation
            }
        };

        const provenance = {
            resourceType: "Provenance",
            recordId,
            target: [{ reference: batchId }],
            occurredDateTime: harvestDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: {
                reference: farmLocation,
                coordinates: gpsCoordinates,
                approvedZone: geoValidation.zone
            },
            why: "Herb batch creation with basic validation",
            activity: { coding: [{ code: "COLLECT", display: "Collection" }] },
            agent: [{
                type: { coding: [{ code: "FARMER", display: "Farmer" }] },
                who: { reference: callerId }
            }],
            entity: [{
                role: "source",
                what: { reference: batchId }
            }],
            validation: {
                geoCompliant: geoValidation.valid,
                seasonalCompliant: seasonalValidation.valid,
                sustainabilityScore: sustainabilityValidation.sustainabilityScore
            }
        };

        const batch = {
            batchId,
            herbName,
            harvestDate,
            farmLocation,
            quantity,
            gpsCoordinates,
            environmentalData,
            farmerId: callerId,
            collectorId: collectorId || callerId,
            status: "harvested",
            qualityStatus: "pending_testing", // Quality testing pending
            validationResults: {
                geoFencing: geoValidation,
                seasonal: seasonalValidation,
                sustainability: sustainabilityValidation
            },
            collectionEvent,
            provenance,
            timestamp,
            certifications: {
                sustainabilityScore: sustainabilityValidation.sustainabilityScore,
                conservationStatus: sustainabilityValidation.vulnerabilityStatus
            }
        };

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));
        return stringify(batch);
    }

    // Add quality test event (by laboratory from Org2)
    async addQualityTest(ctx, args) {
        const {
            batchId,
            labId,
            testType, // moisture, pesticide, dna, purity, contaminants
            testResults,
            testDate,
            certification,
            labLocation
        } = JSON.parse(args);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        // Allow both laboratory from Org2 and regulator from Org1 to add quality tests
        if ((orgMSP === 'Org2MSP' && role !== 'laboratory') &&
            (orgMSP === 'Org1MSP' && role !== 'regulator')) {
            throw new Error('Only laboratories (Org2) or regulators (Org1) can add quality test results');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'QTEST');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Validate test results against standards (now we have quality metrics)
        const qualityValidation = this.validateQuality(batch.herbName, testResults);

        // Create Quality Test Event (FHIR-style)
        const qualityTestEvent = {
            resourceType: "QualityTest",
            id: recordId,
            batchId: batchId,
            testType: testType,
            laboratory: {
                id: labId,
                operator: callerId,
                location: labLocation,
                organization: orgMSP
            },
            testDate: testDate,
            results: testResults,
            standards: qualityValidation,
            certification: certification,
            status: qualityValidation.valid ? "PASSED" : "FAILED",
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };

        // Create provenance record
        const testProvenance = {
            resourceType: "Provenance",
            recordId,
            target: [{ reference: batchId }],
            occurredDateTime: testDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: labLocation },
            why: `Quality testing - ${testType}`,
            activity: { coding: [{ code: "TEST", display: "Quality Test" }] },
            agent: [{
                type: { coding: [{ code: "LABORATORY", display: "Testing Laboratory" }] },
                who: { reference: callerId },
                lab: { reference: labId },
                organization: orgMSP
            }],
            entity: [{
                role: "revision",
                what: { reference: batchId }
            }],
            validation: qualityValidation
        };

        // Update batch with test results - now we add quality metrics for first time
        batch.qualityTests = batch.qualityTests || [];
        batch.qualityTests.push(qualityTestEvent);
        batch.qualityStatus = qualityValidation.valid ? "TESTED_PASSED" : "TESTED_FAILED";

        // Add quality metrics to batch (first time being added)
        if (!batch.qualityMetrics) {
            batch.qualityMetrics = testResults;
            batch.testedBy = labId;
            batch.testedDate = testDate;
        }

        // Update certifications
        if (qualityValidation.valid) {
            batch.certifications = batch.certifications || {};
            batch.certifications[`${testType}Compliant`] = true;
            batch.certifications.lastTestDate = testDate;
            batch.certifications.labCertified = labId;
            batch.certifications.organicCompliant = qualityValidation.valid;
        }

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));

        return stringify({
            message: `Quality test ${testType} completed for batch ${batchId}`,
            status: qualityValidation.valid ? "PASSED" : "FAILED",
            testEvent: qualityTestEvent,
            validation: qualityValidation
        });
    }

    // Add processing step event (by processor/manufacturer)
    async addProcessingStep(ctx, args) {
        const {
            batchId,
            processingType, // drying, grinding, extraction, packaging
            processingDate,
            processingLocation,
            processingConditions, // temperature, duration, method
            outputMetrics, // yield, moisture_after, quality_grade
            equipmentUsed,
            operatorId
        } = JSON.parse(args);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'manufacturer' && role !== 'processor') {
            throw new Error('Only manufacturers or processors can add processing steps');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'PROCESS');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Validate processing conditions
        const processingValidation = this.validateProcessingConditions(processingType, processingConditions, batch.herbName);

        // Create Processing Step Event (FHIR-style)
        const processingStepEvent = {
            resourceType: "ProcessingStep",
            id: recordId,
            batchId: batchId,
            processingType: processingType,
            processor: {
                id: callerId,
                operator: operatorId || callerId,
                location: processingLocation
            },
            processingDate: processingDate,
            conditions: processingConditions,
            equipment: equipmentUsed,
            inputMetrics: {
                quantity: batch.quantity,
                moisture: batch.qualityMetrics?.moisture || 'unknown'
            },
            outputMetrics: outputMetrics,
            validation: processingValidation,
            status: processingValidation.valid ? "COMPLETED" : "ISSUES_DETECTED",
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };

        // Create provenance record
        const processingProvenance = {
            resourceType: "Provenance",
            recordId,
            target: [{ reference: batchId }],
            occurredDateTime: processingDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: processingLocation },
            why: `Processing step - ${processingType}`,
            activity: { coding: [{ code: "TRANSFORM", display: "Processing" }] },
            agent: [{
                type: { coding: [{ code: "PROCESSOR", display: "Processing Facility" }] },
                who: { reference: callerId }
            }],
            entity: [{
                role: "revision",
                what: { reference: batchId }
            }],
            processing: processingValidation
        };

        // Update batch with processing step
        batch.processingSteps = batch.processingSteps || [];
        batch.processingSteps.push(processingStepEvent);
        batch.status = `processed_${processingType}`;

        // Update quantity and quality based on processing
        if (outputMetrics.yield) {
            batch.currentQuantity = outputMetrics.yield;
        }
        if (outputMetrics.moisture_after) {
            batch.qualityMetrics = batch.qualityMetrics || {};
            batch.qualityMetrics.moisture = outputMetrics.moisture_after;
        }

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));

        return stringify({
            message: `Processing step ${processingType} completed for batch ${batchId}`,
            processingEvent: processingStepEvent,
            validation: processingValidation
        });
    }

    // Transfer batch ownership
    async transferBatch(ctx, args) {
        const { batchId, toEntityId, transferReason } = JSON.parse(args);
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'TRANSFER');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const transferProvenance = {
            resourceType: "Provenance",
            recordId,
            target: [{ reference: batchId }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            why: transferReason,
            activity: { coding: [{ code: "TRANSFER", display: "Transfer" }] },
            agent: [
                {
                    type: { coding: [{ code: "SENDER", display: "Sender" }] },
                    who: { reference: callerId }
                },
                {
                    type: { coding: [{ code: "RECEIVER", display: "Receiver" }] },
                    who: { reference: toEntityId }
                }
            ],
            entity: [{
                role: "revision",
                what: { reference: batchId }
            }]
        };

        batch.currentOwner = toEntityId;
        batch.status = "transferred";
        batch.transferHistory = batch.transferHistory || [];
        batch.transferHistory.push(transferProvenance);

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));
        return stringify({ message: `Batch ${batchId} transferred to ${toEntityId}`, recordId });
    }

    // Create medicine from batches
    async createMedicine(ctx, args) {
        const { medicineId, medicineName, batchIds, manufacturingDate, expiryDate } = JSON.parse(args);
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'manufacturer') {
            throw new Error('Only manufacturers can create medicines');
        }

        const existing = await ctx.stub.getState(medicineId);
        if (existing && existing.length > 0) {
            throw new Error(`Medicine ${medicineId} already exists`);
        }

        // Verify all batches exist
        for (const batchId of batchIds) {
            const batchJSON = await ctx.stub.getState(batchId);
            if (!batchJSON || batchJSON.length === 0) {
                throw new Error(`Batch ${batchId} not found`);
            }
        }

        const recordId = this.generateRecordId(ctx, 'MED');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const provenance = {
            resourceType: "Provenance",
            recordId,
            target: [{ reference: medicineId }],
            occurredDateTime: manufacturingDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            why: "Medicine manufacturing",
            activity: { coding: [{ code: "MANUFACTURE", display: "Manufacture" }] },
            agent: [{
                type: { coding: [{ code: "MANUFACTURER", display: "Manufacturer" }] },
                who: { reference: callerId }
            }],
            entity: batchIds.map(batchId => ({
                role: "source",
                what: { reference: batchId }
            }))
        };

        // Generate unique QR code data
        const qrData = {
            medicineId,
            verificationUrl: `https://your-domain.com/verify/${medicineId}`,
            timestamp: parseInt(timestamp)
        };

        const medicine = {
            medicineId,
            medicineName,
            batchIds,
            manufacturingDate,
            expiryDate,
            manufacturerId: callerId,
            status: "manufactured",
            qrCode: qrData,
            provenance,
            timestamp
        };

        await ctx.stub.putState(medicineId, Buffer.from(stringify(medicine)));
        return stringify(medicine);
    }

    // Consumer verification - get complete supply chain info
    async getConsumerInfo(ctx, args) {
        const { medicineId } = JSON.parse(args);

        // Get medicine details
        const medicineJSON = await ctx.stub.getState(medicineId);
        if (!medicineJSON || medicineJSON.length === 0) {
            throw new Error(`Medicine ${medicineId} not found`);
        }

        const medicine = JSON.parse(medicineJSON.toString());
        const consumerInfo = {
            medicine: {
                id: medicine.medicineId,
                name: medicine.medicineName,
                manufacturingDate: medicine.manufacturingDate,
                expiryDate: medicine.expiryDate,
                manufacturer: medicine.manufacturerId
            },
            ingredients: [],
            supplyChain: [],
            certificates: [],
            sustainability: {
                farmsInvolved: new Set(),
                locations: new Set(),
                harvestDates: []
            }
        };

        // Get detailed info for each batch (ingredient)
        for (const batchId of medicine.batchIds) {
            const batchJSON = await ctx.stub.getState(batchId);
            if (batchJSON && batchJSON.length > 0) {
                const batch = JSON.parse(batchJSON.toString());

                // Add ingredient info with validation results
                consumerInfo.ingredients.push({
                    herbName: batch.herbName,
                    quantity: batch.quantity,
                    harvestDate: batch.harvestDate,
                    farmLocation: batch.farmLocation,
                    farmerId: batch.farmerId,
                    batchId: batch.batchId,
                    gpsCoordinates: batch.gpsCoordinates,
                    qualityMetrics: batch.qualityMetrics,
                    environmentalData: batch.environmentalData,
                    validationResults: batch.validationResults,
                    certifications: batch.certifications,
                    qualityTests: batch.qualityTests,
                    processingSteps: batch.processingSteps
                });

                // Track sustainability data
                consumerInfo.sustainability.farmsInvolved.add(batch.farmerId);
                consumerInfo.sustainability.locations.add(batch.farmLocation);
                consumerInfo.sustainability.harvestDates.push(batch.harvestDate);

                // Add supply chain events with validation info
                consumerInfo.supplyChain.push({
                    event: "Harvest",
                    date: batch.harvestDate,
                    location: batch.farmLocation,
                    coordinates: batch.gpsCoordinates,
                    actor: batch.farmerId,
                    details: `Harvested ${batch.quantity} of ${batch.herbName}`,
                    validations: batch.validationResults,
                    sustainabilityScore: batch.validationResults?.sustainability?.sustainabilityScore || 0,
                    approvedZone: batch.provenance?.location?.approvedZone
                });

                // Add quality test events
                if (batch.qualityTests) {
                    batch.qualityTests.forEach(test => {
                        consumerInfo.supplyChain.push({
                            event: "Quality Test",
                            date: test.testDate,
                            location: test.laboratory.location,
                            actor: test.laboratory.id,
                            testType: test.testType,
                            status: test.status,
                            details: `${test.testType} test: ${test.status}`,
                            results: test.results,
                            certification: test.certification
                        });
                    });
                }

                // Add processing events
                if (batch.processingSteps) {
                    batch.processingSteps.forEach(process => {
                        consumerInfo.supplyChain.push({
                            event: "Processing",
                            date: process.processingDate,
                            location: process.processor.location,
                            actor: process.processor.id,
                            processingType: process.processingType,
                            status: process.status,
                            details: `${process.processingType}: ${process.status}`,
                            conditions: process.conditions,
                            equipment: process.equipment
                        });
                    });
                }

                // Add transfer events if they exist
                if (batch.transferHistory) {
                    batch.transferHistory.forEach(transfer => {
                        consumerInfo.supplyChain.push({
                            event: "Transfer",
                            date: transfer.occurredDateTime,
                            from: transfer.agent.find(a => a.type.coding[0].code === "SENDER")?.who.reference,
                            to: transfer.agent.find(a => a.type.coding[0].code === "RECEIVER")?.who.reference,
                            reason: transfer.why,
                            details: `Batch ${batchId} transferred`
                        });
                    });
                }

                // Add certificates from batch
                if (batch.certifications) {
                    consumerInfo.certificates.push({
                        batchId: batchId,
                        herbName: batch.herbName,
                        certifications: batch.certifications
                    });
                }
            }
        }

        // Add manufacturing event
        consumerInfo.supplyChain.push({
            event: "Manufacturing",
            date: medicine.manufacturingDate,
            location: "Manufacturing facility",
            actor: medicine.manufacturerId,
            details: `Produced ${medicine.medicineName} using ${medicine.batchIds.length} herb batches`
        });

        // Convert sets to arrays for JSON response
        consumerInfo.sustainability.farmsInvolved = Array.from(consumerInfo.sustainability.farmsInvolved);
        consumerInfo.sustainability.locations = Array.from(consumerInfo.sustainability.locations);

        // Calculate overall sustainability metrics
        consumerInfo.sustainability.averageSustainabilityScore = 0;
        let totalScore = 0;
        let scoreCount = 0;

        consumerInfo.ingredients.forEach(ingredient => {
            if (ingredient.validationResults?.sustainability?.sustainabilityScore) {
                totalScore += ingredient.validationResults.sustainability.sustainabilityScore;
                scoreCount++;
            }
        });

        if (scoreCount > 0) {
            consumerInfo.sustainability.averageSustainabilityScore = Math.round(totalScore / scoreCount);
        }

        // Sort supply chain by date
        consumerInfo.supplyChain.sort((a, b) => new Date(a.date) - new Date(b.date));

        return JSON.stringify(consumerInfo);
    }

    // Get batch details
    async getBatchDetails(ctx, args) {
        const { batchId } = JSON.parse(args);

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        return batchJSON.toString();
    }

    // Get medicine details
    async getMedicineDetails(ctx, args) {
        const { medicineId } = JSON.parse(args);

        const medicineJSON = await ctx.stub.getState(medicineId);
        if (!medicineJSON || medicineJSON.length === 0) {
            throw new Error(`Medicine ${medicineId} not found`);
        }

        return medicineJSON.toString();
    }

    // Get all batches by farmer
    async getBatchesByFarmer(ctx, args) {
        const { farmerId } = JSON.parse(args);
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];

        for await (const res of iterator) {
            try {
                const record = JSON.parse(res.value.toString('utf8'));
                if (record.farmerId === farmerId) {
                    results.push(record);
                }
            } catch (err) {
                // Skip non-JSON records
            }
        }

        return JSON.stringify(results);
    }

    // Track supply chain
    async trackSupplyChain(ctx, args) {
        const { itemId } = JSON.parse(args);

        const itemJSON = await ctx.stub.getState(itemId);
        if (!itemJSON || itemJSON.length === 0) {
            throw new Error(`Item ${itemId} not found`);
        }

        const item = JSON.parse(itemJSON.toString());
        const supplyChain = [item];

        // If it's a medicine, get source batches
        if (item.batchIds) {
            for (const batchId of item.batchIds) {
                const batchJSON = await ctx.stub.getState(batchId);
                if (batchJSON && batchJSON.length > 0) {
                    supplyChain.push(JSON.parse(batchJSON.toString()));
                }
            }
        }

        return JSON.stringify(supplyChain);
    }

    // Fetch all ledger data
    async fetchLedger(ctx) {
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'regulator') {
            throw new Error('Only regulator can fetch ledger');
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return stringify(allResults);
    }

    // Query history of asset
    async queryHistoryOfAsset(ctx, args) {
        const { assetId } = JSON.parse(args);
        const iterator = await ctx.stub.getHistoryForKey(assetId);
        const results = [];

        while (true) {
            const res = await iterator.next();

            if (res.value) {
                const tx = {
                    txId: res.value.txId,
                    timestamp: res.value.timestamp ? res.value.timestamp.toISOString() : null,
                    isDelete: res.value.isDelete,
                };

                try {
                    if (res.value.value && res.value.value.length > 0 && !res.value.isDelete) {
                        tx.asset = JSON.parse(res.value.value.toString('utf8'));
                    }
                } catch (err) {
                    tx.asset = null;
                }

                results.push(tx);
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return results;
    }
}

module.exports = ehrChainCode;
