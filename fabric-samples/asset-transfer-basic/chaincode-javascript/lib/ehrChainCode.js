/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class ehrChainCode extends Contract {

    // Generate unique record ID
    recordIdGenerator(ctx){
        const txId = ctx.stub.getTxID();
        return `record-${txId}`;
    }

    getCallerAttributes(ctx) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const uuid = ctx.clientIdentity.getAttributeValue('uuid');

        if (!role || !uuid) {
            throw new Error('Missing role or uuid in client certificate');
        }

        return { role, uuid };
    }

    // Register collector with login credentials - creates blockchain entry
    async registerCollector(ctx, args) {
        const { collectorId, cooperativeName, name, city, password, specialization } = JSON.parse(args);
        console.log("ARGS-RAW:", args);
        console.log("ARGS:", collectorId, cooperativeName, name, city, specialization);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        // Only cooperative can register collectors
        if (orgMSP !== 'Org1MSP' || role !== 'cooperative') {
            throw new Error('Only cooperative can register collectors.');
        }

        // Check if collector already exists
        const collectorKey = ctx.stub.createCompositeKey('collector', [collectorId]);
        const existingCollector = await ctx.stub.getState(collectorKey);
        if (existingCollector && existingCollector.length > 0) {
            throw new Error(`Collector ${collectorId} already registered`);
        }

        const recordId = this.recordIdGenerator(ctx);
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        // Create collector record with login credentials
        const collectorRecord = {
            recordId,
            collectorId,
            cooperativeId: callerId,
            cooperativeName,
            name,
            city,
            specialization: specialization || '',
            password, // In production, this should be hashed
            status: 'active',
            registeredAt: timestamp,
            lastLogin: null
        };

        // Store collector in blockchain ledger
        await ctx.stub.putState(collectorKey, Buffer.from(stringify(collectorRecord)));

        console.log('REGISTER COLLECTOR RESULT:', stringify(collectorRecord));
        return stringify({
            message: `Collector ${collectorId} registered successfully`,
            collectorId: collectorId,
            recordId: recordId
        });
    }

    // Collector login function - validates against blockchain data
    async loginCollector(ctx, args) {
        const { collectorId, password } = JSON.parse(args);
        console.log("Login attempt for collector:", collectorId);

        // Retrieve collector record from blockchain
        const collectorKey = ctx.stub.createCompositeKey('collector', [collectorId]);
        const collectorJSON = await ctx.stub.getState(collectorKey);

        if (!collectorJSON || collectorJSON.length === 0) {
            throw new Error(`Collector ${collectorId} not found. Please register first.`);
        }

        const collector = JSON.parse(collectorJSON.toString());

        // Validate password (in production, use proper hashing)
        if (collector.password !== password) {
            throw new Error('Invalid credentials');
        }

        if (collector.status !== 'active') {
            throw new Error('Collector account is not active');
        }

        // Update last login time
        collector.lastLogin = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(collectorKey, Buffer.from(stringify(collector)));

        return stringify({
            message: 'Login successful',
            collectorId: collectorId,
            name: collector.name,
            cooperativeName: collector.cooperativeName,
            specialization: collector.specialization
        });
    }

    // Get collector details
    async getCollectorById(ctx, args) {
        const { collectorId } = JSON.parse(args);

        const collectorKey = ctx.stub.createCompositeKey('collector', [collectorId]);
        const collectorJSON = await ctx.stub.getState(collectorKey);

        if (!collectorJSON || collectorJSON.length === 0) {
            throw new Error(`Collector ${collectorId} not found`);
        }

        const collector = JSON.parse(collectorJSON.toString());

        // Remove password from response for security
        delete collector.password;

        return stringify(collector);
    }

    // Register herbbatch as blockchain ledger entry (like addRecord)
    async registerHerbbatch(ctx, args) {
        const { herbbatchId, name, dob, city, collectorId } = JSON.parse(args);
        console.log("ARGS-RAW:", args);
        console.log("ARGS:", herbbatchId, name, dob, city, collectorId);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        // Only collectors can register herbbatches
        if (role !== 'collector') {
            throw new Error('Only collectors can register herbbatches');
        }

        // Verify collector exists and is active
        const collectorKey = ctx.stub.createCompositeKey('collector', [callerId]);
        const collectorJSON = await ctx.stub.getState(collectorKey);
        if (!collectorJSON || collectorJSON.length === 0) {
            throw new Error(`Collector ${callerId} not found`);
        }

        const collector = JSON.parse(collectorJSON.toString());
        if (collector.status !== 'active') {
            throw new Error('Only active collectors can register herbbatches');
        }

        // Check if herbbatch already exists
        const herbbatchKey = ctx.stub.createCompositeKey('herbbatch', [herbbatchId]);
        const existingHerbbatch = await ctx.stub.getState(herbbatchKey);
        if (existingHerbbatch && existingHerbbatch.length > 0) {
            throw new Error(`Herbbatch ${herbbatchId} already exists`);
        }

        const recordId = this.recordIdGenerator(ctx);
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        // Create herbbatch record as ledger entry
        const herbbatchRecord = {
            recordId,
            herbbatchId,
            name,
            dob,
            city,
            registeredBy: callerId,
            cooperativeName: collector.cooperativeName,
            authorizedCollectors: [callerId], // Initially only registering collector has access
            status: 'active',
            registeredAt: timestamp
        };

        // Store in blockchain ledger like addRecord
        await ctx.stub.putState(herbbatchKey, Buffer.from(stringify(herbbatchRecord)));

        return stringify({
            message: `Herbbatch ${herbbatchId} registered successfully`,
            herbbatchId: herbbatchId,
            recordId: recordId,
            registeredBy: callerId
        });
    }

    // Grant access to herbbatch records (only herbbatch owner can do this)
    async grantAccessToHerbbatch(ctx, args) {
        const { herbbatchId, collectorIdToGrant } = JSON.parse(args);
        console.log("Granting access for herbbatch:", herbbatchId, "to collector:", collectorIdToGrant);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        // This should be called by the herbbatch owner (patient)
        // For now, we'll allow the registering collector to grant access
        if (role !== 'collector') {
            throw new Error('Only collectors can grant access to herbbatch records');
        }

        const herbbatchKey = ctx.stub.createCompositeKey('herbbatch', [herbbatchId]);
        const herbbatchJSON = await ctx.stub.getState(herbbatchKey);

        if (!herbbatchJSON || herbbatchJSON.length === 0) {
            throw new Error(`Herbbatch ${herbbatchId} not found`);
        }

        const herbbatch = JSON.parse(herbbatchJSON.toString());

        // Check if caller is authorized to grant access
        if (!herbbatch.authorizedCollectors.includes(callerId)) {
            throw new Error(`Collector ${callerId} is not authorized for herbbatch ${herbbatchId}`);
        }

        // Verify the collector to grant access exists
        const collectorKey = ctx.stub.createCompositeKey('collector', [collectorIdToGrant]);
        const collectorJSON = await ctx.stub.getState(collectorKey);
        if (!collectorJSON || collectorJSON.length === 0) {
            throw new Error(`Collector ${collectorIdToGrant} not found`);
        }

        // Grant access if not already granted
        if (!herbbatch.authorizedCollectors.includes(collectorIdToGrant)) {
            herbbatch.authorizedCollectors.push(collectorIdToGrant);
            herbbatch.lastUpdated = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

            await ctx.stub.putState(herbbatchKey, Buffer.from(stringify(herbbatch)));
        }

        return stringify({
            message: `Access granted to collector ${collectorIdToGrant} for herbbatch ${herbbatchId}`,
            authorizedCollectors: herbbatch.authorizedCollectors
        });
    }

    // Add medical record (existing function, updated for new structure)
    async addRecord(ctx, args) {
        const { herbbatchId, diagnosis, prescription, notes } = JSON.parse(args);
        console.log("ARGS_RAW", args);
        console.log("ARGS", herbbatchId, diagnosis, prescription);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'collector') {
            throw new Error('Only collectors can add medical records');
        }

        // Verify collector exists and is active
        const collectorKey = ctx.stub.createCompositeKey('collector', [callerId]);
        const collectorJSON = await ctx.stub.getState(collectorKey);
        if (!collectorJSON || collectorJSON.length === 0) {
            throw new Error(`Collector ${callerId} not found`);
        }

        const collector = JSON.parse(collectorJSON.toString());
        if (collector.status !== 'active') {
            throw new Error('Only active collectors can add records');
        }

        // Verify herbbatch exists
        const herbbatchKey = ctx.stub.createCompositeKey('herbbatch', [herbbatchId]);
        const herbbatchJSON = await ctx.stub.getState(herbbatchKey);
        if (!herbbatchJSON || herbbatchJSON.length === 0) {
            throw new Error(`Herbbatch ${herbbatchId} not found`);
        }

        const herbbatch = JSON.parse(herbbatchJSON.toString());

        // Check if collector is authorized
        if (!herbbatch.authorizedCollectors.includes(callerId)) {
            throw new Error(`Collector ${callerId} is not authorized for herbbatch ${herbbatchId}`);
        }

        const txId = ctx.stub.getTxID();
        const recordId = `MR-${txId}`;
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        // Create composite key for medical record
        const recordKey = ctx.stub.createCompositeKey('medicalRecord', [herbbatchId, recordId]);

        const medicalRecord = {
            recordId,
            herbbatchId,
            collectorId: callerId,
            collectorName: collector.name,
            diagnosis,
            prescription,
            notes: notes || '',
            timestamp
        };

        await ctx.stub.putState(recordKey, Buffer.from(stringify(medicalRecord)));

        return stringify({
            message: `Medical record ${recordId} added for herbbatch ${herbbatchId}`,
            recordId: recordId
        });
    }

    // Get all medical records for a herbbatch
    async getAllRecordsByHerbbatchId(ctx, args) {
        const { herbbatchId } = JSON.parse(args);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        // Verify authorization
        if (role === 'collector') {
            const herbbatchKey = ctx.stub.createCompositeKey('herbbatch', [herbbatchId]);
            const herbbatchJSON = await ctx.stub.getState(herbbatchKey);

            if (!herbbatchJSON || herbbatchJSON.length === 0) {
                throw new Error(`Herbbatch ${herbbatchId} not found`);
            }

            const herbbatch = JSON.parse(herbbatchJSON.toString());
            if (!herbbatch.authorizedCollectors.includes(callerId)) {
                throw new Error(`Collector ${callerId} is not authorized for herbbatch ${herbbatchId}`);
            }
        }

        const iterator = await ctx.stub.getStateByPartialCompositeKey('medicalRecord', [herbbatchId]);
        const results = [];

        for await (const res of iterator) {
            results.push(JSON.parse(res.value.toString('utf8')));
        }

        return stringify(results);
    }

    // Get specific medical record
    async getRecordById(ctx, args) {
        const { herbbatchId, recordId } = JSON.parse(args);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        // Verify authorization
        if (role === 'collector') {
            const herbbatchKey = ctx.stub.createCompositeKey('herbbatch', [herbbatchId]);
            const herbbatchJSON = await ctx.stub.getState(herbbatchKey);

            if (!herbbatchJSON || herbbatchJSON.length === 0) {
                throw new Error(`Herbbatch ${herbbatchId} not found`);
            }

            const herbbatch = JSON.parse(herbbatchJSON.toString());
            if (!herbbatch.authorizedCollectors.includes(callerId)) {
                throw new Error(`Collector ${callerId} is not authorized for herbbatch ${herbbatchId}`);
            }
        }

        const recordKey = ctx.stub.createCompositeKey('medicalRecord', [herbbatchId, recordId]);
        const recordJSON = await ctx.stub.getState(recordKey);

        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Medical record ${recordId} not found for herbbatch ${herbbatchId}`);
        }

        return recordJSON.toString();
    }

    // Get all collectors (admin function)
    async getAllCollectors(ctx, args) {
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'cooperative') {
            throw new Error('Only cooperatives can view all collectors');
        }

        const iterator = await ctx.stub.getStateByPartialCompositeKey('collector', []);
        const results = [];

        for await (const res of iterator) {
            const collector = JSON.parse(res.value.toString('utf8'));
            delete collector.password; // Remove password for security
            results.push(collector);
        }

        return stringify(results);
    }

    // Fetch ledger (admin function)
    async fetchLedger(ctx) {
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'cooperative') {
            throw new Error('Only cooperative can fetch blockchain ledger');
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Remove passwords for security
                if (record.password) {
                    delete record.password;
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }

        return stringify(allResults);
    }

    // Query transaction history
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
                        const asset = JSON.parse(res.value.value.toString('utf8'));
                        // Remove passwords for security
                        if (asset.password) {
                            delete asset.password;
                        }
                        tx.asset = asset;
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
