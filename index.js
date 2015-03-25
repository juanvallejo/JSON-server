#!/bin/env node

/**
* Provided under the MIT License (c) 2014
* See LICENSE @file for details.
*
* @file index.js
*
* @author juanvallejo
* @date 2/28/15
*
* Server library. Integrates with Red Hat's OPENSHIFT platform.
* Can be used for pretty much any app though.
*
**/

// import http module
var http 			= require('http');
var process 		= require('child_process');

// import custom node libraries
var Globals 		= require('./lib/globals.js');
var Scripts 		= require('./lib/scripts.js');
var Handlers 		= require('./lib/handlers.js');
var Sockets			= require('./lib/sockets.js');

// define root of working directory
Globals.rootDirectory = __dirname;


// initialize application
(function main(application) {

	// define global application server and bind to a specified port
	application = http.createServer(Handlers.mainRequestHandler);
	application.listen(Globals.SERVER_PORT, Globals.SERVER_HOST);

	console.log('Application started. Listening on port ' + Globals.SERVER_PORT);

	// initialize socket.io
	Sockets.listen(application);

	console.log('Starting module auvsi_competition_server. Listening on port ' + Globals.UAS_PORT);

	// start auvsi_competition_server
	process.exec(Scripts.START_AUVSI_SERVER, function(error, stdout, stderr) {

		if(error) {
			return console.log(error);
		}

	});

})(Globals.Application);