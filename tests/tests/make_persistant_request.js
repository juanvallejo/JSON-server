/**
 * Checks to see that a connection is help open for a given period of time. As well as a persistent request is made.
 *
 * @author DKroell
 * @date
 * 
 * @testcase
 * @request POST
 */

// Import prototype object and test case library
var Tests   = require('../tests.js');
var Test    = require('../prototypes/test.js');

// Declare name ofr testcase
var MakePersistentRequest = new Test('doesJSONServerHandlePersistentRequest');

// Set our test case's expected value
MakePersistentRequest.expects('UAS Persistent Request Successfully Held');

// Override the 'run' function
MakePersistentRequest.run = function() {
    var testcase = this;
    
    /*  Make new UAS Request to the JSON server. Pass the method we want to call on the JSON server as the first parameter. We then use the 'end' method to indeicate that our test case has finished executing, thus passing the 'actual' result to it.
    */
    
    var connection = this.modules.UasRequest.makePersistentRequest('/api/interop/uas_telemetry');
}

//  add a new instance of our test to the testing library
Tests.addTest(MakePersistentRequest);