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
			alert('잘못된 접근입니다');
			location.href = '/';
		} else {
			authKey = util.getUrlVar('key');
			$('#key').val(authKey);
		}
		
		$('#resetPW').change(checkPasswordField);
		$('#resetPW02').change(checkPasswordField);
		$('#resetPW').on('keydown keyup', onCheckValidPassword);
		$('#resetPW02').on('keydown keyup', onCheckValidPassword);

		$('#passwordResetForm').submit(resetPasswordHandler);
		$('#passwordResetForm .js-submit').on('click', resetPasswordHandler);		
	};

	function onCheckValidPassword(e) {
		var target = $(e.currentTarget);

		if (util.checkValidPassword(target.val())) {
			target.closest('li').addClass('active');
		} else {
			target.closest('li').removeClass('active');
		}

		$('#resetPWAlert').text('');
		$('#resetPW02Alert').text('');
	}
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#resetPW').val();
		var inputValue2 = $('#resetPW02').val();

		if (!inputValue1) {
			$('#resetPWAlert').text('비밀번호를 입력해주세요.');
			$('#resetPW').focus();
			return;
		} else if (!util.checkValidPassword(inputValue1)) {
			$('#resetPWAlert').text('잘못된 비밀번호 형식입니다.');
			$('#resetPW').focus();
			return;
		}

		if (!inputValue2) {
			$('#resetPW02Alert').text('비밀번호를 한번 더 입력해주세요.');
			$('#resetPW02').focus();
			return;
		}  else if (!util.checkValidPassword(inputValue2)) {
			$('#resetPW02Alert').text('잘못된 비밀번호 형식입니다.');
			$('#resetPW02').focus();
			return;
		}
		
		if (inputValue1 !== inputValue2) {
			$('#resetPW02Alert').text('비밀번호가 일치하지 않습니다.');
			$('#resetPW').focus();
		} else {
			$('#resetPWAlert').text('');
			$('#resetPW02Alert').text('');
		}
	};
	
	/**
	 * 패스워드 리셋 요청
	 */
	function resetPasswordHandler(e) {
		e.preventDefault();

		var inputValue1 = $.trim($('#resetPW').val());
		var inputValue2 = $.trim($('#resetPW02').val());
		
		if (inputValue1 == '') {
			Super.Super.alertPopup('', '비밀번호를 입력해 주세요.', '확인');
		} else if (inputValue1 != '' && inputValue2 == '') {
			Super.Super.alertPopup('', '비밀번호를 한번 더 입력해 주세요.', '확인');
		} else if (inputValue2 != '' && inputValue1 != inputValue2) {
			Super.Super.alertPopup('', '비밀번호가 일치하지 않습니다.', '확인');
		} else {
			infoController.resetPassword(authKey, inputValue1);
		}
		e.stopPropagation();
	};

	function resetPasswordResultHandler(e, status, result) {
		if (status == 200) {
			window.alert(result.message);
			location.href='/member/login.html';
		} else {
			$('#resetPWAlert').text(result.message);
		}
	};
}