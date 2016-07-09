/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/EditPassword.js';
	
	var controller = require('../../controller/MemberInfoController');
	$(controller).on('changePasswordResult', changePasswordResultHandler);

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		$('#newPW01').change(checkPasswordField);
		$('#newPW02').change(checkPasswordField);
		$('#changePWForm').submit(submitPasswordForm);
	};

	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#newPW01').val();
		var inputValue2 = $('#newPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#newPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!util.checkValidPassword(inputValue1)) {
			$('#newPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#newPWAlert').text('');
		}
	};

	/**
	 * 회원가입 절차 진행
	 */
	function submitPasswordForm(e) {
		e.preventDefault();
		
		var pw0 = $('#currentPW').val();
		var pw1 = $('#newPW01').val();
		var pw2 = $('#newPW02').val();
		
		if (pw1 == '' || pw2 == '') {
			alert('비밀번호를 입력해 주세요.');
			$('#newPWAlert').text('비밀번호를 입력해 주세요.');
		} else if (pw1 != pw2) {
			alert('비밀번호가 일치하지 않습니다.');
			$('#newPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!util.checkValidPassword(pw1)) {
			alert('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
			$('#newPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			controller.changePassword(MyPage.Super.Super.loginData.memberNumber, pw0, pw1);
		}
		
		e.stopPropagation();
	};

	function changePasswordResultHandler(e, status, result) {
		if (status == 200) {
			MyPage.Super.Super.alertPopup('비밀번호 변경에 성공하였습니다', result.message, '확인', function(){
				location.href='/myPage/';
			});
		} else {
			MyPage.Super.Super.alertPopup('비밀번호 변경에 실패하였습니다', result.message, '확인');
		}
	};
};