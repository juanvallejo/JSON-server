/**
 * SUAS Competition client.
 * Listens for, and makes requests to, the competition server by making
 * http requests using its api.
 */

// define and import require node packages
var fs 		= require('fs'); 	// filesystem access
var http 	= require('http'); 	// http package (not compatible with https requests)
var socket 	= require('socket.io');	// WebSocket package. Realtime communication with client

// define application constants
var PORT 	= 8000; 		// port at which this application will listen for connections

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
console.log('<http> Listening for connections at port ' + PORT);
client.listen(PORT);

// start socket connection listener and event handling
var io = socket.listen(client).on('connection', function(socket) {
	// log any time a new connection with a client is established
	console.log('<socket.io> WebSocket client connection received.');
	
	// send 'connection' event to client.
	socket.emit('connection', {
		text : 'Connected to UAS server at port ' + PORT
	});
});

/**
 * Reads file from url location and returns content as blob
 * when finished parsing.i
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
