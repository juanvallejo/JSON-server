#!/bin/env node

/**
 * Checks to make sure that a persistent request is handeled correctly by the JSON-server.
 * @author davidkroell
 * @date 4/07/15
 *
 * @testcase
 * @request PERSISTENT_POST
 */

// import prototype object and test case library
var Tests 	= require('../tests.js');
var Test 	= require('../prototypes/test.js');

// declare and name our new test case
var PostTelemetryTest = new Test('doesJSONServerHandlePersistentPOSTRequests');

// set our test case's expected value
PostTelemetryTest.expects('UAS Telemetry Successfully Posted.');

// override run function
PostTelemetryTest.run = function() {

	var testCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our test case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.makePersistentRequest('POST', '/api/interop/uas_telemetry');

	// write data to send as a POST request
	this.modules.UasRequest.write(connection, 'latitude=50&longitude=47&altitude_msl=3&uas_heading=80');
	this.modules.UasRequest.requireAuthentication(connection, 'test', 'test');
	this.modules.UasRequest.send(connection, function(response) {
		testCase.end(response);
    });
}

// add a new instance of our test to the testing library
Tests.addTest(PostTelemetryTest);