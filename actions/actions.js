#!/bin/env node

/**
 * Test case library. Contains the main Tests {} object for holding all unit test cases and test library apis.
 * Meant to be used with the Test prototype
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// initialize our Tests api
var Tests = {};

Tests.VERSION 			= 'v1.0';

// define a default category and a dictionary to hold our tests. Each key will be a test category, and each value will be an array
// of test cases pertaining to that specific category
Tests.defaultCategory 	= 'General';
Tests.items 			= {};
Tests.itemCount 		= 0;

Tests.size = function() {
	return Tests.itemCount;
}

/**
 * assign a new value to our default category
 */
Tests.setDefaultCategory = function(category) {
	Tests.defaultCategory = category;
}

/**
 * Assert that two test-case objects are the same
 */
Tests.assertObjectEquals = function(expectedObject, actualObject) {

	// determine if an 'equals' method has been declared for either object
	if(typeof expectedObject.equals == 'function' || typeof actualObject.equals == 'function') {
		
		if(expectedObject.equals) {
			return expectedObject.equals(actualObject);
		}

		return actualObject.equals(expectedObject);
	}

	// if no equals method is found, compare both objects like string values
	return Tests.assertStringEquals(expectedObject, actualObject);

}

/**
 * Assert that two test-case strings are the same
 */
Tests.assertStringEquals = function(expectedString, actualString) {

	if(expectedString == actualString) {
		return true;
	}

	return false;

}

/**
 * Assert both values are of type null
 */
Tests.assertNullEquals = function(expected, actual) {

	if(expected === null && actual === null) {
		return true;
	}

	return false;

}

/**
 * Assert that two values are equal
 */
Tests.assertEquals = function(expected, actual) {

	// determine if two values are of type object, act accordingly
	if(typeof expected == 'function' || typeof actual == 'function') {
		return Tests.assertObjectEquals(expected, actual);
	}

	if(expected === null || actual === null) {
		return Tests.assertNullEquals(expected, actual);
	}

	return Tests.assertStringEquals(expected, actual);

}

/**
 * Add a test case to the Tests library, under a specific category.
 * 
 * @param category is a String containing a specific category to assign to your test case
 * @param testCase (Test) object to add to our list of categorically-sorted test cases
 */
Tests.addTestWithCategory = function(testCase, category) {

	// create a new category array for our test if one does not exist by the given one
	if(!Tests.items[category]) {
		Tests.items[category] = [];
	}

	// tell the test case which index it will be assigned when it's added
	// to our list of test cases
	testCase._testsItemsIndex = Tests.items[category].length;

	testCase.setCategory(category);
	Tests.items[category].push(testCase);

	// increment the amount of tests added
	Tests.itemCount++;

}

/**
 * Add a test case to the Tests library, under the default category. If a testCase object contains
 * a 'category' value already (assigned by the user), this is used instead.
 * 
 * @param testCase
 */
Tests.addTest = function(testCase) {

	var category = testCase.getCategory();

	if(!category) {
		category = Tests.defaultCategory;
	}

	Tests.addTestWithCategory(testCase, category);
}

/**
 * Remove a test object from our list of added test cases. A test is removed by setting its
 * value in the array to null.
 */
Tests.removeTest = function(testCase) {

	if(testCase._testsItemsIndex) {
		Tests.items[testCase.getCategory()][testCase._testsItemsIndex] = null;
		return;
	}

	for(var i in Tests.items) {

		Tests.items[i].forEach(function(item, index) {
			if(item == testCase) {
				Tests.items[i][index] = null;
				return;
			}
		});

	}

}

/**
 * Run an individual test case. Requires a callback function to be passed in order
 * to support asynchronous test cases
 * 
 * @return boolean true or false, depending on test case result
 */
Tests.runTest = function(testCase, callback) {

	// log our test-case information
	if(testCase.getExpectedValue() === undefined) {
		console.log('');
		console.log('Warning: Test case \'' + testCase.getName() + '\' skipped! No expected value provided. Use .expected(value) to assign one for this case.');
		return;
	}

	// run and store the value returned by running our test
	testCase.onEnd(function(actualValue) {

		console.log('');
		console.log('');
		console.log('Test name: ' + this.getName());
		console.log('Test expected: ' + this.getExpectedValue());
		console.log('Test returned: ' + actualValue);
		console.log('');

		// determine if the test was successful
		if(Tests.assertEquals(this.getExpectedValue(), actualValue)) {
			console.log('Test result: success');
			callback.call(this, true);
			return;
		}

		// expected and actual values differ
		console.log('Test result: fail');
		callback.call(this, false);

		return;

	});

	testCase.run();

}

/**
 * Run all test cases
 */
Tests.run = function() {

	console.log('Tests version ' + Tests.VERSION + ' initialized.');
	console.log('');

	var passedTestsCount = 0;
	var failedTestsCount = 0;

	for(var i in Tests.items) {

		// only announce current category of tests being run if we have moved on to a new one
		
		console.log('------------> ' + i + ' <------------');

		Tests.items[i].forEach(function(testCase) {

			Tests.runTest(testCase, function(testCasePassed) {

				// run the individual test and determine its outcome
				if(testCasePassed) {
					passedTestsCount++;
				} else {
					failedTestsCount++;
				}

				// determine if all tests have been called
				if(passedTestsCount + failedTestsCount == Tests.size()) {

					// add some spacing before our message
					console.log('');
					console.log('');
					console.log('------------> Results <------------');
					console.log('');
					console.log('Total passed: ' + passedTestsCount);
					console.log('Total failed: ' + failedTestsCount);
					console.log('Total found: ' + (passedTestsCount + failedTestsCount));
					console.log('');

				}

			});

		});

	}

}

module.exports = Tests;