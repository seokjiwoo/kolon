/* global $ */

module.exports = function() {
	var controller = require('../controller/LoginController');
	$(controller).on('logoutResult', logoutResultHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		controller.logout();
	};
	
	function logoutResultHandler(e, status) {
		switch(status) {
			case 200:
				//alert('로그아웃 성공');
				location.href = '/';
				break;
			default:
				alert('로그아웃 실패, code: '+status);
				history.back(-1);
				break;
		}
	};
}