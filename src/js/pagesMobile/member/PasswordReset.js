/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var util = require('../../utils/Util.js');
	
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

		$('#resetPW').on('keydown', onCheckValidPassword);
		$('#resetPW02').on('keydown', onCheckValidPassword);

		$('#resetPWSubmit').on('click', checkPasswordField);
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
		// 비밀번호와 비밀번호 확인 정보 간 불일치 시: ‘비밀번호가 일치하지 않습니다.’
		// 기존 비밀번호와 동일한 정보를 입력할 시: ‘기존 비밀번호와 동일한 비밀번호는 사용이 불가합니다. 다시 입력해주세요.’
	};
}