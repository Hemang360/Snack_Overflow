
// honestly , need to redo this properly

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
    console.log('Node SDK server is running on 5000 port :) ');
});

app.get('/status', async function (req, res, next) {
    res.send("Server is up.");
});

// FHIR helpers (minimal mapping for Ayurveda-focused collection + tests)
function getRefId(ref) {
    if (!ref || typeof ref !== 'string') return null;
    const parts = ref.split('/');
    return parts[parts.length - 1] || null;
}

function extractAyurvedaExtensions(extensions) {
    if (!Array.isArray(extensions)) return {};
    const out = {};
    for (const ext of extensions) {
        if (!ext || !ext.url) continue;
        const url = String(ext.url);
        if (url.includes('speciesCode') && typeof ext.valueString === 'string') out.speciesCode = ext.valueString;
        if (url.includes('harvestZoneId') && typeof ext.valueString === 'string') out.harvestZone = ext.valueString;
        if (url.includes('harvestZoneName') && typeof ext.valueString === 'string') out.harvestZoneName = ext.valueString;
        if (url.includes('wildcrafted') && typeof ext.valueBoolean === 'boolean') out.wildcrafted = ext.valueBoolean;
        if (url.includes('organicCertified') && typeof ext.valueBoolean === 'boolean') out.organicCertified = ext.valueBoolean;
        if (url.includes('gpsLatitude') && typeof ext.valueDecimal === 'number') {
            out.gpsCoordinates = out.gpsCoordinates || {};
            out.gpsCoordinates.latitude = ext.valueDecimal;
        }
        if (url.includes('gpsLongitude') && typeof ext.valueDecimal === 'number') {
            out.gpsCoordinates = out.gpsCoordinates || {};
            out.gpsCoordinates.longitude = ext.valueDecimal;
        }
        if (url.includes('harvestMethod') && typeof ext.valueString === 'string') out.harvestMethod = ext.valueString;
        if (url.includes('weatherConditions') && typeof ext.valueString === 'string') out.weatherConditions = ext.valueString;
        if (url.includes('soilConditions') && typeof ext.valueString === 'string') out.soilConditions = ext.valueString;
        if (url.includes('plantAge') && (typeof ext.valueInteger === 'number' || typeof ext.valueDecimal === 'number')) out.plantAge = ext.valueInteger ?? ext.valueDecimal;
    }
    return out;
}

function mapFhirCollectionToChaincode(procResource, qtyObservation) {
    if (!procResource || (procResource.resourceType !== 'CollectionEvent' && procResource.resourceType !== 'Procedure')) {
        throw new Error('Invalid CollectionEvent resource');
    }
    const ext = extractAyurvedaExtensions(procResource.extension);
    const herbSpecies = (procResource.code && (procResource.code.text || (Array.isArray(procResource.code.coding) && procResource.code.coding[0] && procResource.code.coding[0].display))) || 'Unknown';
    const collectorId = getRefId(procResource.subject && procResource.subject.reference) || getRefId(procResource.performer && procResource.performer[0] && procResource.performer[0].actor && procResource.performer[0].actor.reference);
    const quantity = qtyObservation && qtyObservation.valueQuantity && typeof qtyObservation.valueQuantity.value === 'number' ? qtyObservation.valueQuantity.value : undefined;
    const unit = qtyObservation && qtyObservation.valueQuantity && (qtyObservation.valueQuantity.code || qtyObservation.valueQuantity.unit) || undefined;

    return {
        herbSpecies,
        speciesCode: ext.speciesCode,
        quantity,
        unit,
        gpsCoordinates: ext.gpsCoordinates,
        harvestMethod: ext.harvestMethod,
        weatherConditions: ext.weatherConditions,
        soilConditions: ext.soilConditions,
        plantAge: ext.plantAge,
        wildcrafted: ext.wildcrafted,
        organicCertified: ext.organicCertified,
        images: []
    };
}

