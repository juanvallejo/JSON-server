/**
 * UAS authentication module providing functions for handling authentication with the interoperability server.
 * If an authentication token has been previously established, it is saved and reused for all future requests.
 *
 * @author juanvallejo
 * @date 3/13/15
 */

// import dependencies
var Globals = require('../../globals.js');
var http 	= require('http');

// define module fields
var UASAuthentication = {
	
	isLocked 				: false,
	doesExist 				: false,
	cookie 					: null,
	callbacks				: [],
	defaultClientResponse 	: null,
	savedServerResponse 	: null

};

// it is recommended that every module have a name
UASAuthentication.MODULE_NAME = 'authentication';

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
UASAuthentication.authenticate = function(authenticationData, callback) {

	if(UASAuthentication.doesExist) {
		return callback.call(this, UASAuthentication.doesExist, UASAuthentication.getDefaultClientResponse());
	}

	// determine if there is already an authentication request pending
	if(UASAuthentication.isLocked) {
		return UASAuthentication.callbacks.push(callback);
	}

	UASAuthentication.lock();

	// declare request options
	var options = {
		
		port 	: Globals.UAS_PORT,
		method 	: 'POST',
		path 	: '/api/login',
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': authenticationData.length

		}

	};

	var response_data = '';

	var authRequest = http.request(options);

	authRequest.on('error', function(error) {
		callback.call(this, UASAuthentication.doesExist, error);
		UASAuthentication.unlock(error);
	});

	authRequest.on('response', function(response) {

		response.on('data', function(chunk) {
				response_data += chunk;
		});

		response.on('end', function() {

			if(response.statusCode == Globals.SERVER_HEAD_OK && response.headers['set-cookie']) {
				UASAuthentication.setCookie(response.headers['set-cookie']);
				UASAuthentication.doesExist = true;
			}

			// call callback function
			callback.call(this, UASAuthentication.doesExist, UASAuthentication.getDefaultClientResponse());
			UASAuthentication.unlock();

		});

	});

	authRequest.write(authenticationData);

	// send data as a POST request and end the request
	authRequest.end();

}

UASAuthentication.setCookie = function(cookie) {
	UASAuthentication.cookie = cookie;
}

/**
 * Returns a string of all key-value pairs stored from a previous cookie.
 * If a key @param is given, a key-value pair is searched containing such key
 * and returned individually
 */
UASAuthentication.getCookie = function(key) {

	if(!UASAuthentication.cookie || !(UASAuthentication.cookie instanceof Array)) {
		return '';
	}

	var cookie = UASAuthentication.cookie[0];

	// if the key of a cookie key-value pair is given,
	// search for such key and return pair
	if(key) {
		
		cookie.split('; ').forEach(function(pair) {

			if(pair.split('=')[0] == key) {
				cookie = pair;
			}

		});

	}

	return cookie;
}

/**
 * Sets the response sent back with every request made for authentication
 */
UASAuthentication.setDefaultClientResponse = function(response) {
	UASAuthentication.defaultClientResponse = response;
}

/**
 * Returns defined text that is sent back with every request for authentication
 */
UASAuthentication.getDefaultClientResponse = function() {
	return UASAuthentication.defaultClientResponse || UASAuthentication.getCookie();
}

/**
 * Locks the authentication method indicating that
 * an authentication request is currently underway
 */
UASAuthentication.lock = function() {
	UASAuthentication.isLocked = true;
}

UASAuthentication.unlock = function(param) {

	UASAuthentication.isLocked = false;

	param = param || UASAuthentication.getDefaultClientResponse();

	for(var i = 0; i < UASAuthentication.callbacks.length; i++) {
		UASAuthentication.callbacks[i].call(this, UASAuthentication.doesExist, param);
	}

	UASAuthentication.callbacks = [];

}

module.exports = UASAuthentication;