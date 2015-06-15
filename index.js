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
var fs 				= require('fs');
var http 			= require('http');

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

	// initialize socket.io
	Sockets.listen(application);

	console.log('Application started. Listening on port ' + Globals.SERVER_PORT);

	// parse config file
	fs.readFile(__dirname + '/' + Globals.CONFIG_FILE, function(error, data) {

		if(error) {
			return console.log('An error occurred reading configuration file data -> ' + error);
		}

		var config;

		try {
			config = JSON.parse(data);
		} catch(exception) {
			console.log('Error parsing startup configuration file. None of the submodules have been setup.');
		}

		if(!config.setup_has_happened) {

			console.log('This is your first time running this application. Setting up submodules...');
			console.log('Please run "python auvsi_suas_competition/src/auvsi_suas_server/manage.py syncdb"');

			config.setup_has_happened = true;

			fs.writeFile(__dirname + '/' + Globals.CONFIG_FILE, JSON.stringify(config), function(writeError) {

				if(writeError) {
					return console.log('Error saving startup configuration file -> ' + writeError);
				}

				process.exit(0);

			});

		} else {
			console.log('Starting module uas_auvsi_competition. Module will listen on port ' + Globals.UAS_PORT);
			Scripts.run(Scripts.START_AUVSI_SERVER);
		}

	});

	// need this for confirmation
	console.log("JSON server now listening ...");

})(Globals.Application);