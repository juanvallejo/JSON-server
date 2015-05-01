#!/bin/env node

/**
 * Provided under the MIT License (c) 2014
 * See LICENSE @file for details.
 *
 * Files written to Action interoperability request handling for the UAS competition server
 *
 * @file getObsticleInformationAction.js
 *
 * @author David Kroell
 * @date 02/23/2015
 *
 * @Actioncase
 */


// import prototype object and Action case library
var Actions 	= require('../Actions.js');
var Action 	= require('../prototypes/Action.js');

// declare and name our new Action case
var ObstacleInformationAction = new Action('doesJSONServerReceiveObstacleInformation');

// set our Action case's expected value
ObstacleInformationAction.expects('{"stationary_obstacles": [], "moving_obstacles": []}');

// override run function
ObstacleInformationAction.run = function() {

	var ActionCase = this;

	// make a new uas request to the json server. Pass the method we want to call on the json server
	// as the first parameter. We then use the 'end' method to indicate that our Action case has finished executing
	// passing the 'actual' result to it
	var connection = this.modules.UasRequest.get('/api/interop/obstacles');

	// set request's options and send connection
	this.modules.UasRequest.requireAuthentication(connection, 'Action', 'Action');
	this.modules.UasRequest.send(connection, function(response) {
		ActionCase.end(response);
	});

}

// add a new instance of our Action to the Actioning library
Actions.addAction(ObstacleInformationAction);
