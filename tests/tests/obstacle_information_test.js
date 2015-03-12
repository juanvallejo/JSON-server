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
 */


// import prototype object and test case library
var Tests 	= require('../tests.js');
var Test 	= require('../prototypes/test.js');

// declare and name our new test case
var ObstacleInformationTest = new Test('doesJSONServerHandleObstacleInformation');

// set our test case's expected value
ObstacleInformationTest.expects('{}');

// override run function
ObstacleInformationTest.run = function() {

	var testCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our test case has finished executing
	// passing the 'actual' result to it
	var request = this.modules.UasRequest.get('getObstacleInformation', function(response) {
		testCase.end(response);
	});

	// write data to send as a POST request
	request.write('username=test&password=test');
	request.end();

}

// add a new instance of our test to the testing library
Tests.addTest(ObstacleInformationTest);







// // define libraries to be used 

// var http = require('http');

// /**
// Checks to see if Obsticle information is handled correctly by the JSON-server, as a GET request on the server. 
// */

// (function doesJSONServerHandleObsticleInformation() {

// 	var postData        = 'this=is&a=test'
// 	var responseData 	= '';
//  	var request 		= null;

//  	 request 			= http.request({

//  		port 	: 8000,
// 		method 	: 'GET',
// 		path 	: '/api/test',
// 		headers : {

// 			'UASAPI-Method'	: 'getObsticleInformation',
// 			'Content-Type' 	: 'application/x-form-urlencoded',
// 			'Content-Length': postData.length

// 		}

// 	  }, function(response) {

//  		response.on('data', function(chunk) {
//  			responseData += chunk;
//  		});

//  		response.on('end', function() {

//  			if(responseData == null && response.statusCode == 200) {
// 	 			console.log('The team made a valid request. The request will be logged to later evaluate request rates.');
// 	 		} else {
// 	 			console.log('Error, invalid request. Server either not found, or something wrong with the code.');
// 	 		}

//  		});
// });
