/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var util = require('../../utils/Util.js');

	var infoController = require('../../controller/MemberInfoController');
	$(infoController).on('resetPasswordResult', resetPasswordResultHandler);
	
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

		if (util.getUrlVar('key') != undefined) {
			alert('잘못된 접근입니다');
		} else {
			authKey = util.getUrlVar('key');
			$('#key').val(authKey);
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
		} else if (!util.checkValidPassword(inputValue1)) {
			$('#resetPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#resetPWAlert').text('');
		}
	};
	
	/**
	 * 패스워드 리셋 요청
	 */
	function resetPasswordHandler(e) {
		var inputValue1 = $('#resetPW').val();
		var inputValue2 = $('#resetPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			Super.Super.alertPopup('', '비밀번호가 일치하지 않습니다.', '확인');
			e.preventDefault();
			e.stopPropagation();
		} else {
			//controller.resetPassword(authKey, inputValue1);
			// FORM SUBMIT
		}
	};

	function resetPasswordResultHandler(e, status, result) {
		Super.Super.alertPopup('비밀번호 재설정', result.message, '확인', function(e){
			if (status == 200) location.href='/member/login.html';
		});
	};
}