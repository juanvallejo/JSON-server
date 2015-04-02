/**
 * Request module for test cases. Prepares an http or http request, and appends headers to it
 * such that they indicate to the test server which parameters should be used when dealing with a connection
 * to the interoperability server
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// import a connection prototype
var Connection = require(__dirname + '/../prototypes/connection.js');

// declare our module object
var UasRequest = {};

// set module name
UasRequest.MODULE_NAME = 'UasRequest';

//Define options for node connections and agents
var defaultRequestOptions = {

	port 	: 8000,
	method 	: 'POST',
	path 	: '/api/test'

};

var defaultRequestHeaders = {
	'Content-Type' 	: 'application/x-www-form-urlencoded'
}

// declare default fields

/**
 * takes a Connection object and adds default connection headers
 */
UasRequest.setDefaultOptions = function(connection) {

	connection.setConnectionPort(defaultRequestOptions.port);
	connection.setConnectionPath(defaultRequestOptions.path);
	connection.setConnectionMethod(defaultRequestOptions.method);

}

/**
 * takes a Connection object and passes the default request headers object.
 */
UasRequest.setDefaultHeaders = function(connection) {
	connection.addHeaders(defaultRequestHeaders);
}

/**
 * Adds a require-authentication-header to the connection object
 */
UasRequest.requireAuthentication = function(connection, username, password) {

	connection.addHeaders({
		'UASAPI-Require-Authentication' : 'username=' + username + '&password=' + password
	});

}

/**
 * Initializes a Connection object, along with methods
 */
UasRequest.create = function(protocol, requestMethod, uasAPIHeader) {

	// create a new connection object
	var UasConnectionObject = new Connection();

	// set the connection's default options
	UasRequest.setDefaultOptions(UasConnectionObject);
	UasRequest.setDefaultHeaders(UasConnectionObject);

	// set the protocol of our connection and add the api header
	UasConnectionObject.setConnectionProtocol(protocol);

	// set api values for the connection
	UasConnectionObject.addHeaders({
		'UASAPI-Endpoint' : uasAPIHeader
	});

	UasConnectionObject.addHeaders({
		'UASAPI-Method' : requestMethod
	});

	return UasConnectionObject;		

}

UasRequest.write = function(connection, data) {
	connection.write(data);
}

/**
 * Send and handle a response from the request created by the connection object
 */
UasRequest.send = function(connection, callback) {

	connection.end(function(response, cookies) {

		if(response instanceof Error) {
			return callback.call(UasRequest, response.code);
		}

		// determine the type of the request made
		if(this.getConnectionOptions('method') == 'GET') {
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
UasRequest.get = function(uasAPIHeader) {
	return UasRequest.create('http', 'GET', uasAPIHeader);
}

/**
 * Takes a uasAPIHeader and creates a new POST request
 */
UasRequest.post = function(uasAPIHeader) {
	return UasRequest.create('http', 'POST', uasAPIHeader);
}

module.exports = UasRequest;
