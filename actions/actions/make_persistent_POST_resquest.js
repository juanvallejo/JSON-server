#!/bin/env node

/**
 * Checks to make sure that a persistent request is handeled correctly by the JSON-server.
 * @author juanvallejo
 * @date 4/07/15
 *
 * @Actioncase
 * @request PERSISTENT_POST
 */

// import prototype object and Action case library
var Action = require('../prototypes/Action.js');

// declare and name our new Action case
var PostTelemetryAction = new Action('doesJSONServerHandlePersistentPOSTRequests');

// set our Action case's expected value
PostTelemetryAction.expects('UAS Telemetry Successfully Posted.');

// override run function
PostTelemetryAction.run = function() {

	var action = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our Action case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.invokePOSTRequest('/api/interop/uas_telemetry');

	// write data to send as a POST request
	this.modules.UasRequest.write(connection, 'latitude=50&longitude=47&altitude_msl=3&uas_heading=80');
	this.modules.UasRequest.requireAuthentication(connection, 'test', 'test');
	this.modules.UasRequest.send(connection, function(response) {
		action.end(response);
    });
}

// expose a new instance of our Action to the Action library
module.exports = PostTelemetryAction;