#!/bin/env node

/**
 * Provided under the MIT License (c) 2014
 * See LICENSE @file for details.
 *
 * SUAS Competition server.
 * Listens for, and makes requests to, the competition server by making
 * http requests using its api.
 *
 * Sends and receives MAVLink messages
 *
 * @file server.js
 *
 * @author juanvallejo
 * @date 11/18/14
 */

// define and import require node packages
var fs 		= require('fs'); 										// filesystem access
var net 	= require('net');										// async network wrapper; socket connection listener
var url 	= require('url');										// url parsing library
var http 	= require('http'); 										// http package (not compatible with https requests)
var socket 	= require('socket.io');									// WebSocket package. Realtime communication with client
var mavlink = require('./mavlink/javascript/lib/jspack/mavlink');	// import mavlink parser library

// define application constants

var UAS_PORT				= 8080;									// port to post / request data to UAS Competition server
var HTTP_PORT 				= 8000; 								// port at which this application will listen for connections
var NET_PORT				= 7777;									// port at which this application will listen for MAVLink connections

var SERVER_PORT				= HTTP_PORT;
var SERVER_HOST				= '127.0.0.1';
var SERVER_HEAD_OK			= 200;
var SERVER_HEAD_NOTFOUND 	= 404;
var SERVER_HEAD_ERROR 		= 500;
var SERVER_RES_OK 			= '200. Server status: OK';
var SERVER_RES_NOTFOUND		= '404. The file you are looking for could not be found.';
var SERVER_RES_ERROR 		= '500. An invalid request was sent to the server.';

// define connection variable flags
var net_received_data = false;	// indicates <net> connection received data once. This flag prevents program from logging data multiple times
								// per request

// begin application declarations
var application 	= null;											// holds our main application server. Initialized in main
var currentRequest 	= null;											// define current parsed / routed request being handled

// declare mime and other definitions
var dictionaryOfMimeTypes = {
 
	'css' 	: 'text/css' 				,
	'html' 	: 'text/html' 				,
	'ico' 	: 'image/x-icon'			,
	'jpg' 	: 'image/jpeg'				,
	'jpeg' 	: 'image/jpeg' 				,
	'js' 	: 'application/javascript' 	,
	'map' 	: 'application/x-navimap'	,
	'pdf' 	: 'application/pdf' 		,
	'png' 	: 'image/png'				,
	'ttf'	: 'application/octet-stream',
	'txt' 	: 'text/plain'				,
	'woff'	: 'application/x-font-woff'
 
};

var dictionaryOfRoutes 	= {
 
	'/'  		: 'index.html',
	'/api'		: handleRequestAsUASAPICall,
	'/api/test'	: handleRequestAsUASAPICall
 
};

// define UAS interoperability functions, objects, methods, etc..
var UAS = {};

// holds a request that must be kept open when sending large amounts of data
// Warning: must be closed manually by calling UAS.endPersistentRequest();
UAS.persistentRequest = null;


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
		
		port 	: UAS_PORT,
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
		
		port 	: UAS_PORT,
		method 	: 'POST',
		path 	: '/api/login',
		headers : {

			'Content-Type' 	: 'application/x-www-form-urlencoded',
			'Content-Length': postData.length

		}

	};

	var request = http.request(options, callback);
console.log(postData);
	// send data as a POST request and end the request
	request.write(postData);
	request.end();
}

// declare http server functions and methodical procedures
 
/**
 * Checks all incoming requests to see if routing is applicable to them.
 * Parses font file requests that contain queries in urls
 *
 * @return {String} routedRequest
 */
function requestRouter(request, response) {
 
	var requestURL = request.url;
 
	// modify font requests that have queries in url
	if(requestURL.match(/\.(woff|ttf)(\?)/gi)) {
		requestURL = requestURL.split('?')[0];
	}
 
	// return default request by default
	var requestToHandle	= requestURL;
	var routedRequest 	= requestURL;
 
	if(dictionaryOfRoutes.hasOwnProperty(requestToHandle)) {
		routedRequest = dictionaryOfRoutes[requestToHandle];
	}
 
	return routedRequest;
 
}
 
/**
 * Checks passed requests for a defined file Mime Type.
 *
 * @return {String} requestMimeType		a file mimetype of current request if defined, or a default .txt mime type 
 * 										if request's mime type is not defined
 */
function mimeTypeParser(request, response) {
 
	var requestToHandle 		= requestRouter(request, response);
	var requestMimeType 		= dictionaryOfMimeTypes['txt'];
 
	// retrieve file extension from current request by grabbing
	// suffix after last period of request string
	var requestFileExtension	= requestToHandle.split('.');
	requestFileExtension 		= requestFileExtension[requestFileExtension.length - 1];
	requestFileExtension 		= requestFileExtension.split('&')[0];
 
	if(dictionaryOfMimeTypes.hasOwnProperty(requestFileExtension)) {
		requestMimeType = dictionaryOfMimeTypes[requestFileExtension];
	}
 
	return requestMimeType;
}

/**
 * Serves current request as a stream from a file on the server
 */
function handleRequestAsStaticFile(request, response) {

	var requestToHandle = requestRouter(request, response);
 
	fs.readFile(__dirname + '/' + requestToHandle, function(error, data) {
 
		if(error) {
 
			console.log('File ' + requestToHandle + ' could not be served -> ' + error);
			
			response.writeHead(SERVER_HEAD_NOTFOUND);
			response.end(SERVER_RES_NOTFOUND);
		}
 
		response.writeHead(SERVER_HEAD_OK, {
			'Content-Type' : mimeTypeParser(request, response)
		});
 
		response.end(data);
 
	});

}

