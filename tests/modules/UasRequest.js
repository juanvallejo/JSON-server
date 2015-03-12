/**
 * Request module for test cases
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// declare our module object
var UasRequest = {};

var defaultRequestOptions = {

	port 	: 8000,
	method 	: 'POST',
	path 	: '/api/test',

};

var defaultRequestHeaders = {
	'Content-Type' 	: 'application/x-www-form-urlencoded'
}

UasRequest.MODULE_NAME = 'UasRequest';

// declare default fields

/**
 * takes a json object with a connection options
 */
UasRequest.setOptions = function(options) {

	for(var i in options) {
		defaultRequestOptions[i] = options[i];
	}

}

/**
 * takes a json object with header key-values
 */
UasRequest.setHeaders = function(headers) {

	for(var i in headers) {
		defaultRequestHeaders[i] = headers[i];
	}

}

/**
 * creates a new http or https request. Takes a uasAPIHeader and appends it
 * to the header of the request.
 */
UasRequest.create = function(protocol, requestMethod, uasAPIHeader, callback) {

	// append api header to our headers
	UasRequest.setHeaders({
		'UASAPI-Method' : uasAPIHeader
	});

	// set request method
	UasRequest.setOptions({
		'UASAPI-Request-Method' : requestMethod
	});

	// assign headers to our request
	defaultRequestOptions.headers = defaultRequestHeaders;

	// create a new request
	return require(protocol).request(defaultRequestOptions, function(response) {

		// determine the type of the request made
		if(defaultRequestOptions.method == 'GET') {
			return callback.call(UasRequest, response);
		}

		// assume the user used a POST method
		var response_body = '';
		
		response.on('data', function(chunk) {
 			response_body += chunk;
 		});

 		response.on('end', function() {
 			callback.call(UasRequest, response_body);
 		});

	});

}

/**
 * Takes a uasAPIHeader and creates a new GET request
 */
UasRequest.get = function(uasAPIHeader, callback) {
	return UasRequest.create('http', 'GET', uasAPIHeader, callback);
}

/**
 * Takes a uasAPIHeader and creates a new POST request
 */
UasRequest.post = function(uasAPIHeader, callback) {
	return UasRequest.create('http', 'POST', uasAPIHeader, callback);
}

module.exports = UasRequest;