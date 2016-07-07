/* global $ */

module.exports = ClassMessageController().getInstance();

function ClassMessageController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = MessageController();
			return instance;
		}
	};
	
	function MessageController() {
		callerObj = {
			/**
			 * 메시지 목록
			 */
			messageList: messageList
		}
		
		return callerObj;	
	};
	
	/**
	 * 예제
	 */
	function messageList(attr) {
		Super.callApi('/apis/inquiries', 'GET', {}, function(status, result) {
			if (status != 200) {
				Super.handleError('messageList', status, result);
			}
			$(callerObj).trigger('messageListResult', [status, result]);
		}, false);
	};
}