/**
 * handles current request as a call to (conveniently) one of this server's functions, which in turn (ideally) calls and
 * sends data to the competition server's api. Request must use POST method.
 */
function handleRequestAsUASAPICall(request, response) {

	if(request.method != 'POST') {
		return console.log('API requests must use POST method.');
	}

	var postData = '';
 
	request.on('data', function(chunk) {
		postData += chunk;
	});

	request.on('end', function() {
	
		console.log('<API> Obtained request body. Passing to UAS API function.');		

		var requestedAPIFunction 	= UAS[request.headers['uasapi-method']];

		if(!requestedAPIFunction || typeof requestedAPIFunction != 'function') {
			
			response.writeHead(SERVER_RES_OK);
			response.end('FAIL');

			return console.log('<API> Error. Undefined interoperability function.');

		}

		// call interoperability function and handle a response
		requestedAPIFunction(postData, function(APIResponse) {

			console.log('<UAS_API> Received response from API function.');

			// only handle the APIResponse if it is an IncomingMessage from the server
			if(typeof APIResponse == 'string') {

				console.log('<UAS_API> Response body from an API function received -> ' + APIResponse);

				response.writeHead(SERVER_HEAD_OK);
				response.end('OK');

				return false;

			}

			var APIResponseData = '';

			APIResponse.on('data', function(chunk) {
				APIResponseData += chunk;
			});

			APIResponse.on('end', function() {

				console.log('<UAS_API> Response body from the competition server received -> ' + APIResponseData);

				response.writeHead(APIResponse.statusCode);
				response.end(APIResponseData);

			});

		});

	});
 
}

/**
 * handle all Socket.IO WebSocket requests
 */
function SocketIORequestHandler(client) {

	// log any time a new connection with a client is established
	console.log('<socket.io> WebSocket client connection received.');
	
	// send 'connection' event to client.
	client.emit('connection', {

		text : 'Connected to UAS server at port ' + HTTP_PORT

	});

	client.on('command', function(command) {

		if(command.text == 'connect' || command) {

			// connect request
			client.emit('message', {
				text : 'Unimplemented command'
			});

		}

	});

}

/**
 * handle all initial application requests, assign routes, etc.
 */
function mainRequestHandler(request, response) {
 
	// assign global definition for current request being handled
	currentRequest = requestRouter(request, response);

	if(typeof currentRequest == 'function') {
		currentRequest(request, response);
	} else if(currentRequest.match(/^\/test(\/)?$/gi)) {
		response.writeHead(SERVER_HEAD_OK);
		response.end(SERVER_RES_OK);
	} else {
		handleRequestAsStaticFile(request, response);
	}
}

/**
 * main function. runs on startup
 */
(function main(application) {

	// define global application server and bind to a specified port
	application = http.createServer(mainRequestHandler);
	application.listen(SERVER_PORT, SERVER_HOST);

	// begin handling socket.io requests
	socket.listen(application).on('connection', SocketIORequestHandler);

	// log connection status
	console.log('<http> Listening for connections at port ' + HTTP_PORT);

})(application);



// ignore for now.
function MAVLinkInit() {

	// handle mavlink samples for now

	// create new MAVLink object parser
	var mavlinkParser = new MAVLink(null, 1, 50);

	// create a connection to listen for mavlink messages
	var connection = net.createServer(function(client) {
		// set connection's ip address to current client's remote address 
		connection.remoteAddress = client.remoteAddress;

		// listen for when client disconnects
		client.on('end', function() {
			// log client disconnect
			console.log('<net> Client ' + connection.remoteAddress + ' has disconnected');
			// reset data received
		});

		// listen for binary data received from client
		client.on('data', function(data) {
			// reset our net_received_data flag so new decoded messages are logged
			net_received_data = false;

			// advertise data was received
			console.log('<net> Binary data stream received from client ' + connection.remoteAddress);
			// parse received data using mavlink parser
			// console.log(mavlinkParser.parseBuffer(data));

			// test message output for a single waypoint
			var message = new mavlink.messages.mission_item(1, 1, 1, 1, 16, 1, 1, 0.149999999999999994, 0, 0, 0, 8.54800000000000004, 47.3759999999999977, 550);
			mavlinkParser.parseBuffer(new Buffer(message.pack(mavlinkParser)));
		});

	});

	// listen for errors from server
	connection.on('error', function(err) {
		// advertise errors on console
		console.log('<net> ' + err);
	});

	// listen for connections on port NET_PORT
	connection.listen(NET_PORT, function() {
		// advertise connection on console
		console.log('<net> Listening for MAVLink messages on port ' + NET_PORT);
	});



	/**
	* begin listening for decoded binary mavlink messages using mavlink library
	*/

	// listen for any type of mavlink message
	mavlinkParser.on('message', function(message) {
		// stop more incoming messages from displaying once one has been received
		if(net_received_data) {
			return;
		}

		console.log('<mavlink> binary data from client ' + connection.remoteAddress + ' successfully decoded:');
		console.log('<mavlink_message>');
		console.log(message);
		console.log('</mavlink_message>');

		// indicate data has been received once already
		net_received_data = true;

	});

	mavlinkParser.on('HEARTBEAT', function(message) {
		console.log('yay!, the drone is still alive');
	});

}
