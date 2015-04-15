/**
 * Basic UDP Listener for ArduPilot software
 *
 * @author juanvallejo
 */

var MavlinkListener = {};

var INCOMING_PORT 	= 14550;
var INCOMING_HOST 	= '127.0.0.1';

var socket 			= require('dgram').createSocket('udp4');
var Mavlink 		= require('mavlink');

var mav 			= new Mavlink(0, 0);

MavlinkListener.listen = function(callback) {

	mav.on('ready', function() {

		socket.on('message', function(message, rinfo) {
			mav.parse(message);
		});

		socket.bind(INCOMING_PORT, function() {
			console.log('Socket bound to port ' + INCOMING_PORT);
		});

		socket.on('listening', function() {
			console.log('Socket listening for data @ ' + socket.address().address);
		});

		socket.on('close', function() {
			console.log('conection closed');
		});

		socket.on('error', function(error) {
			console.log('An error occurred -> ' + error);
		});

		// mavlink listeners

		/**
		 * Listen for a decoded message
		 */
		mav.on('GPS_RAW_INT', function(message, fields) {

			// call callback
			if(typeof callback == 'function') {
				callback.call(MavlinkListener, message, fields);
			}
			
		});

	});

}

module.exports = MavlinkListener;