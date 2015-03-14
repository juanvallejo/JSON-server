/**
 * UAS request module
 *
 * @author juanvallejo
 * @date 3/13/15
 */

// import dependencies
var http 			= require('http');
var Globals 		= require('../../globals.js');
var Authentication 	= require('./uas_authentication.js');

var UASRequest = {};

UASRequest.MODULE_NAME = 'request';

UASRequest.makeRequest = function(request, postData, callback) {

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: request.headers['uasapi-method'],
		path 	: request.headers['uasapi-endpoint'],
		headers : {

			'Cookie'	: Authentication.getCookie(),
			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

	};

	var interopRequest = http.request(options);

	if(postData && postData != '') {
		interopRequest.write(postData);
	}

	interopRequest.on('error', function(error) {
		callback.call(this, error);
	});

	interopRequest.on('response', function(response) {
		callback.call(this, response);
	});

	// send data as a POST request and end the request
	interopRequest.end();

}

UASRequest.makeRequestWithAuthentication = function(request, postData, callback) {

	Authentication.authenticate(request.headers['uasapi-require-authentication'], function(didAuthenticate, response) {

		if(response instanceof Error) {
			return callback.call(this, response);
		}

		if(didAuthenticate) {
			UASRequest.makeRequest(request, postData, callback);
		} else {
			callback.call(this, response);
		}

	});

}

module.exports = UASRequest;