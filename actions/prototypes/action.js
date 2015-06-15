/**
 * Contains the blueprint (prototype) for a single Action case.
 * Meant to be used with the Actions Action-case library
 *
 * @author juanvallejo
 * @date 3/11/15
 */

var ActionModules = require('../modules');
var EventObject = require(__dirname + '/event_object.js');


/**
 * Action interface for implementing an action
 *
 * @param name is a String containing the name for this Action
 */
function Action(name) {

	if(!name) {
		throw 'A name for each action case is required.';
	}

	this.name 			= name;
	this.expectedValue 	= undefined; 
	this.actualValue 	= null;
	this.category 		= null;

	this.callbacks 		= [];

	// define Action modules
	this.modules 		= ActionModules;

	/**
	 * used to apply a category this Action belongs to
	 */
	this.setCategory = function(category) {
		this.category = category;
	}

	/**
	 * Returns the category assigned to our Action case
	 */
	this.getCategory = function() {
		return this.category;
	}

	/**
	 * Returns the Action-case's assigned expected value
	 */
	this.getExpectedValue = function() {
		return this.expectedValue;
	}

	/**
	 * Returns the name assigned to this Action case
	 */
	this.getName = function() {
		return this.name;
	}

	/**
	 * Defines the expected value our Action will look for
	 */
	this.expects = function(value) {
		this.expectedValue = value;
	}

	/**
	 * Run method for our Action. Every Action item must implement it.
	 *
	 * @return each Action case MUST return an "actual" value, or the value obtained
	 * that should be compared to its expected value. This can be a String, Integer, Object, Boolean, Function, or a null value
	 */
	this.run = function() {

		// implement runnable steps here
		console.log('Action warning: Unimplemented Action. Run method should be overriden.');

		this.end(null);

	}

	/**
	 * Adds a function to be executed once the Action ends
	 */
	this.onEnd = function(callback) {
		this.callbacks.push(callback);
	}

	/**
	 * Since responses are sometimes asynchronous, we use
	 * the end method to indicate the exact value that our Action case is supposed to return
	 * when our Action has completely finished executing
	 */
	this.end = function(value) {

		if(!(value instanceof Array)) {
			value = [value];
		}

		for(var i = 0; i < this.callbacks.length; i++) {
			this.callbacks[i].apply(this, value);
		}

	}

}

module.exports = Action;
