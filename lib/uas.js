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

// Holds an authentication cookie containing a session id from the server
// Warning: must be closed manually by calling UAS.endPersistentRequest();
UAS.authenticationRequestCookies	= null;

/**
 * Interoperability function
 *
 * Sends a get request to the UAS competition server through its interoperability api.
 * The competition server must be running locally for now, but this will be changed before the actual competition, to support volatile
 * ip addresses and ports. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/UAS-Telemetry
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.handleGetRequest = function(request, callback) {
	
	var response = 'Test';

	if(request.headers['uasapi-require-authentication']) {
		response = 'Authentication requested';
	}

	callback.call(UAS, response);
}

/**
 * Interoperability function
 *
 * Sends a post request to the UAS competition server through its interoperability api.
 * The competition server must be running locally for now, but this will be changed before the actual competition, to support volatile
 * ip addresses and ports. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/UAS-Telemetry
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
UAS.handlePostRequest = function(request, postData, callback) {

	if(!postData || typeof postData != 'string') {
		return console.log('This function requires a string of data to send to the competition server!');
	}

	if(typeof callback != 'function') {
		callback = {};
	}

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: request.headers['uasapi-method'],
		path 	: request.headers['uasapi-endpoint'],
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

	};

	var interopRequest = http.request(options, function(response) {

		// check to see that our response contains headers and store cookies 
		if(response.headers) {
			UAS.authenticationRequestCookies = response.headers['set-cookie'];
		}

		// call callback function and pass response
		callback.call(UAS, response, UAS.authenticationRequestCookies);

	});

	// send data as a POST request and end the request
	interopRequest.write(postData);
	interopRequest.end();

}

/**
 * Interoperability function
 *
 * Sends a post request to the UAS competition server through its interoperability api.
 * The competition server must be running locally for now, but this will be changed before the actual competition, to support volatile
 * ip addresses and ports. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/UAS-Telemetry
 *
 * Actual post data is required to be formatted as url-encoded form-data (e.g. username=test&password=test)
 * Parameters must be 'username', 'password'
 *
 * 		username			This parameter is the username that the judges give teams during the competition. This is a unique identifier that will be used to associate the requests as your team's.
 *		password			This parameter is the password that the judges give teams during the competition. This is used to ensure that teams do not try to spoof other team's usernames, and that requests are authenticated with security.
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.authenticate = function(postData, callback) {

	
}

 module.exports = UAS;