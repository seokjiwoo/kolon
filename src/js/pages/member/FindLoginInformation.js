/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	
	var infoController = require('../../controller/MemberInfoController');
	$(infoController).on('findIdResult', findIdResultHandler);
	$(infoController).on('findPwResult', findPwResultHandler);
	$(infoController).on('authorizePhoneRequestResult', authorizePhoneRequestHandler);
	$(infoController).on('authorizePhoneConfirmResult', authorizePhoneConfirmHandler);
	var util = require('../../utils/Util.js');
	
	var socialName = {
		"facebook": "페이스북",
		"naver": "네이버",
		"kakao": "카카오"
	};
	var tempMemberNumber;
	var tempName;
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
		
		$('.tabWrap a').click(initForm);
		$('.btnBackToForm').click(initForm);
		$('#pwAuthPhone').click(initPwAuthPhoneForm);
		$('#pwAuthMail').click(requstPwAuthMail);
		$('#findPwAuthPhoneRequestButton').click(requestPhoneAuthNumber);
		$('#findPwAuthPhoneConfirmButton').click(confirmPhoneAuthNumber);
		$('#findPwAuthPhoneCompleteButton').click(completePhoneAuthNumber);
		$('#findPwAuthMailResendButton').click(requstPwAuthMailResend);
		
		$('#findID').submit(findIdFormSubmitHandler);
		$('#findPW').submit(findPwFormSubmitHandler);
		initForm();
	};
	
	/**
	 * ID/비번찾기 폼 초기화
	 */
	function initForm(e) {
		if (e != undefined) e.preventDefault();
		Cookies.remove('loginPwReset');
		
		$('#inputPhone').val('');
		$('#inputName').val('');
		$('#inputId').val('');
	
		$('#findInfoForm').show().siblings('div').hide();
		if (e != undefined) e.stopPropagation();
	};
	
	/**
	 * ID찾기 폼 submit 
	 */
	function findIdFormSubmitHandler(e) {
		e.preventDefault();
			
		var phone = $.trim($('#inputPhone').val());
		var name = $.trim($('#inputName').val());
		var phoneNumberRule = /^[0-9]{10,12}$/i;
		
		if (name == '') {
			alert('이름을 입력해주세요');
		} else if (phone == '' || !phoneNumberRule.test(phone)) {
			alert('휴대폰번호를 입력해주세요');
		} else {
			infoController.findId(name, phone);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * ID찾기 결과 handling
	 */
	function findIdResultHandler(e, result, name, phone) {
		switch(result.status) {
			case '200':
				if (result.data.members.length == 1) {
					var memberData = result.data.members[0];
					$('#idResultName').text(name);
					$('#idResultPhone').text(memberData.site.cellPhoneNumber);
					$('#idResultId').text(memberData.site.loginId);
					$('#idResultJoinDate').text(memberData.site.createDateTime.split(' ')[0].replace(/\-/gi, '. '));
					
					var socialTags = '';
					for (var eachSnsKey in memberData.socials) {
						var eachSns = memberData.socials[eachSnsKey];
						var joinSnsDate = eachSns.createDateTime.split(' ')[0].replace(/\-/gi, '. ');  // "2016-05-13 08:29:29.0"
						
						socialTags += '<div class="accountSummary">';
						socialTags += '<p><b>'+eachSns.socialEmail+'</b><br>가입일: '+joinSnsDate+'</p>';
						socialTags += '<a href="" class="btn loginSns '+eachSns.socialName+' btnSizeM btnShadow" id="socialLogin-'+eachSns.socialName+'">'+socialName[eachSns.socialName]+' 로그인</a>';
						socialTags += '</div>';
					}
					$('#socialAccount').html(socialTags);
					
					loginController.getSocialLoginUrl();
				} else {
					alert(name+" / "+phone+"\n\n일치하는 아이디가 없습니다.\n입력하신 정보를 다시 한 번 확인해주세요.");
				}
				break;
				
			case '500':
				alert(name+" / "+phone+"\n\n일치하는 아이디가 없습니다.\n입력하신 정보를 다시 한 번 확인해주세요.");
				break;
		}
	};
	
	/**
	 * 비번찾기 폼 submit 
	 */
	function findPwFormSubmitHandler(e) {
		e.preventDefault();
			
		var id = $.trim($('#inputId').val());
		
		if (id == '' || !util.checkVaildEmail(id)) {
			alert('아이디(이메일)를 정확하게 입력해주세요');
		} else {
			tempAuthKey = '';
			infoController.findPassword(id);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 비번찾기 결과 handling
	 */
	function findPwResultHandler(e, result, id) {
		switch(result.status) {
			case '200':
				tempMemberNumber = result.data.site.memberNumber;
				tempName = result.data.site.memberName;
				tempId = result.data.site.loginId;
				
				$('#pwResultName').text(tempName);
				$('#pwResultMail').text(tempId);
				$('#pwResultPhone').text(result.data.site.cellPhoneNumber);
				
				$('#findPwResult').show().siblings('div').hide();
				break;
				
			case '3001':
				// 아이디 없음
				alert(id+"\n\n등록된 정보가 없습니다. 입력하신 정보를 다시 한 번 확인해주세요.");
				break;
		}
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
		var phoneNumberRule = /^[0-9]{10,12}$/i;
		
		if (name == '') {
			alert('이름을 입력해주세요');
		} else if (phone == '' || !phoneNumberRule.test(phone)) {
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
	
	/**
	 * 휴대전화 인증 완료
	 */
	function completePhoneAuthNumber(e) {
		e.preventDefault();
		if (tempAuthKey == '') {
			alert('휴대폰 인증을 진행해 주세요.');
		} else {
			Cookies.set('loginPwReset', {
				memberNumber: tempMemberNumber,
				name: tempName,
				mail: tempId,
				authKey: tempAuthKey
			}, { expires: 1/288 });	// 1/288	// 5 minutes
			location.href = 'findLoginPwReset.html';
		}
		e.stopPropagation();
	};
	
	/**
	 * 이메일 인증 요청
	 */
	function requstPwAuthMail(e) {
		e.preventDefault();
		$('#findPwAuthMail').show().siblings('div').hide();
		e.stopPropagation();
	};
	
	/**
	 * 이메일 인증 재요청
	 */
	function requstPwAuthMailResend(e) {
		e.preventDefault();
		alert('인증메일이 재발송 되었습니다');
		e.stopPropagation();
	};
	
	/**
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialLogin-'+eachService.socialName).attr('href', eachService.authUrl);
		}

		$('#findIdResult').show().siblings('div').hide();
	};
}