/**
 * TestCase modules. Provide wrappers with predefined values, classes, etc. for test cases
 */

//import all modules
var modules = {};
var currentModule;

// read and import all js files in our modules folder
require('fs').readdirSync(__dirname).forEach(function(module) {

	if(module != 'index.js' && module.split('js').length > 1) {
		
		currentModule = require('./' + module);
		
		if(!currentModule.MODULE_NAME) {
			modules[module.split('.js')[0]] = currentModule;
		} else {
			modules[currentModule.MODULE_NAME] = currentModule;
		}
	}

});

module.exports = modules;