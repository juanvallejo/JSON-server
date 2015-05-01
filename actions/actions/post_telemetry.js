#!/bin/env node

/**
 * Checks to see that a login request is handled and parsed by the server. An authentication token should be
 * received
 *
 * @author juanvallejo
 * @date 3/11/15
 *
 * @action
 * @request POST
 */

// import prototype object and Action case library
var Actions	= require('../actions.js');
var Action 	= require('../prototypes/action.js');
var Mavlink	= require('../../lib/mavlink.js');

// declare and name our new Action case
var PostTelemetry = new Action('PostTelemetryDataObtainedFromMavlink');

// set our action's expected value. This is to verify that the action was successful
PostTelemetry.expects('UAS Telemetry Successfully Posted.');

// override run function
PostTelemetry.run = function() {

	var action = this;

	// init mavlink listener module
	Mavlink.listen(function(message, fields) {
		console.log('------------- MAV Message Received -------------');
		console.log('Length: ' + message.length + ' bytes');
		console.log('Type: ' + (typeof message));
		console.log('Content:');
		console.log(fields);
		console.log('------------------------------------------------');
	});

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our Action case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.post('/api/interop/uas_telemetry');

	// write data to send as a POST request
	this.modules.UasRequest.write(connection, 'latitude=50&longitude=47&altitude_msl=3&uas_heading=80');
	this.modules.UasRequest.requireAuthentication(connection, 'Action', 'Action');
	this.modules.UasRequest.send(connection, function(response) {
		action.end(response);
	});

}

// add a new instance of our Action to the Actioning library
Actions.addAction(PostTelemetry);
