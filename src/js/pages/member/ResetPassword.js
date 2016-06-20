/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]).{9,16}$/i;
	
	var memberNumber;
	var authKey;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		if (Cookies.getJSON('loginPwReset') == undefined) {
			// 메일인 경우?
			// alert('잘못된 접근입니다');
		} else {
			var searchResultCookie = Cookies.getJSON('loginPwReset');
			
			$('#memberName').text(searchResultCookie.name);
			$('#memberMail').text(searchResultCookie.mail);
			memberNumber = searchResultCookie.memberNumber;
			authKey = searchResultCookie.authKey;
		}
		
		$('#resetPW').change(checkPasswordField);
		$('#resetPW02').change(checkPasswordField);
		$('#passwordResetForm').submit(resetPasswordHandler);  
	};
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#resetPW').val();
		var inputValue2 = $('#resetPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#resetPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!passwordRule.test(inputValue1)) {
			$('#resetPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#resetPWAlert').text('');
		}
	};
	
	/**
	 * 패스워드 리셋 요청
	 */
	function resetPasswordHandler(e) {
		// 비밀번호가 일치하지 않습니다.
	};
}