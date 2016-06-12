/* global $ */

module.exports = function() {
	var SuperClass = require('./Page.js');
	var Super = SuperClass();

	var controller = require('../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	$(controller).on('socialLoginUrlResult', socialLoginUrlResultHandler);
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
		
		controller.getSocialLoginUrl();
		
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
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialLogin-'+eachService.socialName).attr('href', eachService.authUrl);
		}
	};
	
	/**
	 * 로그인 완료 이벤트 핸들링
	 */
	function loginCompleteHandler(e, status) {
		switch(status) {
			case 200:
				//alert('로그인 성공');
				location.href = '/';
				break;
			default:
				alert('로그인 실패, code: '+status);
				break;
		}
	};
}