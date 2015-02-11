#!/bin/env node

/**
 * Provided under the MIT License (c) 2014
 * See LICENSE @file for details.
 *
 * Files written to test interoperability request handling for the UAS competition server
 *
 * @file postUASTelemetryTest.js
 *
 * @author juanvallejo
 * @date 2/9/14
 */

// define libraries to be used 

var http = require('http');

/**
 * Checks to see that a POST request containing any data is handled correctly against the UAS competiton
 * server api. Since telemetry data opens a persistent request, a request is made to manually end it after a response is originally
 * received.
 */
(function doesJSONServerHandleTelemetryDataSentAsPOSTRequest() {

 	var postData 		= 'this=is&a=test';
 	var responseData 	= '';
 	var request 		= null;

 	request 			= http.request({

 		port 	: 8000,
		method 	: 'POST',
		path 	: '/api/test',
		headers : {

			'UASAPI-Method'	: 'postTelemetryData',
			'Content-Type' 	: 'application/x-form-urlencoded',
			'Content-Length': postData.length

		}

 	}, function(response) {

 		response.on('data', function(chunk) {
 			responseData += chunk;
 		});

 		response.on('end', function() {

 			if(responseData == 'User not logged in. Login required.' && response.statusCode == 400) {
	 			console.log('doesJSONServerHandleTelemetryDataSentAsPOSTRequest : success!');
	 		} else {
	 			console.log('doesJSONServerHandleTelemetryDataSentAsPOSTRequest : failure');
	 		}

 		});

 		// end persistent request
 		var requestToEndPersistentRequest = http.request({

	 		port 	: 8000,
			method 	: 'POST',
			path 	: '/api/test',
			headers : {

				'UASAPI-Method'	: 'endPersistentRequest',
				'Content-Type' 	: 'application/x-form-urlencoded',
				'Content-Length': 0

			}

	 	});

	 	requestToEndPersistentRequest.end();

 	});

 	request.write(postData);
 	request.end();

})();

/**
 * Checks to see that a login request is handled and parsed by the server. An authentication token should be
 * received
 */
(function doesJSONServerHandleLoginRequest() {

 	var postData 		= 'username=username&password=password';
 	var responseData 	= '';
 	var request 		= null;

 	request 			= http.request({

 		port 	: 8000,
		method 	: 'POST',
		path 	: '/api/test',
		headers : {

			'UASAPI-Method'	: 'authenticate',
			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

 	}, function(response) {

 		response.on('data', function(chunk) {
 			responseData += chunk;
 		});

 		response.on('end', function() {

 			console.log(responseData);

 			if(responseData == 'OK') {
	 			console.log('doesJSONServerHandleLoginRequest : success!');
	 		} else {
	 			console.log('doesJSONServerHandleLoginRequest : failure');
	 		}

 		});

 	});

 	request.write(postData);
 	request.end();

})();