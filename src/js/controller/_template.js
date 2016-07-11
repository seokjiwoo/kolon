/* global $ */

module.exports = ClassExampleController().getInstance();

function ClassExampleController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = ExampleController();
			return instance;
		}
	};
	
	function ExampleController() {
		callerObj = {
			/**
			 * 예제
			 */
			example: example
		}
		
		return callerObj;	
	};
	
	/**
	 * 예제
	 */
	function example(attr) {
		Super.callApi('/apis/example', 'POST', {
			"example": attr,
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('exampleResult', [status, result]);
			} else {
				Super.handleError('example', result);
				$(callerObj).trigger('exampleResult', [status, result]);
			}
		}, false);
	};
}

