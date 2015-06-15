/**
 * Test-case index file. Runs all test cases and reports back information about them
 *
 * @author juanvallejo
 * @date 3/11/15
 */

// import actions case library
var Actions = require(__dirname + '/actions.js');

//import all actions
require('fs').readdirSync(__dirname + '/actions').forEach(function(action) {
	if(action.split('.js').length > 1) {
		Actions.addAction(require(__dirname + '/actions/' + action));
	}
});

// run all actions
Actions.run();
