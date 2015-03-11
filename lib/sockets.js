#!/bin/env node

/**
 * Handles socket connections
 */

// import dependencies
var socketio 	= require('socket.io');
var Globals 	= require('./globals.js');

var Sockets = {};

Sockets.listen = function(application) {

	socketio.listen(application).on('connection', Sockets.clientConnectionHandler);

}

Sockets.clientConnectionHandler = function(socket) {
	
	// log any time a new connection with a client is established
	console.log('<socket.io> WebSocket client connection received.');
	
	// send 'connection' event to client.
	socket.emit('connection', {
		text : 'Connected to UAS server at port ' + Globals.SERVER_PORT
	});

	socket.on('command', function(command) {

		if(command.text == 'connect' || command) {

			// connect request
			socket.emit('message', {
				text : 'Unimplemented command'
			});

		}

	});

}

module.exports = Sockets;