/**
 * SUAS Competition client.
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
var http 	= require('http'); 										// http package (not compatible with https requests)
var socket 	= require('socket.io');									// WebSocket package. Realtime communication with client
var mavlink = require('./mavlink/javascript/lib/jspack/mavlink');	// import mavlink parser library

// define application constants
var HTTP_PORT 	= 8000; 		// port at which this application will listen for connections
var NET_PORT	= 8080;			// port at which this application will listen for MAVLink connections

// client is server making requests to competition server
var client = http.createServer(function(request, response) {
	// log connection address
	console.log('<http> Receiving connection from ' + request.connection.remoteAddress);

	// read and serve static file to client
	readFile(__dirname + '/index.html', function(err, file) {
		if(err) {
			// log error and exit
			return console.log('An error occurred reading the file -> ' + err);
		}	

		// set headers
		response.writeHead(200, {'Content-Type' : 'text/html'});

		// send response to client
		response.end(file);
	});

});

// start listening for connections
console.log('<http> Listening for connections at port ' + HTTP_PORT);
client.listen(HTTP_PORT);

// start socket connection listener and event handling
var io = socket.listen(client).on('connection', function(socket) {
	// log any time a new connection with a client is established
	console.log('<socket.io> WebSocket client connection received.');
	
	// send 'connection' event to client.
	socket.emit('connection', {
		text : 'Connected to UAS server at port ' + HTTP_PORT
	});

	socket.on('command', function(command) {
		if(command.text == 'connect' || command) {
			// connect request
			socket.emit('message', {
				text : 'Unimplemented command'
			});
		}
	});
});

/**
 * Reads file from url location and returns content as blob
 * when finished parsing.
 *
 * @param fileUrl 	{String} 	url location of the file to read.
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
function readFile(fileUrl, callback) {
	fs.readFile(fileUrl, function(err, blob) {
		// call user function to continue and pass error or file contents
		callback.call(this, err, blob);
	});
}

/**
 * main function. execs on startup
 */
(function main() {
	// create new MAVLink object parser
	var mavlinkParser = new MAVLink(null, 1, 50);

	// create a connection to listen for mavlink messages
	var connection = net.createServer(function(client) {
		// listen for when client disconnects
		client.on('end', function() {
			console.log('<net> Client ' + client.remoteAddress + ' has disconnected');
		});

		// listen for binary data received from client
		client.on('data', function(data) {
			// advertise data was received
			console.log('<net> Binary data stream received from client ' + client.remoteAddress);
			// parse received data using mavlink parser
			mavlinkParser.parseBuffer(data);

			// test message
			var message = new mavlink.messages.request_data_stream(1, 1, mavlink.MAV_DATA_STREAM_ALL, 1, 1);
			console.log(new Buffer(message.pack(mavlinkParser)));
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
		console.log('<mavlink> binary data from client successfully decoded');
	});

})();
