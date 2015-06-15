#!/bin/env node

/**
 * Checks to see that a login request is handled and parsed by the server. An authentication token should be
 * received
 *
 * @author juanvallejo
 * @date 3/11/15
 *
 * @Actioncase
 * @request POST
 */

// import prototype object and Action case library
var Action 	= require('../prototypes/Action.js');

// declare and name our new Action case
var LoginAction = new Action('doesJSONServerHandleLoginRequest');

// set our Action case's expected value
LoginAction.expects('Login Successful.');

// override run function
LoginAction.run = function() {

	var ActionCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our Action case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.createPOSTRequest('/api/login');

	// write data to send as a POST request
	this.modules.UasRequest.write(connection, 'username=test&password=test');
	this.modules.UasRequest.send(connection, function(response) {
		ActionCase.end(response);
	});

}

// add a new instance of our Action to the Action library
module.exports = LoginAction;