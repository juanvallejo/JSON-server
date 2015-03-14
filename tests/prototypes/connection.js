/**
 * Contains the blueprint (prototype) for a single connection object.
 * Meant to be used with the Tests test-case library
 *
 * @author juanvallejo
 * @date 3/11/15
 */

 // import prototype
 var EventObject = require(__dirname + '/event_object.js');

function Connection() {

	this.connectionProtocol = null;
	this.messages 			= [];

	this.connection			= {

		port : null,
		method : null,
		path : null,
		headers : {}

	};

	/**
	 * Determine if the connection will be done over http / https
	 */
	this.setConnectionProtocol = function(protocol) {
		this.connectionProtocol = protocol;
	}

	/**
	 * Set the port for this connection
	 */
	this.setConnectionPort = function(port) {
		this.connection.port = port;
	}

	/**
	 * Determine if the request will be GET or POST
	 */
	this.setConnectionMethod = function(method) {
		this.connection.method = method;
	}

	/**
	 * Declare the address of the host for this connection
	 */
	this.setConnectionPath = function(path) {
		this.connection.path = path;
	}

	/**
	 * Receives a json object with headers, and appends / replaces headers
	 */
	this.addHeaders = function(headers) {

		for(var i in headers) {
			this.connection.headers[i] = headers[i];
		}

	}

	/**
	 * Receives a json object with connection options.
	 * Warning: will overwrite already set options.
	 */
	this.addOptions = function(options) {

		for(var i in options) {
			this.connection[i] = options[i];
		}

	}

	/**
	 * Returns a complete json object of request options
	 */
	this.getConnectionOptions = function(option) {

		if(option) {
			return this.connection[option];
		}

		return this.connection;
	}

	/**
	 * Add a message to write to the buffer to be sent to the connection request
	 */
	this.write = function(message) {
		this.messages.push(message);
	}

	/**
	 * Create a request between the connection and the host
	 */
	this.end = function(callback) {

		var scope = this;

		var request = require(this.connectionProtocol).request(this.getConnectionOptions());

		request.on('error', function(error) {
			callback.apply(scope, [error]);
		});

		request.on('response', function(response, cookies) {
			callback.apply(scope, [response, cookies]);
		});

		scope.messages.forEach(function(message) {
			request.write(message);
		});

		request.end();

	}

}

module.exports = Connection;