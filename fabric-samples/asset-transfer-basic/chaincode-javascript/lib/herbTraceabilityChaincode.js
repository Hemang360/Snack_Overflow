/*
 * SPDX-License-Identifier: Apache-2.0
 * Herb Traceability Chaincode for Ayurvedic Supply Chain
 */

'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class HerbTraceabilityChaincode extends Contract {

    // Initialize the ledger with approved harvest zones and species data
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        // Define approved harvest zones for different species
        const approvedZones = [
            {
                zoneId: 'ZONE001',
                name: 'Western Ghats Region',
                species: ['ASHW001', 'TULSI001', 'NEEM001'],
                polygon: [
                    { lat: 8.0, lng: 77.0 },
                    { lat: 21.0, lng: 77.0 },
                    { lat: 21.0, lng: 73.0 },
                    { lat: 8.0, lng: 73.0 }
                ],
                conservationStatus: 'sustainable'
            },
            {
                zoneId: 'ZONE002',
                name: 'Himalayan Foothills',
                species: ['BRAHMI001', 'GILOY001'],
                polygon: [
                    { lat: 28.0, lng: 77.0 },
                    { lat: 31.0, lng: 79.0 },
                    { lat: 30.0, lng: 81.0 },
                    { lat: 27.0, lng: 79.0 }
                ],
                conservationStatus: 'protected'
            }
        ];

        // Define species with conservation limits
        const speciesData = [
            {
                speciesCode: 'ASHW001',
                scientificName: 'Withania somnifera',
                commonName: 'Ashwagandha',
                harvestSeasons: [
                    { start: '10-01', end: '12-31' },
                    { start: '01-01', end: '02-28' }
                ],
                annualQuotaKg: 1000,
                minHarvestAge: 12, // months
                sustainableMethod: 'root-division'
            },
            {
                speciesCode: 'TULSI001',
                scientificName: 'Ocimum sanctum',
                commonName: 'Tulsi',
                harvestSeasons: [
                    { start: '03-01', end: '11-30' }
                ],
                annualQuotaKg: 500,
                minHarvestAge: 3,
                sustainableMethod: 'leaf-plucking'
            }
        ];

        // Store approved zones
        for (const zone of approvedZones) {
            await ctx.stub.putState(`ZONE_${zone.zoneId}`, Buffer.from(stringify(zone)));
        }

        // Store species data
        for (const species of speciesData) {
            await ctx.stub.putState(`SPECIES_${species.speciesCode}`, Buffer.from(stringify(species)));
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    // Helper function to get caller attributes
    getCallerAttributes(ctx) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const uuid = ctx.clientIdentity.getAttributeValue('uuid');
        const orgMSP = ctx.clientIdentity.getMSPID();

        if (!role || !uuid) {
            throw new Error('Missing role or uuid in client certificate');
        }

        return { role, uuid, orgMSP };
    }

    // Generate unique IDs
    generateId(prefix) {
        const timestamp = Date.now().toString();
        const random = crypto.randomBytes(4).toString('hex');
        return `${prefix}_${timestamp}_${random}`;
    }

    // Validate GPS coordinates are within approved zones
    async validateHarvestLocation(ctx, gpsCoordinates, speciesCode) {
        // Get all approved zones
        const iterator = await ctx.stub.getStateByRange('ZONE_', 'ZONE_~');
        const zones = [];
        
        let result = await iterator.next();
        while (!result.done) {
            const zone = JSON.parse(result.value.value.toString('utf8'));
            if (zone.species.includes(speciesCode)) {
                zones.push(zone);
            }
            result = await iterator.next();
        }
        await iterator.close();

        // Check if coordinates are within any approved zone
        for (const zone of zones) {
            if (this.isPointInPolygon(gpsCoordinates, zone.polygon)) {
                return { valid: true, zoneId: zone.zoneId, zoneName: zone.name };
            }
        }

        throw new Error(`Harvest location ${JSON.stringify(gpsCoordinates)} is not within approved zones for species ${speciesCode}`);
    }

    // Check if point is within polygon
    isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat, yi = polygon[i].lng;
            const xj = polygon[j].lat, yj = polygon[j].lng;
            
            const intersect = ((yi > point.longitude) !== (yj > point.longitude))
                && (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Validate harvest season
    async validateHarvestSeason(ctx, speciesCode, harvestDate) {
        const speciesKey = `SPECIES_${speciesCode}`;
        const speciesData = await ctx.stub.getState(speciesKey);
        
        if (!speciesData || speciesData.length === 0) {
            throw new Error(`Species ${speciesCode} not found`);
        }

        const species = JSON.parse(speciesData.toString());
        const harvestMonth = new Date(harvestDate).getMonth() + 1;
        const harvestDay = new Date(harvestDate).getDate();
        const harvestMMDD = `${harvestMonth.toString().padStart(2, '0')}-${harvestDay.toString().padStart(2, '0')}`;

        for (const season of species.harvestSeasons) {
            if (harvestMMDD >= season.start && harvestMMDD <= season.end) {
                return true;
            }
        }

        throw new Error(`Harvest date ${harvestDate} is outside approved seasons for ${species.commonName}`);
    }

    // Check conservation limits
    async validateConservationLimits(ctx, speciesCode, quantity, collectorId) {
        const year = new Date().getFullYear();
        const quotaKey = `QUOTA_${speciesCode}_${collectorId}_${year}`;
        
        const speciesData = await ctx.stub.getState(`SPECIES_${speciesCode}`);
        const species = JSON.parse(speciesData.toString());
        
        const currentQuotaData = await ctx.stub.getState(quotaKey);
        let currentQuota = 0;
        
        if (currentQuotaData && currentQuotaData.length > 0) {
            currentQuota = JSON.parse(currentQuotaData.toString()).totalHarvested;
        }

        if (currentQuota + quantity > species.annualQuotaKg) {
            throw new Error(`Annual quota exceeded. Current: ${currentQuota}kg, Requested: ${quantity}kg, Limit: ${species.annualQuotaKg}kg`);
        }

        return { currentQuota, newTotal: currentQuota + quantity, limit: species.annualQuotaKg };
    }

    // Register collector (farmer/wild collector)
    async registerCollector(ctx, collectorData) {
        const { collectorId, name, location, certifications, cooperativeId } = collectorData;
        const { role, uuid, orgMSP } = this.getCallerAttributes(ctx);

        // Only cooperatives can register collectors
        if (role !== 'cooperative') {
            throw new Error('Only cooperatives can register collectors');
        }

        const collectorKey = `COLLECTOR_${collectorId}`;
        const existingCollector = await ctx.stub.getState(collectorKey);
        
        if (existingCollector && existingCollector.length > 0) {
            throw new Error(`Collector ${collectorId} already exists`);
        }

        const collector = {
            collectorId,
            name,
            location,
            certifications: certifications || [],
            cooperativeId: uuid,
            orgMSP,
            status: 'active',
            registeredAt: new Date().toISOString(),
            totalHarvests: 0,
            sustainabilityScore: 100
        };

        await ctx.stub.putState(collectorKey, Buffer.from(stringify(collector)));
        return collector;
    }

    // Create herb collection event with GPS tracking
    async createCollectionEvent(ctx, eventData) {
        const { 
            herbSpecies, 
            speciesCode,
            quantity, 
            unit,
            gpsCoordinates, 
            harvestMethod,
            weatherConditions,
            soilConditions,
            plantAge,
            wildcrafted,
            organicCertified,
            images
        } = eventData;

        const { role, uuid } = this.getCallerAttributes(ctx);

        if (role !== 'collector') {
            throw new Error('Only registered collectors can create collection events');
        }

        // Validate harvest location
        const locationValidation = await this.validateHarvestLocation(ctx, gpsCoordinates, speciesCode);
        
        // Validate harvest season
        await this.validateHarvestSeason(ctx, speciesCode, new Date().toISOString());
        
        // Validate conservation limits
        const quotaValidation = await this.validateConservationLimits(ctx, speciesCode, quantity, uuid);

        const eventId = this.generateId('COLLECT');
        const timestamp = new Date().toISOString();

        const collectionEvent = {
            eventId,
            herbSpecies,
            speciesCode,
            collectorId: uuid,
            quantity,
            unit,
            gpsCoordinates,
            harvestZone: locationValidation.zoneId,
            harvestZoneName: locationValidation.zoneName,
            harvestMethod,
            weatherConditions,
            soilConditions,
            plantAge,
            wildcrafted: wildcrafted || false,
            organicCertified: organicCertified || false,
            images: images || [],
            timestamp,
            blockchainTxId: ctx.stub.getTxID(),
            status: 'collected',
            currentCustodian: uuid,
            custodyChain: [{
                custodian: uuid,
                timestamp,
                action: 'collected'
            }]
        };

        // Store collection event
        await ctx.stub.putState(`EVENT_${eventId}`, Buffer.from(stringify(collectionEvent)));

        // Update collector's quota
        const quotaKey = `QUOTA_${speciesCode}_${uuid}_${new Date().getFullYear()}`;
        await ctx.stub.putState(quotaKey, Buffer.from(stringify({
            collectorId: uuid,
            speciesCode,
            year: new Date().getFullYear(),
            totalHarvested: quotaValidation.newTotal,
            lastUpdated: timestamp
        })));

        // Emit event
        ctx.stub.setEvent('CollectionEventCreated', Buffer.from(stringify({
            eventId,
            collectorId: uuid,
            speciesCode,
            quantity,
            location: gpsCoordinates
        })));

        return collectionEvent;
    }

    // Transfer custody of herbs
    async transferCustody(ctx, transferData) {
        const { eventId, toEntity, transferType, notes } = transferData;
        const { uuid } = this.getCallerAttributes(ctx);

        const eventKey = `EVENT_${eventId}`;
        const eventData = await ctx.stub.getState(eventKey);
        
        if (!eventData || eventData.length === 0) {
            throw new Error(`Collection event ${eventId} not found`);
        }

        const event = JSON.parse(eventData.toString());

        if (event.currentCustodian !== uuid) {
            throw new Error(`Only current custodian ${event.currentCustodian} can transfer custody`);
        }

        // Update custody chain
        const timestamp = new Date().toISOString();
        event.custodyChain.push({
            from: uuid,
            to: toEntity,
            timestamp,
            transferType,
            notes,
            txId: ctx.stub.getTxID()
        });

        event.currentCustodian = toEntity;
        event.lastUpdated = timestamp;

        await ctx.stub.putState(eventKey, Buffer.from(stringify(event)));

        return event;
    }

    // Add processing step
    async addProcessingStep(ctx, processingData) {
        const { 
            collectionEventIds, 
            processType, 
            inputQuantity,
            outputQuantity,
            processingMethod,
            temperature,
            humidity,
            duration,
            qualityChecks,
            certifications
        } = processingData;

        const { role, uuid, orgMSP } = this.getCallerAttributes(ctx);

        if (role !== 'processor') {
            throw new Error('Only registered processors can add processing steps');
        }

        const processingId = this.generateId('PROCESS');
        const timestamp = new Date().toISOString();

        const processingStep = {
            processingId,
            collectionEventIds,
            processorId: uuid,
            processType,
            inputQuantity,
            outputQuantity,
            yield: (outputQuantity / inputQuantity * 100).toFixed(2) + '%',
            processingMethod,
            conditions: {
                temperature,
                humidity,
                duration
            },
            qualityChecks: qualityChecks || [],
            certifications: certifications || [],
            timestamp,
            blockchainTxId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(`PROCESSING_${processingId}`, Buffer.from(stringify(processingStep)));

        // Update collection events
        for (const eventId of collectionEventIds) {
            const eventKey = `EVENT_${eventId}`;
            const eventData = await ctx.stub.getState(eventKey);
            
            if (eventData && eventData.length > 0) {
                const event = JSON.parse(eventData.toString());
                event.processingSteps = event.processingSteps || [];
                event.processingSteps.push(processingId);
                event.status = 'processed';
                await ctx.stub.putState(eventKey, Buffer.from(stringify(event)));
            }
        }

        return processingStep;
    }

    // Add quality test results
    async addQualityTest(ctx, testData) {
        const {
            targetId,
            targetType, // 'collection' or 'batch'
            testType,
            labName,
            testParameters,
            results,
            certificates,
            compliance
        } = testData;

        const { role, uuid } = this.getCallerAttributes(ctx);

        if (role !== 'lab') {
            throw new Error('Only registered laboratories can add test results');
        }

        const testId = this.generateId('TEST');
        const timestamp = new Date().toISOString();

        const qualityTest = {
            testId,
            targetId,
            targetType,
            labId: uuid,
            labName,
            testType,
            testParameters,
            results,
            certificates: certificates || [],
            compliance: compliance || {
                ayushStandards: false,
                exportStandards: false,
                organicCertified: false
            },
            timestamp,
            blockchainTxId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(`TEST_${testId}`, Buffer.from(stringify(qualityTest)));

        // Update target entity with test results
        if (targetType === 'collection') {
            const eventKey = `EVENT_${targetId}`;
            const eventData = await ctx.stub.getState(eventKey);
            
            if (eventData && eventData.length > 0) {
                const event = JSON.parse(eventData.toString());
                event.qualityTests = event.qualityTests || [];
                event.qualityTests.push(testId);
                await ctx.stub.putState(eventKey, Buffer.from(stringify(event)));
            }
        }

        return qualityTest;
    }

    // Create final product batch with QR code
    async createProductBatch(ctx, productData) {
        const {
            productName,
            productType,
            ingredients, // Array of {collectionEventId, percentage}
            manufacturingProcess,
            batchSize,
            packaging,
            expiryDate,
            certifications
        } = productData;

        const { role, uuid, orgMSP } = this.getCallerAttributes(ctx);

        if (role !== 'manufacturer') {
            throw new Error('Only registered manufacturers can create product batches');
        }

        const batchId = this.generateId('BATCH');
        const qrCode = this.generateId('QR');
        const timestamp = new Date().toISOString();

        // Verify all ingredients are available
        const verifiedIngredients = [];
        for (const ingredient of ingredients) {
            const eventKey = `EVENT_${ingredient.collectionEventId}`;
            const eventData = await ctx.stub.getState(eventKey);
            
            if (!eventData || eventData.length === 0) {
                throw new Error(`Collection event ${ingredient.collectionEventId} not found`);
            }

            const event = JSON.parse(eventData.toString());
            verifiedIngredients.push({
                ...ingredient,
                herbSpecies: event.herbSpecies,
                harvestLocation: event.harvestZoneName,
                harvestDate: event.timestamp
            });
        }

        const productBatch = {
            batchId,
            qrCode,
            productName,
            productType,
            manufacturerId: uuid,
            manufacturerOrg: orgMSP,
            ingredients: verifiedIngredients,
            manufacturingProcess,
            batchSize,
            packaging,
            manufacturingDate: timestamp,
            expiryDate,
            certifications: certifications || [],
            status: 'manufactured',
            blockchainTxId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(stringify(productBatch)));
        await ctx.stub.putState(`QR_${qrCode}`, Buffer.from(stringify({ batchId, created: timestamp })));

        // Emit event for QR code generation
        ctx.stub.setEvent('ProductBatchCreated', Buffer.from(stringify({
            batchId,
            qrCode,
            productName,
            manufacturerId: uuid
        })));

        return productBatch;
    }

    // Get full provenance by QR code (for consumers)
    async getProvenanceByQR(ctx, qrCode) {
        // Get batch ID from QR code
        const qrData = await ctx.stub.getState(`QR_${qrCode}`);
        if (!qrData || qrData.length === 0) {
            throw new Error('Invalid QR code');
        }

        const { batchId } = JSON.parse(qrData.toString());
        
        // Get batch data
        const batchData = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchData || batchData.length === 0) {
            throw new Error('Batch not found');
        }

        const batch = JSON.parse(batchData.toString());
        
        // Get all related data
        const provenance = {
            product: {
                name: batch.productName,
                type: batch.productType,
                batchId: batch.batchId,
                manufacturingDate: batch.manufacturingDate,
                expiryDate: batch.expiryDate,
                certifications: batch.certifications
            },
            ingredients: [],
            timeline: []
        };

        // Get details for each ingredient
        for (const ingredient of batch.ingredients) {
            const eventData = await ctx.stub.getState(`EVENT_${ingredient.collectionEventId}`);
            if (eventData && eventData.length > 0) {
                const event = JSON.parse(eventData.toString());
                
                // Get collector info
                const collectorData = await ctx.stub.getState(`COLLECTOR_${event.collectorId}`);
                const collector = collectorData ? JSON.parse(collectorData.toString()) : null;

                // Get processing steps
                const processingSteps = [];
                if (event.processingSteps) {
                    for (const stepId of event.processingSteps) {
                        const stepData = await ctx.stub.getState(`PROCESSING_${stepId}`);
                        if (stepData) {
                            processingSteps.push(JSON.parse(stepData.toString()));
                        }
                    }
                }

                // Get quality tests
                const qualityTests = [];
                if (event.qualityTests) {
                    for (const testId of event.qualityTests) {
                        const testData = await ctx.stub.getState(`TEST_${testId}`);
                        if (testData) {
                            qualityTests.push(JSON.parse(testData.toString()));
                        }
                    }
                }

                provenance.ingredients.push({
                    herbSpecies: event.herbSpecies,
                    percentage: ingredient.percentage,
                    collection: {
                        eventId: event.eventId,
                        location: {
                            coordinates: event.gpsCoordinates,
                            zone: event.harvestZoneName
                        },
                        date: event.timestamp,
                        method: event.harvestMethod,
                        collector: collector ? {
                            name: collector.name,
                            location: collector.location,
                            certifications: collector.certifications
                        } : null,
                        organicCertified: event.organicCertified,
                        wildcrafted: event.wildcrafted
                    },
                    processing: processingSteps,
                    qualityTests: qualityTests,
                    custodyChain: event.custodyChain
                });

                // Build timeline
                provenance.timeline.push({
                    event: 'Collection',
                    date: event.timestamp,
                    location: event.harvestZoneName,
                    actor: collector ? collector.name : 'Unknown'
                });

                for (const step of processingSteps) {
                    provenance.timeline.push({
                        event: `Processing: ${step.processType}`,
                        date: step.timestamp,
                        actor: step.processorId
                    });
                }

                for (const test of qualityTests) {
                    provenance.timeline.push({
                        event: `Quality Test: ${test.testType}`,
                        date: test.timestamp,
                        actor: test.labName,
                        result: test.compliance.ayushStandards ? 'Passed' : 'Failed'
                    });
                }
            }
        }

        provenance.timeline.push({
            event: 'Manufacturing',
            date: batch.manufacturingDate,
            actor: batch.manufacturerId
        });

        // Sort timeline by date
        provenance.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

        return provenance;
    }

    // Query functions for different actors

    async getCollectorHarvests(ctx, collectorId) {
        const { role, uuid } = this.getCallerAttributes(ctx);
        
        // Collectors can only view their own harvests
        if (role === 'collector' && uuid !== collectorId) {
            throw new Error('Collectors can only view their own harvests');
        }

        const iterator = await ctx.stub.getStateByRange('EVENT_', 'EVENT_~');
        const harvests = [];

        let result = await iterator.next();
        while (!result.done) {
            const event = JSON.parse(result.value.value.toString('utf8'));
            if (event.collectorId === collectorId) {
                harvests.push(event);
            }
            result = await iterator.next();
        }
        await iterator.close();

        return harvests;
    }

    async getSupplyChainAnalytics(ctx) {
        const { role } = this.getCallerAttributes(ctx);
        
        if (role !== 'government' && role !== 'cooperative') {
            throw new Error('Only government and cooperatives can access analytics');
        }

        const analytics = {
            totalCollectionEvents: 0,
            totalQuantityBySpecies: {},
            harvestsByZone: {},
            processingMetrics: {
                totalProcessed: 0,
                averageYield: 0
            },
            qualityMetrics: {
                totalTests: 0,
                passRate: 0
            },
            sustainabilityScore: 0
        };

        // Aggregate collection events
        const eventIterator = await ctx.stub.getStateByRange('EVENT_', 'EVENT_~');
        let eventResult = await eventIterator.next();
        
        while (!eventResult.done) {
            const event = JSON.parse(eventResult.value.value.toString('utf8'));
            analytics.totalCollectionEvents++;
            
            if (!analytics.totalQuantityBySpecies[event.speciesCode]) {
                analytics.totalQuantityBySpecies[event.speciesCode] = 0;
            }
            analytics.totalQuantityBySpecies[event.speciesCode] += event.quantity;
            
            if (!analytics.harvestsByZone[event.harvestZone]) {
                analytics.harvestsByZone[event.harvestZone] = 0;
            }
            analytics.harvestsByZone[event.harvestZone]++;
            
            eventResult = await eventIterator.next();
        }
        await eventIterator.close();

        return analytics;
    }
}

module.exports = HerbTraceabilityChaincode;
