/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const HerbTraceabilityChaincode = require('./lib/herbTraceabilityChaincode');

module.exports.HerbTraceabilityChaincode = HerbTraceabilityChaincode;
module.exports.contracts = [HerbTraceabilityChaincode];
