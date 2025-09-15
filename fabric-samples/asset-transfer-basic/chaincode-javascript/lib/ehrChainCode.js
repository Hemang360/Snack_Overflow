

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


    //   1. Goverment - network owner - admin access
    //     2. Cooperative - Network orgination - Read/Write (collector data)
    //     3. Practicing physician/Collector - Read/Write (Herbbatch data w.r.t to cooperative)
    //     4. Diagnostics center - Read/Write (Herbbatch records w.r.t to diagnostics center)
    //     5. Pharmacies - Read/Write (Herbbatch prescriptions w.r.t to pharma center)
    //     6. Researchers / R&D - Read data of cooperative conect, pateint based on consent.
    //     7. Lab companies - Read/Write (Herbbatch claims)
    //     8. Herbbatch - Read/Write (All generated herbbatch data)

    // data structure if herbbatch

    // herbbatch-001: [{
    //     "herbbatchId": "P001",
    //     "name": "John Doe",
    //     "dob": "1990-01-01",
    //     "authorizedCollectors": ["D001", "D002"]
    //  }]

    // "record-001":[
    //         {
    //         "recordId": "R001",
    //         "collectorId": "D001",
    //         "diagnosis": "Flu",
    //         "prescription": "Rest and hydration",
    //         "timestamp": "2024-01-01T10:00:00Z"
    //         }
    //     ],

    // generate recordId.
    recordIdGenerator(ctx){
        const txId = ctx.stub.getTxID();  // always unique per transaction
         return `record-${txId}`;
    }

    // onboard collector in ledger by cooperative
    async onboardCollector(ctx, args) {

        const { collectorId, cooperativeName, name, city } = JSON.parse(args);
        console.log("ARGS-RAW:",args)
        console.log("ARGS:",collectorId, cooperativeName, name, city)
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
        const orgMSP = ctx.clientIdentity.getMSPID();

        if (orgMSP !== 'Org1MSP' || role !== 'cooperative') {
            throw new Error('Only cooperative can onboard collector.');
        }

        const collectorJSON = await ctx.stub.getState(collectorId);
        if (collectorJSON && collectorJSON.length > 0) {
            throw new Error(`Collector ${collectorId} already registerd by ${callerId}`);
        }

        const recordId = this.recordIdGenerator(ctx);
        console.log("Record ID", recordId);

        const record = {
            recordId,
            collectorId,
            cooperativeId: callerId,
            name,
            cooperativeName,
            city,
           timestamp: ctx.stub.getTxTimestamp().seconds.low.toString()
        };

        const result = await ctx.stub.putState(collectorId, Buffer.from(stringify(record)));
        console.log('ONBOARD COLLECTOR RESULT:',stringify(result))
        return stringify(record);
    }

      // onboard lab agent by lab company
    async onboardLabAgent(ctx, args){
        const {agentId, labCompany, name, city} = JSON.parse(args);
        console.log("ARGS-RAW:",args)
        console.log("ARGS-split 4:",agentId, labCompany, name, city)
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);
         const orgMSP = ctx.clientIdentity.getMSPID();

        if (orgMSP !== 'Org2MSP' || role !== 'labAdmin') {
            throw new Error('Only lab org admin can onbord lab agent');
        }

        const labJSON = await ctx.stub.getState(agentId);
        console.log("LAB DATA",labJSON)
        if (labJSON && labJSON.length > 0) {
            throw new Error(`lab ${agentId} already registerd by ${callerId}`);
        }

        const recordId = this.recordIdGenerator(ctx);
        console.log("Record ID", recordId);

        const record = {
            recordId,
            agentId,
            labId: callerId,
            name,
            labCompany,
            city,
            timestamp: ctx.stub.getTxTimestamp().seconds.low.toString()
        };

        await ctx.stub.putState(agentId, Buffer.from(stringify(record)));
        return stringify(record);
    }

    // this function
   async grantAccess(ctx, args) {
    const {herbbatchId, collectorIdToGrant} = JSON.parse(args);
    console.log("ARGS-RWA", args)
    console.log("ARGS", herbbatchId, collectorIdToGrant)

     const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'herbbatch') {
            throw new Error('Only herbbatches can grant access');
        }

        if (callerId !== herbbatchId) {
            throw new Error('Caller is not the owner of this herbbatch record');
        }

        const herbbatchJSON = await ctx.stub.getState(herbbatchId);
        if (!herbbatchJSON || herbbatchJSON.length === 0) {
            throw new Error(`Herbbatch ${herbbatchId} not found`);
        }

        const herbbatch = JSON.parse(herbbatchJSON.toString());

        if (herbbatch.authorizedCollectors.includes(collectorIdToGrant)) {
            throw new Error(`Collector ${collectorIdToGrant} already authorized`);
        }

        herbbatch.authorizedCollectors.push(collectorIdToGrant);
        await ctx.stub.putState(herbbatchId, Buffer.from(stringify(herbbatch)));

        return `Access granted to collector ${collectorIdToGrant}`;
    }

    getCallerAttributes(ctx) {
      const role = ctx.clientIdentity.getAttributeValue('role');
      const uuid = ctx.clientIdentity.getAttributeValue('uuid');

      if (!role || !uuid) {
          throw new Error('Missing role or uuid in client certificate');
      }

      return { role, uuid };
    }

     // add record | only collector can add record
     // 1. first herbbatch need to grand access to collector to add record.
    // async addRecord(ctx, herbbatchId, recordId, diagnosis, prescription) {
    //     const { role, uuid: callerId } = this.getCallerAttributes(ctx);

    //     if (role !== 'collector') {
    //         throw new Error('Only collectors can add records');
    //     }

    //     const herbbatchJSON = await ctx.stub.getState(herbbatchId);
    //     if (!herbbatchJSON || herbbatchJSON.length === 0) {
    //         throw new Error(`Herbbatch ${herbbatchId} not found`);
    //     }

    //     const herbbatch = JSON.parse(herbbatchJSON.toString());

    //     if (!herbbatch.authorizedCollectors.includes(callerId)) {
    //         throw new Error(`Collector ${callerId} is not authorized`);
    //     }

    //     const record = {
    //         recordId,
    //         collectorId: callerId,
    //         diagnosis,
    //         prescription,
    //        timestamp: ctx.stub.getTxTimestamp().seconds.low.toString()
    //     };

    //     herbbatch.records.push(record);
    //     await ctx.stub.putState(herbbatchId, Buffer.from(stringify(herbbatch)));

    //     return `Record ${recordId} added by collector ${callerId}`;
    // }

    async onboardHerbbatch(ctx, args) {

        const {herbbatchId, name, dob, city} = JSON.parse(args);

        console.log("ARGS-RWA", args)
        console.log("ARGS-split 4", herbbatchId, name, dob, city)


        const key = `herbbatch-${herbbatchId}`;

        const existing = await ctx.stub.getState(key);
        if (existing && existing.length > 0) {
            throw new Error(`Herbbatch ${herbbatchId} already exists`);
        }

        const herbbatch = {
            herbbatchId,
            name,
            dob,
            city,
            authorizedCollectors: []
        };

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(herbbatch)));
        return `Herbbatch ${herbbatchId} registered`;
    }

    async addRecord(ctx, args) {

        const {herbbatchId, diagnosis, prescription} = JSON.parse(args);
        console.log("ARGS_RAW",args)
        console.log("ARGS", herbbatchId, diagnosis, prescription)
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'collector') {
            throw new Error('Only collectors can add records');
        }

        const herbbatchJSON = await ctx.stub.getState(`herbbatch-${herbbatchId}`);
        if (!herbbatchJSON || herbbatchJSON.length === 0) {
            throw new Error(`Herbbatch ${herbbatchId} not found`);
        }

        console.log("==herbbatch record==",herbbatchJSON);
        const herbbatch = JSON.parse(herbbatchJSON.toString());

        console.log("==herbbatch record parsed==",herbbatch);

        if (!herbbatch.authorizedCollectors.includes(callerId)) {
            throw new Error(`Collector ${callerId} is not authorized for herbbatch ${herbbatchId}`);
        }

        const txId = ctx.stub.getTxID();
        const recordId = `R-${txId}`;
        const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        const recordKey = ctx.stub.createCompositeKey('record', [herbbatchId, recordId]);

        const record = {
            recordId,
            herbbatchId,
            collectorId: callerId,
            diagnosis,
            prescription,
            timestamp
        };

        await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(record)));
        return JSON.stringify({message: `Record ${recordId} added for herbbatch ${herbbatchId}`});
    }

    async getAllRecordsByHerbbatchId(ctx, args) {
        const {herbbatchId} = JSON.parse(args);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('record', [herbbatchId]);
        const results = [];

        for await (const res of iterator) {
            results.push(JSON.parse(res.value.toString('utf8')));
        }

        return JSON.stringify(results);
    }

    async getRecordById(ctx, args) {
        const {herbbatchId, recordId} = JSON.parse(args);
        const recordKey = ctx.stub.createCompositeKey('record', [herbbatchId, recordId]);
        const recordJSON = await ctx.stub.getState(recordKey);

        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Record ${recordId} not found for herbbatch ${herbbatchId}`);
        }

        return recordJSON.toString();
    }

    async grantAccess(ctx, args) {
        const {herbbatchId, collectorIdToGrant} = JSON.parse(args);
        console.log("ARGS-grand access", args);
        console.log("ARGS grand access", herbbatchId, collectorIdToGrant);

        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'herbbatch') {
            throw new Error('Only herbbatches can grant access');
        }

        if (callerId !== herbbatchId) {
            throw new Error('Caller is not the owner of this herbbatch record');
        }

        const key = `herbbatch-${herbbatchId}`;
        const herbbatchJSON = await ctx.stub.getState(key);
        if (!herbbatchJSON || herbbatchJSON.length === 0) {
            throw new Error(`Herbbatch ${herbbatchId} not found`);
        }

        const herbbatch = JSON.parse(herbbatchJSON.toString());

        if (!herbbatch.authorizedCollectors.includes(collectorIdToGrant)) {
            herbbatch.authorizedCollectors.push(collectorIdToGrant);
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(herbbatch)));
        }

        return JSON.stringify({message:`Collector ${collectorIdToGrant} authorized`});
    }

    // GetAllAssets returns all assets found in the world state.
    async fetchLedger(ctx) {
        // call by admin only
        const { role, uuid: callerId } = this.getCallerAttributes(ctx);

        if (role !== 'cooperative') {
            throw new Error('Only cooperative can fetch blockchain ledger');
        }

        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return stringify(allResults);
    }

    async queryHistoryOfAsset(ctx, args) {
        const {assetId} = JSON.parse(args);
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


    // get herbbatch details by id

    // get all herbbatch

    // get herbbatch record by collector

    // issue lab

    // create claim

    // get claim info

    // approve claim

    // onboard Researchers

    // send consent request to herbbatch

    // get herbbatch data for Researchers

    // issue reward to herbbatch

    // claim reward - by herbbatch

}

module.exports = ehrChainCode;
