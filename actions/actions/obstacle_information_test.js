#!/bin/env node

/**
 * Provided under the MIT License (c) 2014
 * See LICENSE @file for details.
 *
 * Files written to test interoperability request handling for the UAS competition server
 *
 * @file getObsticleInformationTest.js
 *
 * @author David Kroell
 * @date 02/23/2015
 *
 * @testcase
 */


// import prototype object and test case library
var Tests 	= require('../tests.js');
var Test 	= require('../prototypes/test.js');

// declare and name our new test case
var ObstacleInformationTest = new Test('doesJSONServerReceiveObstacleInformation');

// set our test case's expected value
ObstacleInformationTest.expects('{"stationary_obstacles": [], "moving_obstacles": []}');

// override run function
ObstacleInformationTest.run = function() {

	var testCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our test case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.get('/api/interop/obstacles');

	// set request's options and send connection
	this.modules.UasRequest.requireAuthentication(connection, 'test', 'test');
	this.modules.UasRequest.send(connection, function(response) {
		testCase.end(response);
	});

}

// add a new instance of our test to the testing library
Tests.addTest(ObstacleInformationTest);
