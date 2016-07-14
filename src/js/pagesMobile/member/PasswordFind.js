/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var infoController = require('../../controller/MemberInfoController');
	$(infoController).on('findPwResult', findPwResultHandler);
	$(infoController).on('authorizePhoneRequestResult', authorizePhoneRequestHandler);
	$(infoController).on('authorizePhoneConfirmResult', authorizePhoneConfirmHandler);
	var util = require('../../utils/Util.js');
	
	var findMethod;
	var tempId;
	var tempAuthKey;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		$('.btnBackToForm').click(initForm);
		$('#pwAuthPhone').click(initPwAuthPhoneForm);
		$('#findPwAuthPhoneRequestButton').click(requestPhoneAuthNumber);
		$('#findPwAuthPhoneConfirmButton').click(confirmPhoneAuthNumber);
		$('#findPwAuthMailResendButton').click(requstPwAuthMailResend);
		
		$('#findPW').submit(findPwFormSubmitHandler);
		initForm();
	};
	
	/**
	 * ID/비번찾기 폼 초기화
	 */
	function initForm(e) {
		if (e != undefined) e.preventDefault();
		Cookies.remove('loginPwReset');
		
		$('#inputId').val('');
	
		$('#findInfoForm').show().siblings('div').hide();
		if (e != undefined) e.stopPropagation();
	};
	
	/**
	 * 비번찾기 폼 submit 
	 */
	function findPwFormSubmitHandler(e) {
		e.preventDefault();

		tempAuthKey = '';
		var id = $.trim($('#inputId').val());
		
		if (util.checkValidMobileNumber(id)) {
			// 휴대폰 번호
			findMethod = 'phone';
			tempId = id;
			infoController.findPasswordByPhone(id);
		} else {
			// 이메일
			if (util.checkVaildEmail(id)) {
				findMethod = 'mail';
				tempId = id;
				infoController.findPasswordByMail(id);
			} else {
				Super.Super.alertPopup('비밀번호 찾기', '아이디(이메일 또는 휴대폰 번호)를 정확하게 입력해주세요.', '확인');
			}
		}

		e.stopPropagation();
	};
	
	/**
	 * 비번찾기 결과 handling
	 */
	function findPwResultHandler(e, result, id) {
		switch(result.status) {
			case '200':
				switch(findMethod) {
					case 'phone':
						//$('#findPwAuthMail').show().siblings('div').hide();
						break;
					case 'mail':
						$('#findPwAuthMail').show().siblings('div').hide();
						break;
				}
				break;
				
			case '400':
				// 아이디 없음
				Super.Super.alertPopup('비밀번호 찾기', result.message, '확인');
				break;
		}
	};
	
	/**
	 * 이메일 인증 재요청
	 */
	function requstPwAuthMailResend(e) {
		e.preventDefault();
		Super.Super.alertPopup('비밀번호 찾기', '인증메일이 재발송 되었습니다', '확인');
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증 폼 초기화
	 */
	function initPwAuthPhoneForm(e) {
		e.preventDefault();
		$('#findPwAuthPhoneName').val('');
		$('#findPwAuthPhonePhone').val('');
		$('#findPwAuthPhoneConfirm').val('');
		
		$('#findPwAuthPhone').show().siblings('div').hide();
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증번호 요청
	 */
	function requestPhoneAuthNumber(e) {
		e.preventDefault();
		
		var phone = $.trim($('#findPwAuthPhonePhone').val());
		var name = $.trim($('#findPwAuthPhoneName').val());
		
		if (name == '') {
			alert('이름을 입력해주세요');
		} else if (phone == '' || !util.checkValidMobileNumber(phone)) {
			alert('휴대폰번호를 입력해주세요');
		} else {
			infoController.authorizePhoneRequest(phone, name);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증번호 요청결과 핸들링
	 */
	function authorizePhoneRequestHandler(e, result) {
		switch(result.status) {
			case '200':
				alert('인증번호가 발송되었습니다.'); 
				break;
			default:
				alert(result.message);
				break;
		}
	};
	
	/**
	 * 휴대전화 인증번호 검증
	 */
	function confirmPhoneAuthNumber(e) {
		e.preventDefault();
		tempAuthKey = '';
		
		alert('휴대폰 인증번호를 입력해 주세요');
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증번호 검증결과 핸들링
	 */
	function authorizePhoneConfirmHandler(e, result, tempAuthKey) {
		switch(result.status) {
			case '200':
				alert('휴대폰 인증에 성공하였습니다.');
				tempAuthKey = tempAuthKey;
				break;
			case '400':
				alert('휴대폰 인증에 실패하였습니다. 인증번호를 다시 확인해 주세요.'); 
				break;
			default:
				alert(result.message);
				break;
		}
	};
}