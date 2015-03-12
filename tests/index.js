/**
 * Test-case index file. Runs all test cases and reports back information about them
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// import test case library
var Tests = require(__dirname + '/tests.js');

//import all test cases
require('fs').readdirSync(__dirname + '/tests').forEach(function(testCase) {
	require(__dirname + '/tests/' + testCase);
});

// run all tests
Tests.run();