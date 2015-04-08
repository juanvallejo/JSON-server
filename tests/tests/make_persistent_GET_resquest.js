/**
 *
 * Meant to handle persistent Get requests by the UasRequest module that is in the script
 * @author davidkroell
 * @date 04/07/2015
 *
 * @testcase
 * @Request: PERSISTENT_POST
 *
 */


// import prototype objects as well as the testcase library
var Tests    = require('../tests.js');
var Test     = require('../prototypes/test.js');

// name the testcase
var PersistentRequestGET = new Test('doesJSONServerHandlePersistentGETRequest');

// set our test case's expected value
PersistentRequestGET.expects('{"stationary_obstacles": [], "moving_obstacles": []}');

// override run function
PersistentRequestGET.run = function() {
    
    var testCase = this;
    
    // make a new uas request to the json server.
    var connection = this.modules.UasRequest.get('/api/interop/obstacles');
    
    // set requests options and send the connection variable
    this.modules.UasRequest.requireAuthentication(connection, 'test', 'test');
    this.modules.UasRequest.send(connection, function(response) {
            testCase.end(response);
    });

}

// add a new instance of our test to the testing library
Tests.addTest(PersistentRequestGET);