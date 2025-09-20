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

    // Enhanced caller attributes with fallback for admin identities
    getCallerAttributes(ctx) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const uuid = ctx.clientIdentity.getAttributeValue('uuid');
        const mspId = ctx.clientIdentity.getMSPID();
        const commonName = ctx.clientIdentity.getID();

        // Extract identity name from X.509 subject
        const identityName = this.extractIdentityName(commonName);

        // For admin identities, provide fallback role based on MSP and identity name
        if (!role || !uuid) {
            const adminRole = this.determineAdminRole(identityName, mspId);
            if (adminRole) {
                return { 
                    role: adminRole, 
                    uuid: identityName,
                    isAdmin: true,
                    mspId: mspId
                };
            }
            
            throw new Error(`Missing role or uuid in client certificate. Identity: ${identityName}, MSP: ${mspId}`);
        }

        return { 
            role, 
            uuid, 
            isAdmin: false,
            mspId: mspId
        };
    }

    // Extract identity name from X.509 subject
    extractIdentityName(commonName) {
        // Extract CN from subject string like "CN=admin::CN=ca-org1"
        const cnMatch = commonName.match(/CN=([^:,]+)/);
        return cnMatch ? cnMatch[1] : commonName;
    }

    // Determine admin role based on identity name and MSP
    determineAdminRole(identityName, mspId) {
        const adminMappings = {
            'Org1MSP': {
                'admin': 'regulator',
                'regulatorAdmin': 'regulator',
                'Regulator01': 'regulator'
            },
            'Org2MSP': {
                'admin': 'labOverseer',
                'labAdmin': 'labOverseer',
                'LabOverseer01': 'labOverseer'
            }
        };

        return adminMappings[mspId]?.[identityName] || null;
    }

    // Enhanced authorization check
    checkAuthorization(callerInfo, requiredRole, requiredMSP = null) {
        if (requiredMSP && callerInfo.mspId !== requiredMSP) {
            throw new Error(`Access denied: Operation requires ${requiredMSP} membership. Current MSP: ${callerInfo.mspId}`);
        }

        if (callerInfo.role !== requiredRole) {
            throw new Error(`Access denied: Operation requires '${requiredRole}' role. Current role: '${callerInfo.role}'`);
        }

        return true;
    }

    // Validation helper function for geo-location
    validateGeoLocation(latitude, longitude) {
        // Expanded approved zones covering major medicinal plant regions in India
        const approvedZones = [
            // North India Zones
            { name: 'Uttarakhand Himalayan Zone', minLat: 28.4, maxLat: 31.5, minLong: 77.6, maxLong: 81.1 },
            { name: 'Himachal Pradesh Mountain Zone', minLat: 30.2, maxLat: 33.1, minLong: 75.6, maxLong: 79.0 },
            { name: 'Kashmir Valley Zone', minLat: 32.5, maxLat: 35.0, minLong: 73.5, maxLong: 76.5 },
            { name: 'Punjab Agricultural Zone', minLat: 29.5, maxLat: 32.5, minLong: 73.8, maxLong: 76.8 },
            { name: 'Haryana Plains Zone', minLat: 27.4, maxLat: 30.9, minLong: 74.3, maxLong: 77.6 },

            // Central India Zones
            { name: 'Rajasthan Desert Zone', minLat: 23.0, maxLat: 30.2, minLong: 69.5, maxLong: 78.2 },
            { name: 'Gujarat Arid Zone', minLat: 20.1, maxLat: 24.7, minLong: 68.1, maxLong: 74.5 },
            { name: 'Madhya Pradesh Forest Zone', minLat: 21.1, maxLat: 26.9, minLong: 74.0, maxLong: 82.8 },
            { name: 'Chhattisgarh Tribal Zone', minLat: 17.8, maxLat: 24.1, minLong: 80.2, maxLong: 84.4 },
            { name: 'Uttar Pradesh Gangetic Zone', minLat: 23.9, maxLat: 30.4, minLong: 77.1, maxLong: 84.6 },

            // East India Zones
            { name: 'West Bengal Sundarbans Zone', minLat: 21.5, maxLat: 27.2, minLong: 85.8, maxLong: 89.9 },
            { name: 'Odisha Coastal Zone', minLat: 17.8, maxLat: 22.6, minLong: 81.3, maxLong: 87.5 },
            { name: 'Jharkhand Plateau Zone', minLat: 21.9, maxLat: 25.3, minLong: 83.3, maxLong: 87.9 },
            { name: 'Bihar Plains Zone', minLat: 24.3, maxLat: 27.8, minLong: 83.3, maxLong: 88.3 },
            { name: 'Assam Valley Zone', minLat: 24.1, maxLat: 28.0, minLong: 89.7, maxLong: 96.0 },
            { name: 'Meghalaya Hills Zone', minLat: 25.0, maxLat: 26.1, minLong: 89.8, maxLong: 92.8 },
            { name: 'Arunachal Pradesh Zone', minLat: 26.3, maxLat: 29.3, minLong: 91.5, maxLong: 97.4 },
            { name: 'Sikkim Alpine Zone', minLat: 27.1, maxLat: 28.1, minLong: 88.0, maxLong: 88.9 },

            // South India Zones
            { name: 'Kerala Western Ghats Zone', minLat: 8.0, maxLat: 12.8, minLong: 74.8, maxLong: 77.4 },
            { name: 'Karnataka Medicinal Zone', minLat: 11.5, maxLat: 18.5, minLong: 74.0, maxLong: 78.6 },
            { name: 'Tamil Nadu Herbal Zone', minLat: 8.0, maxLat: 13.6, minLong: 76.2, maxLong: 80.3 },
            { name: 'Andhra Pradesh Coastal Zone', minLat: 12.6, maxLat: 19.1, minLong: 76.7, maxLong: 84.8 },
            { name: 'Telangana Deccan Zone', minLat: 15.8, maxLat: 19.9, minLong: 77.2, maxLong: 81.3 },
            { name: 'Goa Coastal Zone', minLat: 14.9, maxLat: 15.8, minLong: 73.7, maxLong: 74.3 },

            // West India Zones
            { name: 'Maharashtra Western Ghats', minLat: 15.6, maxLat: 22.0, minLong: 72.6, maxLong: 80.9 },

            // Northeast Special Zones
            { name: 'Manipur Valley Zone', minLat: 23.8, maxLat: 25.7, minLong: 92.9, maxLong: 94.8 },
            { name: 'Nagaland Hills Zone', minLat: 25.2, maxLat: 27.0, minLong: 93.3, maxLong: 95.2 },
            { name: 'Tripura Forest Zone', minLat: 22.9, maxLat: 24.3, minLong: 91.1, maxLong: 92.3 },
            { name: 'Mizoram Hills Zone', minLat: 21.9, maxLat: 24.5, minLong: 92.2, maxLong: 93.4 },

            // Island Zones
            { name: 'Andaman Islands Zone', minLat: 6.5, maxLat: 14.0, minLong: 92.2, maxLong: 94.0 },
            { name: 'Lakshadweep Islands Zone', minLat: 8.0, maxLat: 12.3, minLong: 71.0, maxLong: 74.0 }
        ];

        for (const zone of approvedZones) {
            if (latitude >= zone.minLat && latitude <= zone.maxLat &&
                longitude >= zone.minLong && longitude <= zone.maxLong) {
                return { valid: true, zone: zone.name };
            }
        }
        return { valid: false, zone: null };
    }

    // Onboard farmer - Updated with better authorization
    async onboardFarmer(ctx, args) {
        const { farmerId, name, farmLocation, contact, certifications } = JSON.parse(args);
        const callerInfo = this.getCallerAttributes(ctx);

        // Check authorization - only regulators from Org1 can onboard farmers
        this.checkAuthorization(callerInfo, 'regulator', 'Org1MSP');

        const existing = await ctx.stub.getState(farmerId);
        if (existing && existing.length > 0) {
            throw new Error(`Farmer ${farmerId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'FARMER');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const provenance = {
            resourceType: "Provenance",
            id: recordId,
            target: [{ reference: `Farmer/${farmerId}` }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: `Location/${farmLocation}` },
            why: "Farmer onboarding and registration",
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-DocumentCompletion",
                    code: "AU",
                    display: "Authenticated"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "verifier",
                        display: "Verifier"
                    }]
                },
                who: { reference: `Practitioner/${callerInfo.uuid}` }
            }],
            entity: [{
                role: "source",
                what: { reference: `Farmer/${farmerId}` }
            }]
        };

        const farmer = {
            resourceType: "Bundle",
            type: "collection",
            entry: [{
                resource: {
                    resourceType: "Practitioner",
                    id: farmerId,
                    identifier: [{ value: farmerId }],
                    name: [{ text: name }],
                    address: [{ text: farmLocation }],
                    telecom: contact ? [{ system: "phone", value: contact }] : [],
                    qualification: certifications || []
                }
            }, {
                resource: provenance
            }],
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };

        await ctx.stub.putState(farmerId, Buffer.from(stringify(farmer)));
        return stringify(farmer);
    }

    // Onboard laboratory - Updated with better authorization
    async onboardLaboratory(ctx, args) {
        const { laboratoryId, labName, location, accreditation, certifications, contact } = JSON.parse(args);
        const callerInfo = this.getCallerAttributes(ctx);

        // Check authorization - only lab overseers from Org2 can onboard laboratories
        this.checkAuthorization(callerInfo, 'labOverseer', 'Org2MSP');

        const existing = await ctx.stub.getState(laboratoryId);
        if (existing && existing.length > 0) {
            throw new Error(`Laboratory ${laboratoryId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'LAB');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const provenance = {
            resourceType: "Provenance",
            id: recordId,
            target: [{ reference: `Organization/${laboratoryId}` }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: `Location/${location}` },
            why: "Laboratory onboarding and accreditation verification",
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-DocumentCompletion",
                    code: "AU",
                    display: "Authenticated"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "verifier",
                        display: "Verifier"
                    }]
                },
                who: { reference: `Practitioner/${callerInfo.uuid}` }
            }],
            entity: [{
                role: "source",
                what: { reference: `Organization/${laboratoryId}` }
            }]
        };

        const laboratory = {
            resourceType: "Bundle",
            type: "collection",
            entry: [{
                resource: {
                    resourceType: "Organization",
                    id: laboratoryId,
                    identifier: [{ value: laboratoryId }],
                    type: [{
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/organization-type",
                            code: "laboratory",
                            display: "Laboratory"
                        }]
                    }],
                    name: labName,
                    address: [{ text: location }],
                    telecom: contact ? [{ system: "phone", value: contact }] : [],
                    extension: [{
                        url: "http://example.org/fhir/StructureDefinition/accreditation",
                        valueString: JSON.stringify(accreditation)
                    }, {
                        url: "http://example.org/fhir/StructureDefinition/certifications",
                        valueString: JSON.stringify(certifications)
                    }]
                }
            }, {
                resource: provenance
            }],
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };

        await ctx.stub.putState(laboratoryId, Buffer.from(stringify(laboratory)));
        return stringify(laboratory);
    }

    // Onboard manufacturer - Updated with better authorization
    async onboardManufacturer(ctx, args) {
        const { manufacturerId, companyName, name, location, licenses, contact } = JSON.parse(args);
        const callerInfo = this.getCallerAttributes(ctx);

        // Check authorization - only regulators from Org1 can onboard manufacturers
        this.checkAuthorization(callerInfo, 'regulator', 'Org1MSP');

        const existing = await ctx.stub.getState(manufacturerId);
        if (existing && existing.length > 0) {
            throw new Error(`Manufacturer ${manufacturerId} already exists`);
        }

        const recordId = this.generateRecordId(ctx, 'MFG');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        const provenance = {
            resourceType: "Provenance",
            id: recordId,
            target: [{ reference: `Organization/${manufacturerId}` }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: `Location/${location}` },
            why: "Manufacturer onboarding and license verification",
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-DocumentCompletion",
                    code: "AU",
                    display: "Authenticated"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "verifier",
                        display: "Verifier"
                    }]
                },
                who: { reference: `Practitioner/${callerInfo.uuid}` }
            }],
            entity: [{
                role: "source",
                what: { reference: `Organization/${manufacturerId}` }
            }]
        };

        const manufacturer = {
            resourceType: "Bundle",
            type: "collection",
            entry: [{
                resource: {
                    resourceType: "Organization",
                    id: manufacturerId,
                    identifier: [{ value: manufacturerId }],
                    type: [{
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/organization-type",
                            code: "mfr",
                            display: "Manufacturer"
                        }]
                    }],
                    name: companyName,
                    address: [{ text: location }],
                    telecom: contact ? [{ system: "phone", value: contact }] : [],
                    extension: [{
                        url: "http://example.org/fhir/StructureDefinition/licenses",
                        valueString: JSON.stringify(licenses)
                    }, {
                        url: "http://example.org/fhir/StructureDefinition/contactPerson",
                        valueString: name
                    }]
                }
            }, {
                resource: provenance
            }],
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };

        await ctx.stub.putState(manufacturerId, Buffer.from(stringify(manufacturer)));
        return stringify(manufacturer);
    }

    // Create herb batch - Updated with better authorization
    async createHerbBatch(ctx, args) {
        const {
            batchId,
            herbName,
            scientificName,
            harvestDate,
            farmLocation,
            quantity,
            unit,
            gpsCoordinates,
            collectorId,
            environmentalData,
            cultivationMethod,
            harvestMethod,
            plantPart,
            images
        } = JSON.parse(args);

        const callerInfo = this.getCallerAttributes(ctx);

        // Check authorization - only farmers can create herb batches
        if (callerInfo.role !== 'farmer') {
            throw new Error('Only farmers can create herb batches');
        }

        const existing = await ctx.stub.getState(batchId);
        if (existing && existing.length > 0) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        // Geo-fencing validation
        const geoValidation = this.validateGeoLocation(
            gpsCoordinates.latitude,
            gpsCoordinates.longitude
        );

        if (!geoValidation.valid) {
            throw new Error(`Collection location not within approved harvesting zones. GPS: ${gpsCoordinates.latitude}, ${gpsCoordinates.longitude}`);
        }

        const recordId = this.generateRecordId(ctx, 'BATCH');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create FHIR-compliant Provenance
        const provenance = {
            resourceType: "Provenance",
            id: recordId,
            target: [{ reference: `Specimen/${batchId}` }],
            occurredDateTime: harvestDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: {
                reference: `Location/${farmLocation}`,
                extension: [{
                    url: "http://example.org/fhir/StructureDefinition/gps-coordinates",
                    valueString: JSON.stringify(gpsCoordinates)
                }, {
                    url: "http://example.org/fhir/StructureDefinition/approved-zone",
                    valueString: geoValidation.zone
                }]
            },
            why: "Medicinal herb collection and batch creation",
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "COLLECT",
                    display: "Collection"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "collector",
                        display: "Collector"
                    }]
                },
                who: { reference: `Practitioner/${collectorId || callerInfo.uuid}` }
            }],
            entity: [{
                role: "source",
                what: { reference: `Specimen/${batchId}` }
            }]
        };

        // Create FHIR Specimen resource for the batch
        const specimen = {
            resourceType: "Specimen",
            id: batchId,
            identifier: [{ value: batchId }],
            type: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "410942007",
                    display: "Medicinal plant material"
                }],
                text: `${herbName} (${scientificName || 'Species not specified'})`
            },
            subject: {
                reference: `Location/${farmLocation}`,
                display: farmLocation
            },
            collection: {
                collector: { reference: `Practitioner/${collectorId || callerInfo.uuid}` },
                collectedDateTime: harvestDate,
                quantity: {
                    value: parseFloat(quantity),
                    unit: unit || "kg",
                    system: "http://unitsofmeasure.org"
                },
                method: {
                    text: harvestMethod || "Manual harvesting"
                },
                bodySite: {
                    text: plantPart || "Whole plant"
                }
            },
            processing: [{
                description: "Initial collection and storage",
                timeDateTime: harvestDate
            }],
            container: [{
                description: "Field collection container"
            }],
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/cultivation-method",
                valueString: cultivationMethod || "Traditional"
            }, {
                url: "http://example.org/fhir/StructureDefinition/environmental-data",
                valueString: JSON.stringify(environmentalData)
            }, {
                url: "http://example.org/fhir/StructureDefinition/images",
                valueString: JSON.stringify(images || [])
            }]
        };

        // Create bundle with all resources
        const batch = {
            resourceType: "Bundle",
            type: "collection",
            id: batchId,
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
            entry: [{
                resource: specimen
            }, {
                resource: provenance
            }],
            meta: {
                tag: [{
                    system: "http://example.org/fhir/CodeSystem/batch-status",
                    code: "harvested",
                    display: "Harvested"
                }]
            },
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/batch-metadata",
                valueString: JSON.stringify({
                    farmerId: callerInfo.uuid,
                    herbName,
                    scientificName,
                    geoZone: geoValidation.zone,
                    qualityStatus: "pending_testing",
                    createdAt: timestamp
                })
            }]
        };

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));
        return stringify(batch);
    }

    // Add quality test - Updated with better authorization
    async addQualityTest(ctx, args) {
        const {
            batchId,
            labId,
            testType,
            testResults,
            testDate,
            certification,
            labLocation,
            testStatus,
            testMethod,
            equipmentUsed,
            observations,
            images,
            reportUrl
        } = JSON.parse(args);

        const callerInfo = this.getCallerAttributes(ctx);

        // Check authorization - only laboratories from Org2 or regulators from Org1 can add quality tests
        if (!((callerInfo.mspId === 'Org2MSP' && callerInfo.role === 'laboratory') ||
              (callerInfo.mspId === 'Org1MSP' && callerInfo.role === 'regulator'))) {
            throw new Error('Only laboratories (Org2) or regulators (Org1) can add quality test results');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'QTEST');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create FHIR Observation for quality test
        const observation = {
            resourceType: "Observation",
            id: recordId,
            identifier: [{ value: recordId }],
            status: "final",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "lab-test",
                    display: testType
                }],
                text: testType
            },
            subject: { reference: `Specimen/${batchId}` },
            effectiveDateTime: testDate,
            issued: new Date(parseInt(timestamp) * 1000).toISOString(),
            performer: [{
                reference: `Organization/${labId}`,
                display: `Laboratory: ${labId}`
            }],
            valueCodeableConcept: {
                coding: [{
                    system: "http://example.org/fhir/CodeSystem/test-result",
                    code: testStatus,
                    display: testStatus === "PASS" ? "Test Passed" : "Test Failed"
                }]
            },
            interpretation: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    code: testStatus === "PASS" ? "N" : "A",
                    display: testStatus === "PASS" ? "Normal" : "Abnormal"
                }]
            }],
            note: observations ? [{ text: observations }] : [],
            component: Object.entries(testResults || {}).map(([key, value]) => ({
                code: { text: key },
                valueQuantity: typeof value === 'object' ? value : { value: value }
            })),
            method: testMethod ? { text: testMethod } : undefined,
            device: equipmentUsed ? { display: equipmentUsed } : undefined,
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/certification",
                valueString: JSON.stringify(certification)
            }, {
                url: "http://example.org/fhir/StructureDefinition/test-images",
                valueString: JSON.stringify(images || [])
            }, {
                url: "http://example.org/fhir/StructureDefinition/report-url",
                valueUrl: reportUrl
            }]
        };

        // Create Provenance for the test
        const testProvenance = {
            resourceType: "Provenance",
            id: `${recordId}-prov`,
            target: [{ reference: `Observation/${recordId}` }],
            occurredDateTime: testDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: `Location/${labLocation}` },
            why: `Quality testing - ${testType}`,
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "LABTEST",
                    display: "Laboratory Test"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "performer",
                        display: "Performer"
                    }]
                },
                who: { reference: `Practitioner/${callerInfo.uuid}` },
                onBehalfOf: { reference: `Organization/${labId}` }
            }],
            entity: [{
                role: "source",
                what: { reference: `Specimen/${batchId}` }
            }]
        };

        // Add test results to batch bundle
        batch.entry.push({
            resource: observation
        }, {
            resource: testProvenance
        });

        // Update batch metadata
        const metadata = JSON.parse(batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString);

        metadata.qualityStatus = testStatus === "PASS" ? "tested_passed" : "tested_failed";
        metadata.lastTestDate = testDate;
        metadata.testedBy = labId;

        batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString =
            JSON.stringify(metadata);

        // Update batch status tag
        batch.meta.tag.push({
            system: "http://example.org/fhir/CodeSystem/quality-status",
            code: testStatus,
            display: testStatus === "PASS" ? "Quality Test Passed" : "Quality Test Failed"
        });

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));

        return stringify({
            message: `Quality test ${testType} completed for batch ${batchId}`,
            status: testStatus,
            testId: recordId,
            observation,
            provenance: testProvenance
        });
    }

    // Add processing step - Updated with better authorization
    async addProcessingStep(ctx, args) {
        const {
            batchId,
            processingType,
            processingDate,
            processingLocation,
            inputQuantity,
            outputQuantity,
            processingDetails,
            equipmentUsed,
            operatorId,
            temperature,
            duration,
            additionalParameters,
            images,
            notes
        } = JSON.parse(args);

        const callerInfo = this.getCallerAttributes(ctx);

        if (callerInfo.role !== 'manufacturer' && callerInfo.role !== 'processor') {
            throw new Error('Only manufacturers or processors can add processing steps');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'PROCESS');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create FHIR Procedure for processing step
        const procedure = {
            resourceType: "Procedure",
            id: recordId,
            identifier: [{ value: recordId }],
            status: "completed",
            code: {
                text: processingType
            },
            subject: { reference: `Specimen/${batchId}` },
            performedDateTime: processingDate,
            recorder: { reference: `Practitioner/${callerInfo.uuid}` },
            performer: [{
                actor: { reference: `Practitioner/${operatorId || callerInfo.uuid}` }
            }],
            location: { reference: `Location/${processingLocation}` },
            note: notes ? [{ text: notes }] : [],
            usedReference: equipmentUsed ? [{ display: equipmentUsed }] : [],
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/processing-details",
                valueString: JSON.stringify({
                    inputQuantity,
                    outputQuantity,
                    temperature,
                    duration,
                    processingDetails,
                    additionalParameters
                })
            }, {
                url: "http://example.org/fhir/StructureDefinition/processing-images",
                valueString: JSON.stringify(images || [])
            }]
        };

        // Create Provenance for processing
        const processingProvenance = {
            resourceType: "Provenance",
            id: `${recordId}-prov`,
            target: [{ reference: `Procedure/${recordId}` }],
            occurredDateTime: processingDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: { reference: `Location/${processingLocation}` },
            why: `Processing step - ${processingType}`,
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "PROC",
                    display: "Processing"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "performer",
                        display: "Performer"
                    }]
                },
                who: { reference: `Practitioner/${callerInfo.uuid}` }
            }],
            entity: [{
                role: "revision",
                what: { reference: `Specimen/${batchId}` }
            }]
        };

        // Add processing to batch bundle
        batch.entry.push({
            resource: procedure
        }, {
            resource: processingProvenance
        });

        // Update batch metadata
        const metadata = JSON.parse(batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString);

        metadata.lastProcessingDate = processingDate;
        metadata.currentQuantity = outputQuantity || inputQuantity;
        metadata.processingStage = processingType;

        batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString =
            JSON.stringify(metadata);

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));

        return stringify({
            message: `Processing step ${processingType} completed for batch ${batchId}`,
            processId: recordId,
            procedure,
            provenance: processingProvenance
        });
    }

    // Transfer batch ownership - Updated with better authorization
    async transferBatch(ctx, args) {
        const { batchId, toEntityId, transferReason, transferLocation, documents } = JSON.parse(args);
        const callerInfo = this.getCallerAttributes(ctx);

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} not found`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const recordId = this.generateRecordId(ctx, 'TRANSFER');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create FHIR Provenance for transfer
        const transferProvenance = {
            resourceType: "Provenance",
            id: recordId,
            target: [{ reference: `Specimen/${batchId}` }],
            occurredDateTime: new Date(parseInt(timestamp) * 1000).toISOString(),
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            location: transferLocation ? { reference: `Location/${transferLocation}` } : undefined,
            why: transferReason,
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "TRANSFER",
                    display: "Transfer"
                }]
            },
            agent: [
                {
                    type: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                            code: "source",
                            display: "Source"
                        }]
                    },
                    who: { reference: `Practitioner/${callerInfo.uuid}` }
                },
                {
                    type: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                            code: "custodian",
                            display: "Custodian"
                        }]
                    },
                    who: { reference: `Practitioner/${toEntityId}` }
                }
            ],
            entity: [{
                role: "revision",
                what: { reference: `Specimen/${batchId}` }
            }],
            extension: documents ? [{
                url: "http://example.org/fhir/StructureDefinition/transfer-documents",
                valueString: JSON.stringify(documents)
            }] : []
        };

        // Add transfer to batch bundle
        batch.entry.push({
            resource: transferProvenance
        });

        // Update batch metadata
        const metadata = JSON.parse(batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString);

        metadata.currentOwner = toEntityId;
        metadata.lastTransferDate = new Date(parseInt(timestamp) * 1000).toISOString();

        batch.extension.find(ext =>
            ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString =
            JSON.stringify(metadata);

        await ctx.stub.putState(batchId, Buffer.from(stringify(batch)));

        return stringify({
            message: `Batch ${batchId} transferred to ${toEntityId}`,
            transferId: recordId,
            provenance: transferProvenance
        });
    }

    // Create medicine from batches - Updated with better authorization
    async createMedicine(ctx, args) {
        const {
            medicineId,
            medicineName,
            batchIds,
            manufacturingDate,
            expiryDate,
            dosageForm,
            strength,
            packagingDetails,
            storageConditions,
            batchNumber,
            regulatoryApprovals
        } = JSON.parse(args);

        const callerInfo = this.getCallerAttributes(ctx);

        if (callerInfo.role !== 'manufacturer') {
            throw new Error('Only manufacturers can create medicines');
        }

        const existing = await ctx.stub.getState(medicineId);
        if (existing && existing.length > 0) {
            throw new Error(`Medicine ${medicineId} already exists`);
        }

        // Verify all batches exist
        const batchDetails = [];
        for (const batchId of batchIds) {
            const batchJSON = await ctx.stub.getState(batchId);
            if (!batchJSON || batchJSON.length === 0) {
                throw new Error(`Batch ${batchId} not found`);
            }
            batchDetails.push(JSON.parse(batchJSON.toString()));
        }

        const recordId = this.generateRecordId(ctx, 'MED');
        const timestamp = ctx.stub.getTxTimestamp().seconds.low.toString();

        // Create FHIR Medication resource
        const medication = {
            resourceType: "Medication",
            id: medicineId,
            identifier: [{ value: medicineId }],
            code: {
                text: medicineName
            },
            status: "active",
            manufacturer: { reference: `Organization/${callerInfo.uuid}` },
            form: dosageForm ? { text: dosageForm } : undefined,
            amount: strength ? { text: strength } : undefined,
            batch: {
                lotNumber: batchNumber || medicineId,
                expirationDate: expiryDate
            },
            ingredient: batchIds.map(batchId => ({
                itemReference: { reference: `Specimen/${batchId}` },
                isActive: true
            })),
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/packaging",
                valueString: JSON.stringify(packagingDetails)
            }, {
                url: "http://example.org/fhir/StructureDefinition/storage",
                valueString: JSON.stringify(storageConditions)
            }, {
                url: "http://example.org/fhir/StructureDefinition/approvals",
                valueString: JSON.stringify(regulatoryApprovals)
            }]
        };

        // Create Provenance for manufacturing
        const manufacturingProvenance = {
            resourceType: "Provenance",
            id: `${recordId}-prov`,
            target: [{ reference: `Medication/${medicineId}` }],
            occurredDateTime: manufacturingDate,
            recorded: new Date(parseInt(timestamp) * 1000).toISOString(),
            why: "Medicine manufacturing from herbal batches",
            activity: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "MANU",
                    display: "Manufacturing"
                }]
            },
            agent: [{
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "manufacturer",
                        display: "Manufacturer"
                    }]
                },
                who: { reference: `Organization/${callerInfo.uuid}` }
            }],
            entity: batchIds.map(batchId => ({
                role: "source",
                what: { reference: `Specimen/${batchId}` }
            }))
        };

        // Generate QR code data
        const qrData = {
            medicineId,
            verificationUrl: `https://verify.example.com/${medicineId}`,
            timestamp: parseInt(timestamp),
            manufacturer: callerInfo.uuid
        };

        // Create bundle with all resources
        const medicine = {
            resourceType: "Bundle",
            type: "collection",
            id: medicineId,
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
            entry: [{
                resource: medication
            }, {
                resource: manufacturingProvenance
            }],
            meta: {
                tag: [{
                    system: "http://example.org/fhir/CodeSystem/medicine-status",
                    code: "manufactured",
                    display: "Manufactured"
                }]
            },
            extension: [{
                url: "http://example.org/fhir/StructureDefinition/qr-code",
                valueString: JSON.stringify(qrData)
            }, {
                url: "http://example.org/fhir/StructureDefinition/medicine-metadata",
                valueString: JSON.stringify({
                    manufacturerId: callerInfo.uuid,
                    manufacturingDate,
                    expiryDate,
                    batchCount: batchIds.length
                })
            }]
        };

        await ctx.stub.putState(medicineId, Buffer.from(stringify(medicine)));
        return stringify(medicine);
    }

    // Consumer verification - get complete supply chain info
    async getConsumerInfo(ctx, args) {
        const { medicineId } = JSON.parse(args);

        const medicineJSON = await ctx.stub.getState(medicineId);
        if (!medicineJSON || medicineJSON.length === 0) {
            throw new Error(`Medicine ${medicineId} not found`);
        }

        const medicine = JSON.parse(medicineJSON.toString());
        const medicationResource = medicine.entry.find(e => e.resource.resourceType === "Medication").resource;

        const consumerInfo = {
            medicine: {
                id: medicineId,
                name: medicationResource.code.text,
                manufacturer: medicationResource.manufacturer.reference,
                expiryDate: medicationResource.batch.expirationDate,
                form: medicationResource.form,
                qrCode: JSON.parse(medicine.extension.find(ext =>
                    ext.url === "http://example.org/fhir/StructureDefinition/qr-code").valueString)
            },
            ingredients: [],
            supplyChain: [],
            certificates: []
        };

        // Get detailed info for each batch
        for (const ingredient of medicationResource.ingredient) {
            const batchId = ingredient.itemReference.reference.split('/')[1];
            const batchJSON = await ctx.stub.getState(batchId);

            if (batchJSON && batchJSON.length > 0) {
                const batch = JSON.parse(batchJSON.toString());
                const specimen = batch.entry.find(e => e.resource.resourceType === "Specimen").resource;
                const metadata = JSON.parse(batch.extension.find(ext =>
                    ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata").valueString);

                // Add ingredient info
                consumerInfo.ingredients.push({
                    batchId: batchId,
                    herbName: metadata.herbName,
                    scientificName: metadata.scientificName,
                    harvestLocation: specimen.subject.display,
                    harvestDate: specimen.collection.collectedDateTime,
                    quantity: specimen.collection.quantity,
                    qualityStatus: metadata.qualityStatus,
                    geoZone: metadata.geoZone
                });

                // Extract all events from batch bundle
                batch.entry.forEach(entry => {
                    const resource = entry.resource;

                    if (resource.resourceType === "Provenance") {
                        consumerInfo.supplyChain.push({
                            event: resource.activity.coding[0].display,
                            date: resource.occurredDateTime,
                            location: resource.location?.reference,
                            reason: resource.why,
                            agents: resource.agent.map(a => ({
                                role: a.type.coding[0].display,
                                who: a.who.reference
                            }))
                        });
                    }

                    if (resource.resourceType === "Observation") {
                        consumerInfo.certificates.push({
                            type: "Quality Test",
                            testType: resource.code.text,
                            date: resource.effectiveDateTime,
                            status: resource.valueCodeableConcept.coding[0].display,
                            laboratory: resource.performer[0].reference
                        });
                    }
                });
            }
        }

        // Sort supply chain by date
        consumerInfo.supplyChain.sort((a, b) => new Date(a.date) - new Date(b.date));

        return stringify(consumerInfo);
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

    // Get all batches by farmer - Updated with better authorization
    async getBatchesByFarmer(ctx, args) {
        const { farmerId } = JSON.parse(args);
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];

        try {
            let result = await iterator.next();
            while (!result.done) {
                if (result.value && result.value.value) {
                    try {
                        const record = JSON.parse(result.value.value.toString('utf8'));

                        // Check if it's a batch bundle and belongs to the farmer
                        if (record.resourceType === "Bundle" && record.entry) {
                            const metadata = record.extension?.find(ext =>
                                ext.url === "http://example.org/fhir/StructureDefinition/batch-metadata");

                            if (metadata) {
                                const metadataObj = JSON.parse(metadata.valueString);
                                if (metadataObj.farmerId === farmerId) {
                                    results.push({
                                        batchId: record.id,
                                        herbName: metadataObj.herbName,
                                        scientificName: metadataObj.scientificName,
                                        qualityStatus: metadataObj.qualityStatus,
                                        createdAt: metadataObj.createdAt,
                                        currentQuantity: metadataObj.currentQuantity,
                                        geoZone: metadataObj.geoZone
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        // Skip non-JSON or malformed records
                    }
                }
                result = await iterator.next();
            }
        } finally {
            await iterator.close();
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
        const supplyChain = {
            mainItem: item,
            sourceBatches: [],
            timeline: []
        };

        // If it's a medicine, get source batches
        if (item.resourceType === "Bundle" && item.entry) {
            const medication = item.entry.find(e => e.resource.resourceType === "Medication");

            if (medication) {
                for (const ingredient of medication.resource.ingredient) {
                    const batchId = ingredient.itemReference.reference.split('/')[1];
                    const batchJSON = await ctx.stub.getState(batchId);

                    if (batchJSON && batchJSON.length > 0) {
                        const batch = JSON.parse(batchJSON.toString());
                        supplyChain.sourceBatches.push(batch);

                        // Extract timeline events from batch
                        batch.entry.forEach(entry => {
                            if (entry.resource.resourceType === "Provenance") {
                                supplyChain.timeline.push({
                                    date: entry.resource.occurredDateTime,
                                    event: entry.resource.activity.coding[0].display,
                                    itemId: batchId,
                                    location: entry.resource.location?.reference
                                });
                            }
                        });
                    }
                }
            }
        }

        // Sort timeline by date
        supplyChain.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

        return JSON.stringify(supplyChain);
    }

    // Fetch all ledger data - Updated with better authorization
    async fetchLedger(ctx) {
        const callerInfo = this.getCallerAttributes(ctx);

        if (callerInfo.role !== 'regulator') {
            throw new Error('Only regulator can fetch ledger');
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');

        try {
            let result = await iterator.next();
            while (!result.done) {
                if (result.value && result.value.value) {
                    const strValue = result.value.value.toString('utf8');
                    try {
                        const record = JSON.parse(strValue);
                        allResults.push(record);
                    } catch (err) {
                        allResults.push({ rawData: strValue });
                    }
                }
                result = await iterator.next();
            }
        } finally {
            await iterator.close();
        }

        return stringify(allResults);
    }

    // Query history of asset
    async queryHistoryOfAsset(ctx, args) {
        const { assetId } = JSON.parse(args);
        const iterator = await ctx.stub.getHistoryForKey(assetId);
        const results = [];

        try {
            let result = await iterator.next();
            while (!result.done) {
                if (result.value) {
                    const tx = {
                        txId: result.value.txId,
                        timestamp: result.value.timestamp ?
                            new Date(result.value.timestamp.seconds.low * 1000).toISOString() : null,
                        isDelete: result.value.isDelete
                    };

                    if (result.value.value && result.value.value.length > 0 && !result.value.isDelete) {
                        try {
                            tx.data = JSON.parse(result.value.value.toString('utf8'));
                        } catch (err) {
                            tx.data = result.value.value.toString('utf8');
                        }
                    }

                    results.push(tx);
                }
                result = await iterator.next();
            }
        } finally {
            await iterator.close();
        }

        return JSON.stringify(results);
    }
}

module.exports = ehrChainCode;