/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();

	var controller = require('../../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	$(controller).on('resendAuthNumberResult', resendAuthNumberHandler);
	$(controller).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	var memberInfoController = require('../../controller/MemberInfoController');
	$(memberInfoController).on('termsListResult', termsListHandler);
	$(memberInfoController).on('termsResult', termsContentHandler);
	var util = require('../../utils/Util.js');

	var enteredId;
	var authNumberResendFlag = false;
	var forceLoginFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		controller.getSocialLoginUrl();
		memberInfoController.getMemberTermsList();
		
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		$('#loginForm').submit(loginHandler);
	};
	
	
	/**
	 * 회원 이용약관 목록 핸들링
	 */
	function termsListHandler(e, termsList) {
		for (var key in termsList) {
			var eachTerms = termsList[key];
			switch(eachTerms.termsTypeCode) {
				case 'DP_TERMS_TYPE_01':
					$('#popAgree01').data('termsNumber', eachTerms.termsNumber);
					break;
				case 'DP_TERMS_TYPE_04':
					$('#popAgree02').data('termsNumber', eachTerms.termsNumber);
					break;
			}
		}
	};

	/**
	 * 회원 이용약관 본문 요청
	 */
	function getTermsContent(e) {
		memberInfoController.getMemberTermsContent($(this).data('termsNumber'));
	};
	
	/**
	 * 회원 이용약관 본문 핸들링
	 */
	function termsContentHandler(e, term) {
		Super.Super.messagePopup(term.termsName, term.termsName, term.termsContents, 590, 'popEdge');
	};
	
	/**
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialLogin-'+eachService.socialName).attr('href', eachService.authUrl);

			initSocialLoginPopupButton();
		}
	};

	/**
	 * 로그인 or 회원가입 요청
	 */
	function loginHandler(e) {
		e.preventDefault();

		var id = $.trim($('#inputName').val());
		var pw = $.trim($('#inputPW').val());
		var keepLogin = $('#saveInfo').prop('checked') ? 'Y' : 'N';

		if (id == '' || pw == '') {
			Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', '올바른 아이디와 비밀번호를 입력해주세요.', '확인');
		} else {
			if (util.checkValidMobileNumber(id)) {
				// 휴대폰 번호
				enteredId = id;
				controller.login(id, pw, keepLogin);
			} else {
				// 이메일
				if (enteredId != $('#inputName').val()) forceLoginFlag = false;
				enteredId = $('#inputName').val();
				
				if (util.checkVaildEmail(enteredId)) {
					Mailcheck.run({
						email: enteredId,
						suggested: function(suggestion) {
							if (!forceLoginFlag) {
								forceLoginFlag = true;
								var enteredMail = enteredId.split('@');
								Super.Super.alertPopup('메일 주소를 다시 확인해 주세요.', '입력하신 메일 주소가 혹시 '+enteredMail[0]+'@<strong>'+suggestion.domain+'</strong> 아닌가요?', '확인');
							} else {
								controller.login(enteredId, pw, keepLogin);
							}
						},
						empty: function() {
							controller.login(enteredId, pw, keepLogin);
						}
					});
				} else {
					Super.Super.alertPopup('비밀번호 찾기', '아이디(이메일 또는 휴대폰 번호)를 정확하게 입력해주세요.', '확인');
				}
			}
		}
		
		e.stopPropagation();
	};

	/**
	 * 소셜로그인 시스템팝업 버튼 초기화
	 */
	function initSocialLoginPopupButton() {
		$('.loginSns').click(function(e) {
			e.preventDefault();
			
			window.open($(this).attr('href'), 'socialLoginPopup', 'width=600,height=550,menubar=no,status=no,toolbar=no,resizable=yes,fullscreen=no')

			e.stopPropagation();
		});

		$(document).on('getSocialLoginResult', socialLoginResultHandler);
	}

	/**
	 * 소셜로그인 결과 핸들링
	 */
	function socialLoginResultHandler(e, data) {
		console.log('SOCIAL LOGIN RESULT HANDLER>');
		console.log(data);
		loginCompleteHandler(null, 200, data);
	};
	
	/**
	 * 로그인 or 회원가입 완료 이벤트 핸들링
	 */
	function loginCompleteHandler(e, status, response) {
		var keepLogin = $('#saveInfo').prop('checked') ? 'Y' : 'N';

		switch(status) {
			case 200:
				switch(Number(response.status)) {
					case 200:	// 로그인 성공
						location.href = '/';
						break;
					case 201:	// 회원가입 완료
						Super.Super.alertPopup('회원가입이 완료되었습니다.', '메인화면으로 이동합니다.', '확인', function() {
							var id = $.trim($('#inputName').val());
							var pw = $.trim($('#inputPW').val());
							controller.login(id, pw, keepLogin);
						});
						break;
				}
				break;
			case 400:
				switch(Number(response.errorCode)) {
					case 1606:	// ID/PW
						Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
						break;
					case 1901:	// 모바일 인증번호
						alert(response.message);
					case 1900:	// 모바일 가입 인증 요구
						Super.Super.htmlPopup('../../_popup/popAuthorizeMobile.html', 590, 'popEdge', {
							onOpen: function() {
								$('#mobileAuthNumber').val('');
								$('#sendedPhoneNumber').text(util.mobileNumberFormat(enteredId));
								$('#resendButton').click(function(e) {
									authNumberResendFlag = true;
									controller.resendAuthNumber(enteredId);
								});

								controller.resendAuthNumber(enteredId);
								authNumberResendFlag = false;
							},
							onSubmit: function() {
								controller.login(enteredId, $('#inputPW').val(), keepLogin, $('#mobileAuthNumber').val());
							}
						});
						break;
				}
				break;
			default:
				Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
				break;
		}
	};

	/**
	 * 인증번호 재발송 이벤트 핸들링
	 */
	function resendAuthNumberHandler(e, status, response) {
		switch(status) {
			case 200:
				if (authNumberResendFlag) alert(response.message);
				$('#mobileAuthNumber').val('');
				break;
			default:
				if (authNumberResendFlag) alert(response.message);
				break;
		}
	};
}