#!/bin/env node

/**
 * define all global variables and constants for server
 *
 * @author 	juanvallejo
 * @date 	3/9/15
 */

var process 		= require('child_process');

var Globals = require('./globals.js');

var Scripts = {};

// start an instance of the auvsi competition server
Scripts.START_AUVSI_SERVER 	= 'python auvsi_suas_competition/src/auvsi_suas_server/manage.py runserver 0.0.0.0:' + Globals.UAS_PORT;
Scripts.SYNCDB_AUVSI_SERVER = 'python auvsi_suas_competition/src/auvsi_suas_server/manage.py syncdb';

/**
 * Defines a single script object
 */
function Script(line) {

	this.line 			= line;
	this.callback 		= null;

	this.getLine = function() {
		return this.line;
	}

	this.getCallback = function() {
		return this.callback;
	}

	this.then = function(callback) {
		this.callback = callback;
	}

	this.execute = function(callback) {

		var self = this;

		process.exec(this.getLine(), function(error, stdout, stderr) {

			if(error) {
				return console.log('Script execution error -> ' + error);
			}

			if(stderr && stderr != '') {
				return console.log('Script standard output error -> ' + stderr);
			}

			if(self.callback && typeof self.callback == 'function') {
				self.callback.call(self, stdout);
			}

		});

	}

}

Scripts.run = function(line) {

	var script = new Script(line);
	script.execute(script);

	return script;

}

module.exports = Scripts;