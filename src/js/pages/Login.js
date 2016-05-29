/* global $ */

module.exports = function() {
	var SuperClass = require('./Page.js');
	var Super = SuperClass();

	var controller = require('../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	var util = require('../utils/Util.js');
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		$('#loginForm').submit(function(e) {
			e.preventDefault();
			if (util.checkVaildEmail($('#inputName').val()) == false) {
				alert('아이디를 입력하세요');
			} else {
				controller.login($('#inputName').val(), $('#inputPW').val());
			}
			
			e.stopPropagation();
		});
	};
	
	
	/**
	 * 로그인 완료 이벤트 핸들링
	 * @param {String} value email address for validation 
	 */
	function loginCompleteHandler(e, status) {
		switch(status) {
			case 200:
				alert('로그인 성공');
				break;
			default:
				alert('로그인 실패, code: '+status);
				break;
		}
	};
}