// FHIR-aligned endpoints for protected API
app.post('/api/protected/collection-events', async function (req, res, next) {
    try {
        const { procedure, observation, userId } = req.body;

        // Accept either a wrapped object or a direct CollectionEvent in body
        const procRes = (procedure && (procedure.resourceType === 'CollectionEvent' || procedure.resourceType === 'Procedure')) ? procedure : ((req.body.resourceType === 'CollectionEvent' || req.body.resourceType === 'Procedure') ? req.body : null);
        const qtyObs = observation && observation.resourceType === 'Observation' ? observation : (Array.isArray(req.body.contained) ? req.body.contained.find(r => r.resourceType === 'Observation') : null);

        if (!procRes) {
            return res.status(400).json({ success: false, message: 'Expected CollectionEvent in body (or body.procedure)' });
        }

        const mapped = mapFhirCollectionToChaincode(procRes, qtyObs);
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId for transaction submitter' });
        }
        const result = await invoke.invokeTransaction('createCollectionEvent', mapped, userId);
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

app.get('/api/protected/collection-events', async function (req, res, next) {
    try {
        const { userId, collectorId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }
        const cid = String(collectorId || '');
        const result = await query.getQuery('getCollectorHarvests', { collectorId: cid }, String(userId));
        return res.status(200).json({ success: true, collectionEvents: Array.isArray(result) ? result : [] });
    } catch (err) {
        next(err);
    }
});

app.post('/api/protected/quality-tests', async function (req, res, next) {
    try {
        const { diagnosticReport, observations, userId } = req.body;
        if (!diagnosticReport || diagnosticReport.resourceType !== 'DiagnosticReport') {
            return res.status(400).json({ success: false, message: 'Expected FHIR DiagnosticReport in body.diagnosticReport' });
        }
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }

        // Minimal mapping to chaincode addQualityTest
        const dr = diagnosticReport;
        const targetRef = (Array.isArray(dr.basedOn) && dr.basedOn[0] && dr.basedOn[0].reference) || (dr.subject && dr.subject.reference) || '';
        const targetId = getRefId(targetRef) || dr.subjectId || dr.basedOnId || '';
        const targetType = (targetRef && targetRef.startsWith('Procedure/')) ? 'collection' : 'batch';
        const testType = (dr.code && (dr.code.text || (Array.isArray(dr.code.coding) && dr.code.coding[0] && dr.code.coding[0].code))) || 'unspecified';
        const labName = (Array.isArray(dr.performer) && dr.performer[0] && dr.performer[0].display) || 'Unknown Lab';
        const compliance = { ayushStandards: Array.isArray(dr.conclusionCode) && dr.conclusionCode.some(c => c.code === 'pass') };

        const testParameters = Array.isArray(observations) ? observations.map(o => ({ code: o.code && (o.code.text || (o.code.coding && o.code.coding[0] && o.code.coding[0].code)), value: o.valueQuantity || o.valueString || o.valueCodeableConcept })) : [];
        const results = testParameters;

        const payload = { targetId, targetType, testType, labName, testParameters, results, certificates: [], compliance };
        const result = await invoke.invokeTransaction('addQualityTest', payload, userId);
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Register collector with blockchain credentials
app.post('/registerCollector', async function (req, res, next) {
    try {
        const { cooperativeId, collectorId, name, city, password, specialization, cooperativeName } = req.body;

        // Validate required fields
        if (!cooperativeId || !collectorId || !name || !city || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: cooperativeId, collectorId, name, city, password"
            });
        }

        const collectorData = {
            name,
            city,
            password,
            specialization: specialization || '',
            cooperativeName: cooperativeName || 'Default Cooperative'
        };

        const result = await helper.registerCollector(cooperativeId, collectorId, collectorData);
        console.log("Collector registration result:", result);

        if (result.statusCode === 200) {
            res.status(200).json({
                success: true,
                message: result.message,
                collectorId: result.collectorId,
                data: result.chaincodeResponse
            });
        } else {
            res.status(result.statusCode).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.log("Error registering collector:", error);
        next(error);
    }
});

// Collector login
app.post('/loginCollector', async function (req, res, next) {
    try {
        const { collectorId, password } = req.body;

        if (!collectorId || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing collectorId or password"
            });
        }

        const result = await helper.loginCollector(collectorId, password);
        console.log("Collector login result:", result);

        if (result.statusCode === 200) {
            res.status(200).json({
                success: true,
                message: result.message,
                collectorId: result.collectorId,
                data: result.collectorData
            });
        } else {
            res.status(result.statusCode).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.log("Error during collector login:", error);
        next(error);
    }
});

// Register herbbatch (updated to use new blockchain structure)
app.post('/registerHerbbatch', async function (req, res, next) {
    try {
        const { collectorId, herbbatchId, name, dob, city } = req.body;

        // Validate required fields
        if (!collectorId || !herbbatchId || !name || !dob || !city) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: collectorId, herbbatchId, name, dob, city"
            });
        }

        const herbbatchData = {
            herbbatchId,
            name,
            dob,
            city
        };

        const result = await helper.registerHerbbatch(collectorId, herbbatchData);
        console.log("Herbbatch registration result:", result);

        if (result.statusCode === 200) {
            res.status(200).json({
                success: true,
                message: result.message,
                herbbatchId: result.herbbatchId,
                data: result.chaincodeResponse
            });
        } else {
            res.status(result.statusCode).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.log("Error registering herbbatch:", error);
        next(error);
    }
});

// Legacy endpoints for backward compatibility
app.post('/registerHerbbatch', async function (req, res, next) {
    try {
        const { adminId, collectorId, userId, name, dob, city } = req.body;

        if (!collectorId || !userId || !name || !dob || !city) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const result = await helper.registerUser(adminId, collectorId, userId, 'herbbatch', { name, dob, city });
        console.log("Legacy herbbatch registration result:", result);

        res.status(result.statusCode || 200).json({
            success: result.statusCode === 200,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.log("Error in legacy herbbatch registration:", error);
        next(error);
    }
});

app.post('/loginHerbbatch', async function (req, res, next) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId"
            });
        }

        const result = await helper.login(userId);
        console.log("Legacy login result:", result);

        res.status(result.statusCode || 200).json({
            success: result.statusCode === 200,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.log("Error in legacy login:", error);
        next(error);
    }
});

