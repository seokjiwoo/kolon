/* global $ */

module.exports = ClassPersonalCardController().getInstance();

function ClassPersonalCardController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = PersonalCardController();
			return instance;
		}
	};
	
	function PersonalCardController() {
		callerObj = {
			/**
			 * 예제
			 */
			personalCard: personalCard
		}
		
		return callerObj;	
	};
	
	/**
	 * 예제
	 */
	function personalCard(attr) {
		Super.callApi('/apis/me/personal', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('personalCardResult', [200, result.data.myPersonalResponse]);
			} else {
				Super.handleError('personalCard', result);
				$(callerObj).trigger('personalCardResult', [status, result]);
			}
		}, false);
	};
}

