#!/bin/env node

/**
 * Define utility functions
 */

var Utilities = {};

/**
 * Return a database-formatted date stamp
 */
Utilities.getISODateStamp = function() {

	// calculate the current time stamp
	var date = new Date();
	return date.toISOString().replace(/T/gi, ' ').split('.')[0];

}

/**
 * Receives a connection 'request' object and extracts incoming
 * chunks of data from it. Returns post data as first argument in
 * callback function.
 */
Utilities.extractPOSTData = function(request, callback) {

	var data = '';

	request.on('data', function(chunk) {
		data += chunk;
	});

	request.on('end', function() {
		callback.call(this, data);
	});

}

module.exports = Utilities;