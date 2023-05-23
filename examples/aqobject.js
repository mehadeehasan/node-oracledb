/* Copyright (c) 2019, 2023, Oracle and/or its affiliates. */

/******************************************************************************
 *
 * This software is dual-licensed to you under the Universal Permissive License
 * (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl and Apache License
 * 2.0 as shown at http://www.apache.org/licenses/LICENSE-2.0. You may choose
 * either license.
 *
 * If you elect to accept the software under the Apache License, Version 2.0,
 * the following applies:
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NAME
 *   aqobject.js
 *
 * DESCRIPTION
 *   Oracle Advanced Queuing (AQ) example passing an Oracle Database object
 *
 *   Before running this, a queue allowing an Oracle Database object
 *   payload must be created, see
 *   https://node-oracledb.readthedocs.io/en/latest/user_guide/aq.html#aqobjexample
 *
 *****************************************************************************/

'use strict';

Error.stackTraceLimit = 50;

const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

// This example requires node-oracledb Thick mode.
//
// Thick mode requires Oracle Client or Oracle Instant Client libraries.  On
// Windows and macOS Intel you can specify the directory containing the
// libraries at runtime or before Node.js starts.  On other platforms (where
// Oracle libraries are available) the system library search path must always
// include the Oracle library path before Node.js starts.  If the search path
// is not correct, you will get a DPI-1047 error.  See the node-oracledb
// installation documentation.
let clientOpts = {};
if (process.platform === 'win32') {                                   // Windows
  clientOpts = { libDir: 'C:\\oracle\\instantclient_19_17' };
} else if (process.platform === 'darwin' && process.arch === 'x64') { // macOS Intel
  clientOpts = { libDir: process.env.HOME + '/Downloads/instantclient_19_8' };
}
oracledb.initOracleClient(clientOpts);  // enable node-oracledb Thick mode

const queueName = "ADDR_QUEUE";

async function enq() {
  let connection;

  // The message to send.
  // The attributes correspond to the USER_ADDRESS_TYPE fields.
  const addrData = {
    NAME: "scott",
    ADDRESS: "The Kennel"
  };

  try {
    connection = await oracledb.getConnection(dbConfig);
    const queue = await connection.getQueue(queueName, {payloadType: "USER_ADDRESS_TYPE"});
    const message = new queue.payloadTypeClass(addrData);
    console.log('Enqueuing: ', addrData);
    await queue.enqOne(message);
    await connection.commit();
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function deq() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const queue = await connection.getQueue(queueName, {payloadType: "USER_ADDRESS_TYPE"});
    const msg = await queue.deqOne();  // wait for a message
    await connection.commit();
    if (msg) {
      console.log('Dequeued:  ', msg.payload);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

enq();
deq();
