/* global $ */

module.exports = function() {
	var SuperClass = require('./Page.js');
	var Super = SuperClass();
	
	var controller = require('../controller/LoginController');
	$(controller).on('checkEmailResult', checkEmailResultHandler);
	var util = require('../utils/Util.js');
	
	var passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]).{9,16}$/i;
	var phoneNumberRule = /^[0-9]{10,12}$/i;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		var tags = '';
		for (var i = new Date().getFullYear()-14; i > new Date().getFullYear()-99; i--) {
			tags += ('<option value="'+i+'">'+i+'</option>');
		}
		$('#joinBirth01').html(tags);
		
		$('#joinId').change(checkEmailField);
		$('#joinPW').change(checkPasswordField);
		$('#joinPW02').change(checkPasswordField);
		$('#joinPhone').change(checkPhoneField);
		
		$('#joinForm').submit(function(e) {
			e.preventDefault();
			
			var id = $('#joinId').val();
			var pw1 = $('#joinPW').val();
			var pw2 = $('#joinPW02').val();
			var joinName = $('#joinName').val();
			var phone = $('#joinPhone').val();
			
			$('#joinNameAlert').text('');
			
			if (util.checkVaildEmail(id) == false) {
				$('#joinIdAlert').text('이메일 주소를 정확하게 입력해주세요.');
			} else if (pw1 == '' || pw2 == '') {
				$('#joinPWAlert').text('비밀번호를 입력해 주세요.');
			} else if (pw1 != pw2) {
				$('#joinPWAlert').text('비밀번호가 일치하지 않습니다.');
			} else if (!passwordRule.test(pw1)) {
				$('#joinPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
			} else if ($.trim(joinName) == '') {
				$('#joinNameAlert').text('이름을 입력해 주세요.');
			} else if (!passwordRule.test(phone)) {
				$('#joinPhoneAlert').text('10-12자리의 숫자만 입력해 주세요.');
			} else {
				alert('GO');
			}
			
			e.stopPropagation();
		});
	};
	
	/**
	 * 이메일 필드 검사
	 */
	function checkEmailField(e) {
		var inputValue = $('#joinId').val();
		if (util.checkVaildEmail(inputValue) == false) {
			$('#joinIdAlert').text('이메일 주소를 정확하게 입력해주세요.');
		} else {
			$('#joinIdAlert').text('');
			controller.checkEmail(inputValue);
		}
	};
	
	/**
	 * 이메일 중복 체크 결과 핸들링 
	 */
	function checkEmailResultHandler(e, status) {
		console.log(status);
	};
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#joinPW').val();
		var inputValue2 = $('#joinPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#joinPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!passwordRule.test(inputValue1)) {
			$('#joinPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#joinPWAlert').text('');
		}
	};
	
	/**
	 * 전화번호 필드 검사 
	 */
	function checkPhoneField(e) {
		var inputValue = $('#joinPhone').val();
		if (!phoneNumberRule.test(inputValue)) {
			$('#joinPhoneAlert').text('10-12자리의 숫자만 입력해 주세요.');
		} else {
			$('#joinPhoneAlert').text('');
		}
	};
}