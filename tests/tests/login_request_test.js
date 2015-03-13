#!/bin/env node

/**
 * Checks to see that a login request is handled and parsed by the server. An authentication token should be
 * received
 *
 * @author juanvallejo
 * @date 3/11/15
 *
 * @testcase
 * @request POST
 */

// import prototype object and test case library
var Tests 	= require('../tests.js');
var Test 	= require('../prototypes/test.js');

// declare and name our new test case
var LoginTest = new Test('doesJSONServerHandleLoginRequest');

// set our test case's expected value
LoginTest.expects('Login Successful.');

// override run function
LoginTest.run = function() {

	var testCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our test case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.post('/api/login');

	// write data to send as a POST request
	this.modules.UasRequest.write(connection, 'username=test&password=test');
	this.modules.UasRequest.send(connection, function(response) {
		testCase.end(response);
	});

}

// add a new instance of our test to the testing library
Tests.addTest(LoginTest);
