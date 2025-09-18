// Enhanced Herb Traceability Chaincode v2.0
// Implementing Review Feedback: Smart Contract Validation Rules

'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class HerbTraceabilityChaincode extends Contract {

    // Initialize ledger with approved harvest zones and species data
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        // Approved harvest zones with geo-fencing coordinates
        const approvedZones = [
            {
                zoneId: 'HP_ZONE_001',
                zoneName: 'Himachal Pradesh Medicinal Zone',
                region: 'Himachal Pradesh',
                coordinates: {
                    northEast: { lat: 33.0, lng: 79.0 },
                    southWest: { lat: 30.0, lng: 75.0 }
                },
                approvedSpecies: ['Ashwagandha', 'Brahmi', 'Shankhpushpi'],
                certifications: ['Organic', 'Fair Trade'],
                sustainabilityRating: 'A',
                establishedDate: '2020-01-01',
                regulatoryApproval: 'AYUSH-2020-HP-001'
            },
            {
                zoneId: 'UK_ZONE_001',
                zoneName: 'Uttarakhand Himalayan Zone',
                region: 'Uttarakhand',
                coordinates: {
                    northEast: { lat: 32.0, lng: 81.0 },
                    southWest: { lat: 29.0, lng: 78.0 }
                },
                approvedSpecies: ['Ashwagandha', 'Giloy', 'Neem'],
                certifications: ['Organic', 'Himalayan Wild'],
                sustainabilityRating: 'A+',
                establishedDate: '2019-06-01',
                regulatoryApproval: 'AYUSH-2019-UK-001'
            },
            {
                zoneId: 'KL_ZONE_001',
                zoneName: 'Kerala Spice Coast Zone',
                region: 'Kerala',
                coordinates: {
                    northEast: { lat: 12.5, lng: 77.5 },
                    southWest: { lat: 8.0, lng: 74.0 }
                },
                approvedSpecies: ['Turmeric', 'Cardamom', 'Black Pepper'],
                certifications: ['Organic', 'Spice Board Certified'],
                sustainabilityRating: 'A',
                establishedDate: '2018-03-01',
                regulatoryApproval: 'SPICES-2018-KL-001'
            }
        ];

        // Species-specific harvesting rules and conservation limits
        const speciesData = [
            {
                speciesCode: 'ASHW001',
                scientificName: 'Withania somnifera',
                commonName: 'Ashwagandha',
                harvestSeasons: [
                    { startMonth: 10, endMonth: 12, region: 'North India' },
                    { startMonth: 11, endMonth: 1, region: 'South India' }
                ],
                conservationStatus: 'Least Concern',
                annualQuotaPerCollector: 100, // kg
                minimumPlantAge: 2, // years
                sustainableHarvestPart: 'roots',
                qualityStandards: {
                    moisture: { max: 12, unit: '%' },
                    withanolides: { min: 0.3, max: 3.0, unit: '%' },
                    heavyMetals: {
                        lead: { max: 10, unit: 'ppm' },
                        cadmium: { max: 0.3, unit: 'ppm' },
                        mercury: { max: 1, unit: 'ppm' }
                    }
                },
                ayushStandards: 'AS 3.1.1:2021',
                exportRequirements: 'FSSAI, APEDA certified'
            },
            {
                speciesCode: 'TURM001',
                scientificName: 'Curcuma longa',
                commonName: 'Turmeric',
                harvestSeasons: [
                    { startMonth: 1, endMonth: 3, region: 'South India' },
                    { startMonth: 2, endMonth: 4, region: 'West India' }
                ],
                conservationStatus: 'Least Concern',
                annualQuotaPerCollector: 500, // kg
                minimumPlantAge: 1, // years
                sustainableHarvestPart: 'rhizomes',
                qualityStandards: {
                    moisture: { max: 10, unit: '%' },
                    curcumin: { min: 3.0, unit: '%' },
                    volatileOil: { min: 4.0, unit: '%' }
                },
                ayushStandards: 'AS 2.1.5:2021',
                exportRequirements: 'Spice Board certified'
            },
            {
                speciesCode: 'NEEM001',
                scientificName: 'Azadirachta indica',
                commonName: 'Neem',
                harvestSeasons: [
                    { startMonth: 4, endMonth: 6, region: 'All India' }
                ],
                conservationStatus: 'Least Concern',
                annualQuotaPerCollector: 200, // kg
                minimumPlantAge: 3, // years
                sustainableHarvestPart: 'leaves',
                qualityStandards: {
                    moisture: { max: 8, unit: '%' },
                    azadirachtin: { min: 0.3, unit: '%' }
                },
                ayushStandards: 'AS 4.2.1:2021',
                exportRequirements: 'AYUSH certified'
            }
        ];

        // Store approved zones
        for (const zone of approvedZones) {
            await ctx.stub.putState(`ZONE_${zone.zoneId}`, Buffer.from(JSON.stringify(zone)));
        }

        // Store species data
        for (const species of speciesData) {
            await ctx.stub.putState(`SPECIES_${species.speciesCode}`, Buffer.from(JSON.stringify(species)));
        }

        // Initialize system parameters
        const systemConfig = {
            networkVersion: '2.0.0',
            lastUpdated: new Date().toISOString(),
            regulatoryFramework: 'AYUSH Guidelines 2021',
            complianceStandards: ['ISO 22000', 'HACCP', 'GMP'],
            blockchainConsensus: 'Raft',
            dataRetentionPolicy: '7 years'
        };

        await ctx.stub.putState('SYSTEM_CONFIG', Buffer.from(JSON.stringify(systemConfig)));

        console.info('============= END : Initialize Ledger ===========');
    }

    // Enhanced geo-fencing validation with approved zones
    async validateHarvestLocation(ctx, gpsCoordinates, speciesCode) {
        console.info('============= START : Validate Harvest Location ===========');
        
        // Get species data
        const speciesData = await this.getSpeciesData(ctx, speciesCode);
        if (!speciesData) {
            throw new Error(`Species ${speciesCode} not found in approved list`);
        }

        // Get all approved zones
        const zonesIterator = await ctx.stub.getStateByRange('ZONE_', 'ZONE_~');
        const zones = [];
        
        for await (const res of zonesIterator) {
            zones.push(JSON.parse(res.value.toString()));
        }

        // Check if location is within any approved zone for this species
        const validZones = zones.filter(zone => 
            zone.approvedSpecies.includes(speciesData.commonName) &&
            this.isPointInZone(gpsCoordinates, zone.coordinates)
        );

        if (validZones.length === 0) {
            return {
                valid: false,
                reason: 'LOCATION_NOT_APPROVED',
                message: `Location (${gpsCoordinates.latitude}, ${gpsCoordinates.longitude}) is not in approved harvest zone for ${speciesData.commonName}`,
                approvedZones: zones.filter(z => z.approvedSpecies.includes(speciesData.commonName))
                    .map(z => ({ zoneId: z.zoneId, zoneName: z.zoneName }))
            };
        }

        const approvedZone = validZones[0];
        
        console.info('============= END : Validate Harvest Location ===========');
        return {
            valid: true,
            zoneId: approvedZone.zoneId,
            zoneName: approvedZone.zoneName,
            certifications: approvedZone.certifications,
            sustainabilityRating: approvedZone.sustainabilityRating
        };
    }

    // Point-in-polygon algorithm for geo-fencing
    isPointInZone(point, zoneCoordinates) {
        const { lat, lng } = point;
        const { northEast, southWest } = zoneCoordinates;
        
        return (
            lat >= southWest.lat && lat <= northEast.lat &&
            lng >= southWest.lng && lng <= northEast.lng
        );
    }

    // Seasonal harvest validation
    async validateHarvestSeason(ctx, speciesCode, harvestDate) {
        console.info('============= START : Validate Harvest Season ===========');
        
        const speciesData = await this.getSpeciesData(ctx, speciesCode);
        if (!speciesData) {
            throw new Error(`Species ${speciesCode} not found`);
        }

        const harvestMonth = new Date(harvestDate).getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();
        
        // Check if current month is within approved harvest seasons
        const validSeasons = speciesData.harvestSeasons.filter(season => {
            if (season.startMonth <= season.endMonth) {
                // Same year season (e.g., March to May)
                return harvestMonth >= season.startMonth && harvestMonth <= season.endMonth;
            } else {
                // Cross-year season (e.g., November to January)
                return harvestMonth >= season.startMonth || harvestMonth <= season.endMonth;
            }
        });

        if (validSeasons.length === 0) {
            return {
                valid: false,
                reason: 'SEASON_NOT_APPROVED',
                message: `Harvest month ${harvestMonth} is not approved for ${speciesData.commonName}`,
                approvedSeasons: speciesData.harvestSeasons
            };
        }

        console.info('============= END : Validate Harvest Season ===========');
        return {
            valid: true,
            season: validSeasons[0],
            message: `Harvest season approved for ${speciesData.commonName}`
        };
    }

    // Conservation limits validation with annual quotas
    async validateConservationLimits(ctx, speciesCode, quantity, collectorId) {
        console.info('============= START : Validate Conservation Limits ===========');
        
        const speciesData = await this.getSpeciesData(ctx, speciesCode);
        if (!speciesData) {
            throw new Error(`Species ${speciesCode} not found`);
        }

        const currentYear = new Date().getFullYear();
        const quotaKey = `QUOTA_${speciesCode}_${collectorId}_${currentYear}`;
        
        // Get current year's harvest by this collector
        const currentQuotaData = await ctx.stub.getState(quotaKey);
        let currentHarvest = 0;
        
        if (currentQuotaData && currentQuotaData.length > 0) {
            const quota = JSON.parse(currentQuotaData.toString());
            currentHarvest = quota.totalHarvested || 0;
        }

        const newTotal = currentHarvest + quantity;
        const annualLimit = speciesData.annualQuotaPerCollector;

        if (newTotal > annualLimit) {
            return {
                valid: false,
                reason: 'QUOTA_EXCEEDED',
                message: `Annual quota exceeded. Limit: ${annualLimit}kg, Current: ${currentHarvest}kg, Requested: ${quantity}kg`,
                annualLimit: annualLimit,
                currentHarvest: currentHarvest,
                requestedQuantity: quantity,
                exceededBy: newTotal - annualLimit
            };
        }

        console.info('============= END : Validate Conservation Limits ===========');
        return {
            valid: true,
            annualLimit: annualLimit,
            currentHarvest: currentHarvest,
            newTotal: newTotal,
            remainingQuota: annualLimit - newTotal
        };
    }

    // Quality gate validation based on AYUSH standards
    async validateQualityStandards(ctx, testResults, speciesCode) {
        console.info('============= START : Validate Quality Standards ===========');
        
        const speciesData = await this.getSpeciesData(ctx, speciesCode);
        if (!speciesData) {
            throw new Error(`Species ${speciesCode} not found`);
        }

        const standards = speciesData.qualityStandards;
        const violations = [];
        const warnings = [];

        // Moisture content validation
        if (testResults.moisture && standards.moisture) {
            if (testResults.moisture > standards.moisture.max) {
                violations.push({
                    parameter: 'moisture',
                    value: testResults.moisture,
                    limit: standards.moisture.max,
                    unit: standards.moisture.unit,
                    severity: 'critical',
                    message: `Moisture content ${testResults.moisture}% exceeds maximum limit of ${standards.moisture.max}%`
                });
            }
        }

        // Active compound validation (species-specific)
        if (speciesCode === 'ASHW001' && testResults.withanolides && standards.withanolides) {
            if (testResults.withanolides < standards.withanolides.min) {
                violations.push({
                    parameter: 'withanolides',
                    value: testResults.withanolides,
                    limit: standards.withanolides.min,
                    unit: standards.withanolides.unit,
                    severity: 'major',
                    message: `Withanolides ${testResults.withanolides}% below minimum requirement of ${standards.withanolides.min}%`
                });
            }
        }

        // Heavy metals validation
        if (testResults.heavyMetals && standards.heavyMetals) {
            Object.keys(standards.heavyMetals).forEach(metal => {
                if (testResults.heavyMetals[metal] && testResults.heavyMetals[metal] > standards.heavyMetals[metal].max) {
                    violations.push({
                        parameter: `heavyMetals.${metal}`,
                        value: testResults.heavyMetals[metal],
                        limit: standards.heavyMetals[metal].max,
                        unit: standards.heavyMetals[metal].unit,
                        severity: 'critical',
                        message: `${metal} content ${testResults.heavyMetals[metal]}${standards.heavyMetals[metal].unit} exceeds limit of ${standards.heavyMetals[metal].max}${standards.heavyMetals[metal].unit}`
                    });
                }
            });
        }

        const isCompliant = violations.length === 0;
        const complianceLevel = violations.filter(v => v.severity === 'critical').length === 0 ? 
            (violations.length === 0 ? 'FULLY_COMPLIANT' : 'CONDITIONALLY_COMPLIANT') : 'NON_COMPLIANT';

        console.info('============= END : Validate Quality Standards ===========');
        return {
            valid: isCompliant,
            complianceLevel: complianceLevel,
            violations: violations,
            warnings: warnings,
            ayushStandards: speciesData.ayushStandards,
            exportEligible: isCompliant && testResults.pesticides === 'Not Detected'
        };
    }

    // Create collection event with enhanced validation
    async createCollectionEvent(ctx, eventData) {
        console.info('============= START : Create Collection Event ===========');
        
        const { 
            batchId,
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

        // Enhanced validation chain
        const locationValidation = await this.validateHarvestLocation(ctx, gpsCoordinates, speciesCode);
        if (!locationValidation.valid) {
            throw new Error(`Location validation failed: ${locationValidation.message}`);
        }

        const seasonValidation = await this.validateHarvestSeason(ctx, speciesCode, new Date().toISOString());
        if (!seasonValidation.valid) {
            throw new Error(`Season validation failed: ${seasonValidation.message}`);
        }
        
        const quotaValidation = await this.validateConservationLimits(ctx, speciesCode, quantity, uuid);
        if (!quotaValidation.valid) {
            throw new Error(`Conservation limit validation failed: ${quotaValidation.message}`);
        }

        const eventId = batchId || this.generateId('BATCH');
        const timestamp = new Date().toISOString();

        const collectionEvent = {
            eventId,
            batchId: eventId, // Use eventId as batchId for consistency
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
            stage: 'collection',
            currentCustodian: uuid,
            validationResults: {
                location: locationValidation,
                season: seasonValidation,
                quota: quotaValidation
            },
            transactions: [
                {
                    txId: ctx.stub.getTxID(),
                    type: 'COLLECTION_EVENT',
                    timestamp: timestamp,
                    actor: uuid,
                    data: {
                        species: herbSpecies,
                        quantity: quantity,
                        location: gpsCoordinates,
                        validations: { locationValidation, seasonValidation, quotaValidation }
                    }
                }
            ],
            custodyChain: [{
                custodian: uuid,
                timestamp,
                action: 'collected',
                location: gpsCoordinates
            }]
        };

        // Store collection event
        await ctx.stub.putState(`BATCH_${eventId}`, Buffer.from(JSON.stringify(collectionEvent)));

        // Update collector's quota
        const quotaKey = `QUOTA_${speciesCode}_${uuid}_${new Date().getFullYear()}`;
        await ctx.stub.putState(quotaKey, Buffer.from(JSON.stringify({
            collectorId: uuid,
            speciesCode,
            year: new Date().getFullYear(),
            totalHarvested: quotaValidation.newTotal,
            lastUpdated: timestamp,
            transactions: [eventId]
        })));

        // Emit event for external systems
        ctx.stub.setEvent('CollectionEventCreated', Buffer.from(JSON.stringify({
            eventId,
            batchId: eventId,
            collectorId: uuid,
            speciesCode,
            quantity,
            location: gpsCoordinates,
            validationStatus: 'APPROVED'
        })));

        console.info('============= END : Create Collection Event ===========');
        return collectionEvent;
    }

    // Add quality test with enhanced validation
    async addQualityTest(ctx, testData) {
        console.info('============= START : Add Quality Test ===========');
        
        const {
            batchId,
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

        // Get batch data
        const batchData = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchData || batchData.length === 0) {
            throw new Error('Batch not found');
        }

        const batch = JSON.parse(batchData.toString());
        
        // Quality validation
        const qualityValidation = await this.validateQualityStandards(ctx, results, batch.speciesCode);

        const testId = this.generateId('TEST');
        const timestamp = new Date().toISOString();

        const qualityTest = {
            testId,
            batchId,
            labId: uuid,
            labName,
            testType,
            testParameters,
            results,
            qualityValidation: qualityValidation,
            certificates: certificates || [],
            compliance: {
                ayushStandards: qualityValidation.valid,
                exportStandards: qualityValidation.exportEligible,
                organicCertified: compliance?.organicCertified || false,
                ...compliance
            },
            timestamp,
            blockchainTxId: ctx.stub.getTxID()
        };

        // Store quality test
        await ctx.stub.putState(`TEST_${testId}`, Buffer.from(JSON.stringify(qualityTest)));

        // Update batch with quality test transaction
        const qualityTransaction = {
            txId: ctx.stub.getTxID(),
            type: 'QUALITY_TEST',
            timestamp: timestamp,
            actor: uuid,
            data: qualityTest
        };

        batch.transactions.push(qualityTransaction);
        batch.stage = 'tested';
        batch.status = qualityValidation.complianceLevel;
        batch.lastUpdated = timestamp;

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));

        // Emit quality test event
        ctx.stub.setEvent('QualityTestAdded', Buffer.from(JSON.stringify({
            testId,
            batchId,
            labId: uuid,
            complianceLevel: qualityValidation.complianceLevel,
            exportEligible: qualityValidation.exportEligible
        })));

        console.info('============= END : Add Quality Test ===========');
        return qualityTest;
    }

    // Get complete batch provenance (for QR code lookup)
    async getBatchProvenance(ctx, batchId) {
        console.info('============= START : Get Batch Provenance ===========');
        
        const batchData = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchData || batchData.length === 0) {
            throw new Error('Batch not found');
        }

        const batch = JSON.parse(batchData.toString());
        
        // Get all quality tests for this batch
        const qualityTestsIterator = await ctx.stub.getStateByRange(`TEST_`, `TEST_~`);
        const qualityTests = [];
        
        for await (const res of qualityTestsIterator) {
            const test = JSON.parse(res.value.toString());
            if (test.batchId === batchId) {
                qualityTests.push(test);
            }
        }

        // Get collector info
        const collectorData = await ctx.stub.getState(`COLLECTOR_${batch.collectorId}`);
        const collector = collectorData ? JSON.parse(collectorData.toString()) : null;

        // Build complete provenance
        const provenance = {
            batchId: batchId,
            species: {
                common: batch.herbSpecies,
                scientific: batch.speciesCode,
                code: batch.speciesCode
            },
            collection: {
                eventId: batch.eventId,
                collectorId: batch.collectorId,
                collectorName: collector?.name || 'Unknown',
                timestamp: batch.timestamp,
                location: {
                    coordinates: batch.gpsCoordinates,
                    zone: batch.harvestZoneName,
                    zoneId: batch.harvestZone
                },
                quantity: {
                    amount: batch.quantity,
                    unit: batch.unit
                },
                harvestMethod: batch.harvestMethod,
                environmental: {
                    weather: batch.weatherConditions,
                    soil: batch.soilConditions
                },
                certifications: {
                    organic: batch.organicCertified,
                    wildcrafted: batch.wildcrafted
                },
                validationResults: batch.validationResults
            },
            qualityTests: qualityTests.map(test => ({
                testId: test.testId,
                labName: test.labName,
                timestamp: test.timestamp,
                results: test.results,
                compliance: test.compliance,
                qualityValidation: test.qualityValidation,
                certificates: test.certificates
            })),
            transactions: batch.transactions,
            currentStatus: {
                stage: batch.stage,
                status: batch.status,
                lastUpdated: batch.lastUpdated
            },
            blockchain: {
                totalTransactions: batch.transactions.length,
                genesisBlock: batch.transactions[0]?.timestamp,
                latestBlock: batch.transactions[batch.transactions.length - 1]?.timestamp,
                networkId: 'herb-traceability-network'
            },
            verifiedAt: new Date().toISOString()
        };

        console.info('============= END : Get Batch Provenance ===========');
        return provenance;
    }

    // Utility functions
    async getSpeciesData(ctx, speciesCode) {
        const speciesData = await ctx.stub.getState(`SPECIES_${speciesCode}`);
        if (!speciesData || speciesData.length === 0) {
            return null;
        }
        return JSON.parse(speciesData.toString());
    }

    getCallerAttributes(ctx) {
        // In a real implementation, this would extract from the client identity
        // For demo purposes, we'll use a mock implementation
        return {
            role: 'collector', // This would be extracted from the certificate
            uuid: 'collector001', // This would be the user's unique identifier
            organization: 'Org1MSP'
        };
    }

    generateId(prefix) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}_${timestamp}_${random}`.toUpperCase();
    }

    // Query functions for analytics and reporting
    async queryBatchesBySpecies(ctx, speciesCode, startDate, endDate) {
        const query = {
            selector: {
                speciesCode: speciesCode,
                timestamp: {
                    $gte: startDate || '2020-01-01',
                    $lte: endDate || new Date().toISOString()
                }
            }
        };

        const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        
        for await (const res of resultsIterator) {
            results.push(JSON.parse(res.value.toString()));
        }

        return results;
    }

    async getSupplyChainAnalytics(ctx) {
        // Get all batches
        const batchesIterator = await ctx.stub.getStateByRange('BATCH_', 'BATCH_~');
        const batches = [];
        
        for await (const res of batchesIterator) {
            batches.push(JSON.parse(res.value.toString()));
        }

        // Calculate analytics
        const analytics = {
            totalBatches: batches.length,
            speciesDistribution: {},
            stageDistribution: {},
            complianceStats: {
                fullyCompliant: 0,
                conditionallyCompliant: 0,
                nonCompliant: 0
            },
            averageTransactionsPerBatch: 0,
            totalTransactions: 0
        };

        batches.forEach(batch => {
            // Species distribution
            analytics.speciesDistribution[batch.herbSpecies] = 
                (analytics.speciesDistribution[batch.herbSpecies] || 0) + 1;
            
            // Stage distribution
            analytics.stageDistribution[batch.stage] = 
                (analytics.stageDistribution[batch.stage] || 0) + 1;
            
            // Compliance stats
            if (batch.status === 'FULLY_COMPLIANT') analytics.complianceStats.fullyCompliant++;
            else if (batch.status === 'CONDITIONALLY_COMPLIANT') analytics.complianceStats.conditionallyCompliant++;
            else analytics.complianceStats.nonCompliant++;
            
            // Transaction stats
            analytics.totalTransactions += batch.transactions?.length || 0;
        });

        analytics.averageTransactionsPerBatch = batches.length > 0 ? 
            analytics.totalTransactions / batches.length : 0;

        return analytics;
    }
}

module.exports = HerbTraceabilityChaincode;
