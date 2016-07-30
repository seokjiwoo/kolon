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

		if (util.getUrlVar('key') == undefined) {
			//alert('잘못된 접근입니다');
			//location.href = '/';
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
		var inputValue1 = $.trim($('#resetPW').pVal());
		var inputValue2 = $.trim($('#resetPW02').pVal());
		
		if (inputValue1 == '') {
			$('#resetPWAlert1').text('비밀번호를 입력해 주세요.');
			$('#resetPWAlert2').text('');
		} else if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#resetPWAlert1').text('');
			$('#resetPWAlert2').text('비밀번호가 일치하지 않습니다.');
		} else if (!util.checkValidPassword(inputValue1)) {
			$('#resetPWAlert1').text('');
			$('#resetPWAlert2').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#resetPWAlert1').text('');
			$('#resetPWAlert2').text('');
		}
	};
	
	/**
	 * 패스워드 리셋 요청
	 */
	function resetPasswordHandler(e) {
		e.preventDefault();

		var inputValue1 = $.trim($('#resetPW').pVal());
		var inputValue2 = $.trim($('#resetPW02').pVal());
		
		if (inputValue1 == '') {
			$('#resetPWAlert1').text('비밀번호를 입력해 주세요.');
			$('#resetPWAlert2').text('');
			Super.Super.alertPopup('', '비밀번호를 입력해 주세요.', '확인');
		} else if (inputValue1 != '' && inputValue2 == '') {
			$('#resetPWAlert1').text('');
			$('#resetPWAlert2').text('비밀번호를 한번 더 입력해 주세요.');
			Super.Super.alertPopup('', '비밀번호를 한번 더 입력해 주세요.', '확인');
		} else if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#resetPWAlert1').text('');
			$('#resetPWAlert2').text('비밀번호가 일치하지 않습니다.');
			Super.Super.alertPopup('', '비밀번호가 일치하지 않습니다.', '확인');
		} else {
			infoController.resetPassword(authKey, inputValue1);
		}
		e.stopPropagation();
	};

	function resetPasswordResultHandler(e, status, result) {
		alert(result.message);

		if (status == 200) {
			location.href='/member/login.html';
		}
	};
}