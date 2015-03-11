/**
 * UAS competition server "wrapper" to relay test cases and requests using the nodejs interoperability server
 * 
 * @author juanvallejo
 * @date 3/10/15
 */

// import dependencies
var Globals = require('./globals.js');
var http 	= require('http');

var UAS = {};

// holds a request that must be kept open when sending large amounts of data
// Warning: must be closed manually by calling UAS.endPersistentRequest();
UAS.persistentRequest 				= null;

// Holds an authentication cookie containing a session id from the server
// Warning: must be closed manually by calling UAS.endPersistentRequest();
UAS.authenticationRequestCookies	= null;

/**
 * ends a request that has been opened for persistent data posts
 */
UAS.endPersistentRequest = function(postData, callback) {

	// check to see if a persistent request has been opened
	if(UAS.persistentRequest) {
		UAS.persistentRequest.end();
		UAS.persistentRequest = null;
	}

	if(typeof callback == 'function') {
		callback.call(this, 'persistent request ended.');
	}

};

/**
 * Interoperability function
 *
 * Sends a post request with data from a raw MAVLink message, ideally, to the UAS competition server via its interoperability api.
 * The competition Server must be running locally for now, but this will be expanded before the actual competition, to account for the host's actual
 * IP address and port. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/UAS-Telemetry
 *
 * Warning: This function establishes a persistent TCP connection with the interoperability server which MUST be explicitly ended by calling the
 * api's endPersistentRequest() method.
 *
 * Actual post data is required to be formatted as url-encoded form-data (e.g. altitude=65&longitude=165)
 * Parameters must be 'latitude', 'longitude', 'altitude_msl', and 'uas_heading'. These are explained on the wiki and below:
 *
 * 		latitude			The latitude of the aircraft as a floating point degree value. Valid values are: -90 <= latitude <= 90.
 *		longitude			The longitude of the aircraft as a floating point degree value. Valid values are: -180 <= longitude <= 180.
 *		altitude_msl		The height above mean sea level (MSL) of the aircraft in feet as a floating point value.
 *		uas_heading			The heading of the aircraft as a floating point degree value. Valid values are: 0 <= uas_heading <= 360.
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.postTelemetryData = function(postData, callback) {

	if(!postData || typeof postData != 'string') {
		return console.log('This function requires a string of data to send to the competition server!');
	}

	if(typeof callback != 'function') {
		callback = function() {}
	}

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: 'POST',
		path 	: '/api/interop/uas_telemetry',
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

	};

	// establish or use an existing persistent request, as this data
	// is expected to be sent repeatedly
	if(!UAS.persistentRequest) {
		UAS.persistentRequest = http.request(options, callback);
	}

	// send data as a POST request and keep the request alive
	UAS.persistentRequest.write(postData);

}

/**
 * Interoperability function
 *
 * Sends a post request with data containing login information to the UAS competition server via its interoperability api.
 * The competition Server must be running locally for now, but this will be expanded before the actual competition, to account for the host's actual
 * IP address and port. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/User-Login
 *
 * Actual post data is required to be formatted as url-encoded form-data (e.g. altitude=65&longitude=165)
 * Parameters must be 'username', 'password'
 *
 * 		username			This parameter is the username that the judges give teams during the competition. This is a unique identifier that will be used to associate the requests as your team's.
 *		password			This parameter is the password that the judges give teams during the competition. This is used to ensure that teams do not try to spoof other team's usernames, and that requests are authenticated with security.
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.authenticate = function(postData, callback) {

	if(!postData || typeof postData != 'string') {
		return console.log('This function requires a string of data to send to the competition server!');
	}

	if(typeof callback != 'function') {
		callback = {};
	}

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: 'POST',
		path 	: '/api/login',
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

	};

	var request = http.request(options, function(response) {

		// check to see that our response contains headers and store cookies 
		if(response.headers) {
			UAS.authenticationRequestCookies = response.headers['set-cookie'];
		}

		// call callback function and pass response
		callback(response, UAS.authenticationRequestCookies);

	});

	// send data as a POST request and end the request
	request.write(postData);
	request.end();
}

/**
 * Interoperability function
 *
 * Sends a GET request to the competition server to request information
 *
 * Actual post data is required to be formatted as url-encoded form-data (e.g. altitude=65&longitude=165)
 * Parameters must be 'username', 'password'
 *
 * 		username			This parameter is the username that the judges give teams during the competition. This is a unique identifier that will be used to associate the requests as your team's.
 *		password			This parameter is the password that the judges give teams during the competition. This is used to ensure that teams do not try to spoof other team's usernames, and that requests are authenticated with security.
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.requestServerInformation = function(request, callback) {

	if(typeof callback != 'function') {
		callback = {};
	}

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: 'GET',
		path 	: '/api/interop/server_info',
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': 0

		}

	};

	var request = http.get(options, callback);

	request.on('error', function(error) {
		return console.log('<UAS.requestServerInformation> UASAPI Interop Error -> ' + error);
	});

}

 module.exports = UAS;