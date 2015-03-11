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

// define libraries to be used 

var http = require('http');

/**
Checks to see if Obsticle information is handled correctly by the JSON-server, as a GET request on the server. 
*/

(function doesJSONServerHandleObsticleInformation() {

	var postData        = 'this=is&a=test'
	var responseData 	= '';
 	var request 		= null;

 	 request 			= http.request({

 		port 	: 8000,
		method 	: 'GET',
		path 	: '/api/test',
		headers : {

			'UASAPI-Method'	: 'getObsticleInformation',
			'Content-Type' 	: 'application/x-form-urlencoded',
			'Content-Length': postData.length

		}

	  }, function(response) {

 		response.on('data', function(chunk) {
 			responseData += chunk;
 		});

 		response.on('end', function() {

 			if(responseData == null && response.statusCode == 200) {
	 			console.log('The team made a valid request. The request will be logged to later evaluate request rates.');
	 		} else {
	 			console.log('Error, invalid request. Server either not found, or something wrong with the code.');
	 		}

 		});
});