// Get collector details
app.post('/getCollectorDetails', async function (req, res, next) {
    try {
        const { collectorId, requesterId } = req.body;

        if (!collectorId || !requesterId) {
            return res.status(400).json({
                success: false,
                message: "Missing collectorId or requesterId"
            });
        }

        const result = await helper.getCollectorDetails(collectorId, requesterId);

        res.status(result.statusCode).json({
            success: result.statusCode === 200,
            message: result.message || "Request processed",
            data: result.collectorData
        });

    } catch (error) {
        console.log("Error getting collector details:", error);
        next(error);
    }
});

// Grant access to herbbatch
app.post('/grantAccess', async function (req, res, next) {
    try {
        const { userId, herbbatchId, collectorIdToGrant } = req.body;

        if (!userId || !herbbatchId || !collectorIdToGrant) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, herbbatchId, collectorIdToGrant"
            });
        }

        const result = await invoke.invokeTransaction('grantAccessToHerbbatch', {
            herbbatchId,
            collectorIdToGrant
        }, userId);

        res.status(200).json({
            success: true,
            message: "Access granted successfully",
            data: result
        });

    } catch (error) {
        console.log("Error granting access:", error);
        next(error);
    }
});

// Add medical record
app.post('/addRecord', async function (req, res, next) {
    try {
        const { userId, herbbatchId, diagnosis, prescription, notes } = req.body;

        if (!userId || !herbbatchId || !diagnosis || !prescription) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, herbbatchId, diagnosis, prescription"
            });
        }

        const result = await invoke.invokeTransaction('addRecord', {
            herbbatchId,
            diagnosis,
            prescription,
            notes: notes || ''
        }, userId);

        res.status(200).json({
            success: true,
            message: "Medical record added successfully",
            data: result
        });

    } catch (error) {
        console.log("Error adding medical record:", error);
        next(error);
    }
});

// Get all records by herbbatch ID
app.post('/getAllRecordsByHerbbatchId', async function (req, res, next) {
    try {
        const { userId, herbbatchId } = req.body;

        if (!userId || !herbbatchId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or herbbatchId"
            });
        }

        const result = await query.getQuery('getAllRecordsByHerbbatchId', { herbbatchId }, userId);
        console.log("Medical records result:", result);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error getting medical records:", error);
        next(error);
    }
});

// Get specific record by ID
app.post('/getRecordById', async function (req, res, next) {
    try {
        const { userId, herbbatchId, recordId } = req.body;

        if (!userId || !herbbatchId || !recordId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, herbbatchId, recordId"
            });
        }

        const result = await query.getQuery('getRecordById', { herbbatchId, recordId }, userId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error getting specific record:", error);
        next(error);
    }
});

// Add lab results
app.post('/addLabResult', async function (req, res, next) {
    try {
        const { userId, herbbatchId, testType, testResults, notes } = req.body;

        if (!userId || !herbbatchId || !testType || !testResults) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, herbbatchId, testType, testResults"
            });
        }

        const result = await invoke.invokeTransaction('addLabResult', {
            herbbatchId,
            testType,
            testResults,
            labAgentId: userId,
            notes: notes || ''
        }, userId);

        res.status(200).json({
            success: true,
            message: "Lab result added successfully",
            data: result
        });

    } catch (error) {
        console.log("Error adding lab result:", error);
        next(error);
    }
});

// Get all lab results by herbbatch ID
app.post('/getAllLabResultsByHerbbatchId', async function (req, res, next) {
    try {
        const { userId, herbbatchId } = req.body;

        if (!userId || !herbbatchId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or herbbatchId"
            });
        }

        const result = await query.getQuery('getAllLabResultsByHerbbatchId', { herbbatchId }, userId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error getting lab results:", error);
        next(error);
    }
});

// Get all collectors (admin function)
app.post('/getAllCollectors', async function (req, res, next) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId"
            });
        }

        const result = await query.getQuery('getAllCollectors', {}, userId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error getting collectors:", error);
        next(error);
    }
});

// Query transaction history
app.post('/queryHistoryOfAsset', async function (req, res, next) {
    try {
        const { userId, assetId } = req.body;

        if (!userId || !assetId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or assetId"
            });
        }

        const result = await query.getQuery('queryHistoryOfAsset', { assetId }, userId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error querying asset history:", error);
        next(error);
    }
});

// Fetch ledger (admin function)
app.post('/fetchLedger', async function (req, res, next) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId"
            });
        }

        const result = await query.getQuery('fetchLedger', {}, userId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log("Error fetching ledger:", error);
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});
