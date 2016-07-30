/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var infoController = require('../../controller/MemberInfoController');
	$(infoController).on('findPwResult', findPwResultHandler);
	$(infoController).on('verifyMemberResult', findPwResultHandler);
	
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
			infoController.verifyMemberByPhone(id, 'PASSWORD');
		} else {
			// 이메일
			if (util.checkVaildEmail(id)) {
				findMethod = 'mail';
				tempId = id;
				infoController.findPasswordByMail(id);
			} else {
				Super.Super.alertPopup('비밀번호 찾기', '아이디(이메일 또는 휴대폰 번호)를 정확하게 입력해주세요.', '확인');
			}
		}

		e.stopPropagation();
	};
	
	/**
	 * 비번찾기 결과 handling
	 */
	function findPwResultHandler(e, status, result) {
		switch(status) {
			case 200:
				switch(findMethod) {
					case 'phone':
						//location.href = result.data.redirectUrl;
						location.href = '/member/passwordReset.html?key='+result.data.redirectUrl.split('=')[1];
						break;
					case 'mail':
						$('#findPwAuthMail').show().siblings('div').hide();
						
						var tempIdId = tempId.split('@');
						var tempIdDomain = tempIdId[1].split('.');

						$('#sendedEmailAddress').text(tempIdId[0].substr(0, 3)+('***@')+tempIdDomain[0].substr(0, 3)+('***.')+tempIdDomain[1]);
						break;
				}
				break;
				
			case 400:
				// 아이디 없음
				Super.Super.alertPopup('비밀번호 찾기', result.message, '확인');
				break;
				
			default:
				Super.Super.alertPopup('비밀번호 찾기', result.status+': '+result.message, '확인');
				break;
		}
	};
	
	/**
	 * 이메일 인증 재요청
	 */
	function requstPwAuthMailResend(e) {
		e.preventDefault();
		infoController.findPasswordByMail(tempId);
		Super.Super.alertPopup('비밀번호 찾기', '인증메일이 재발송 되었습니다', '확인');
		e.stopPropagation();
	};
}