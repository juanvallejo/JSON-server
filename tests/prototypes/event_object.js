/**
 * Contains the blueprint (prototype) for an instantiated object that emits events.
 * Meant to be used with the Tests test-case library
 *
 * @author juanvallejo
 * @date 3/11/15
 *
 * TODO: remove functions from ... on emitting
 */

function EventObject() {

	// define functions to call
	// when returns method is called
	this.callbacks 		= {};

	/**
	 * assign a callback for a specific event of the test case
	 */
	this.on = function(eventName, callback, emitOnce) {

		// determine if a callback for this eventName
		// has been previously assigned
		if(!this.callbacks[eventName]) {
			this.callbacks[eventName] = [];
		}

		if(emitOnce) {
			callback._emitOnce = true;
			callback._name = this.name;
		}

		this.callbacks[eventName].push(callback);

	}

	/**
	 * adds the callback to the list of callbacks for a given event and marks them for
	 * removal from the callbacks list after they are called at least once.
	 */
	this.emitOnceOn = function(eventName, callback) {
		this.on(eventName, callback, true);
	}

	/**
	 * call all pending callback functions for an event and pass an array of values as parameters
	 */
	this.emit = function(eventName, value) {

		if(!(value instanceof Array)) {
			value = [value];
		}

		if(!this.callbacks[eventName]) {
			return;
		}

		// the use of the 'forEach' function is not appropriate
		// as it fails to preserve context while iterating through all
		// items
		for(var i = 0; i < this.callbacks[eventName].length; i++) {

			this.callbacks[eventName][i].apply(this, value);

			// determine if callback should be removed after being called
			if(this.callbacks[eventName][i]._emitOnce) {
				this.callbacks[eventName].splice(i, 1);
			}
		}

	}

}

module.exports = EventObject;