#!/bin/env node

/**
 * Action case library. Contains the main Actions {} object for holding all unit Action cases and Action library apis.
 * Meant to be used with the Action prototype
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// initialize our Actions api
var Actions = {};

Actions.VERSION 			= 'v1.1';

// define a default category and a dictionary to hold our actions god damn it! (Not Actions..). Each key will be an action category, and each value will be an array
// of Action cases pertaining to that specific category
Actions.defaultCategory 	= 'General';
Actions.items 			= {};
Actions.itemCount 		= 0;

Actions.size = function() {
	return Actions.itemCount;
}

/**
 * assign a new value to our default category
 */
Actions.setDefaultCategory = function(category) {
	Actions.defaultCategory = category;
}

/**
 * Assert that two Action-case objects are the same
 */
Actions.assertObjectEquals = function(expectedObject, actualObject) {

	// determine if an 'equals' method has been declared for either object
	if(typeof expectedObject.equals == 'function' || typeof actualObject.equals == 'function') {
		
		if(expectedObject.equals) {
			return expectedObject.equals(actualObject);
		}

		return actualObject.equals(expectedObject);
	}

	// if no equals method is found, compare both objects like string values
	return Actions.assertStringEquals(expectedObject, actualObject);

}

/**
 * Assert that two Action-case strings are the same
 */
Actions.assertStringEquals = function(expectedString, actualString) {

	if(expectedString == actualString) {
		return true;
	}

	return false;

}

/**
 * Assert both values are of type null
 */
Actions.assertNullEquals = function(expected, actual) {

	if(expected === null && actual === null) {
		return true;
	}

	return false;

}

/**
 * Assert that two values are equal
 */
Actions.assertEquals = function(expected, actual) {

	// determine if two values are of type object, act accordingly
	if(typeof expected == 'function' || typeof actual == 'function') {
		return Actions.assertObjectEquals(expected, actual);
	}

	if(expected === null || actual === null) {
		return Actions.assertNullEquals(expected, actual);
	}

	return Actions.assertStringEquals(expected, actual);

}

/**
 * Add a Action case to the Actions library, under a specific category.
 * 
 * @param category is a String containing a specific category to assign to your Action case
 * @param ActionCase (Action) object to add to our list of categorically-sorted Action cases
 */
Actions.addActionWithCategory = function(ActionCase, category) {

	// create a new category array for our Action if one does not exist by the given one
	if(!Actions.items[category]) {
		Actions.items[category] = [];
	}

	// tell the Action case which index it will be assigned when it's added
	// to our list of Action cases
	ActionCase._ActionsItemsIndex = Actions.items[category].length;

	ActionCase.setCategory(category);
	Actions.items[category].push(ActionCase);

	// increment the amount of Actions added
	Actions.itemCount++;

}

/**
 * Add a Action case to the Actions library, under the default category. If a ActionCase object contains
 * a 'category' value already (assigned by the user), this is used instead.
 * 
 * @param ActionCase
 */
Actions.addAction = function(ActionCase) {

	var category = ActionCase.getCategory();

	if(!category) {
		category = Actions.defaultCategory;
	}

	Actions.addActionWithCategory(ActionCase, category);
}

/**
 * Remove a Action object from our list of added Action cases. A Action is removed by setting its
 * value in the array to null.
 */
Actions.removeAction = function(ActionCase) {

	if(ActionCase._ActionsItemsIndex) {
		Actions.items[ActionCase.getCategory()][ActionCase._ActionsItemsIndex] = null;
		return;
	}

	for(var i in Actions.items) {

		Actions.items[i].forEach(function(item, index) {
			if(item == ActionCase) {
				Actions.items[i][index] = null;
				return;
			}
		});

	}

}

/**
 * Run an individual Action case. Requires a callback function to be passed in order
 * to support asynchronous Action cases
 * 
 * @return boolean true or false, depending on Action case result
 */
Actions.runAction = function(ActionCase, callback) {

	// log our Action-case information
	if(ActionCase.getExpectedValue() === undefined) {
		console.log('');
		console.log('Warning: Action case \'' + ActionCase.getName() + '\' skipped! No expected value provided. Use .expected(value) to assign one for this case.');
		return;
	}

	// run and store the value returned by running our Action
	ActionCase.onEnd(function(actualValue) {

		console.log('');
		console.log('');
		console.log('Action name: ' + this.getName());
		console.log('Action expected: ' + this.getExpectedValue());
		console.log('Action returned: ' + actualValue);
		console.log('');

		// determine if the Action was successful
		if(Actions.assertEquals(this.getExpectedValue(), actualValue)) {
			console.log('Action result: success');
			callback.call(this, true);
			return;
		}

		// expected and actual values differ
		console.log('Action result: fail');
		callback.call(this, false);

		return;

	});

	ActionCase.run();

}

/**
 * Run all Action cases
 */
Actions.run = function() {

	console.log('Actions version ' + Actions.VERSION + ' initialized.');
	console.log('');

	var passedActionsCount = 0;
	var failedActionsCount = 0;

	for(var i in Actions.items) {

		// only announce current category of Actions being run if we have moved on to a new one
		
		console.log('------------> ' + i + ' <------------');

		Actions.items[i].forEach(function(ActionCase) {

			Actions.runAction(ActionCase, function(ActionCasePassed) {

				// run the individual Action and determine its outcome
				if(ActionCasePassed) {
					passedActionsCount++;
				} else {
					failedActionsCount++;
				}

				// determine if all Actions have been called
				if(passedActionsCount + failedActionsCount == Actions.size()) {

					// add some spacing before our message
					console.log('');
					console.log('');
					console.log('------------> Results <------------');
					console.log('');
					console.log('Total passed: ' + passedActionsCount);
					console.log('Total failed: ' + failedActionsCount);
					console.log('Total found: ' + (passedActionsCount + failedActionsCount));
					console.log('');

				}

			});

		});

	}

}

module.exports = Actions;
