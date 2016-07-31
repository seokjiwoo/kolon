/* global $ */

module.exports = function() {


	var win = window,
	$ = win.jQuery,
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	ALERTPOPUP_EVENT = events.ALERT_POPUP,
	RECAPTCHA_EVENT = events.RECAPTCHA;


	var SuperClass = require('../Page.js');
	var Super = SuperClass();

	var controller = require('../../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	$(controller).on('resendAuthNumberResult', resendAuthNumberHandler);
	$(controller).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	$(controller).on('notarobotResult', onRecaptchaHandler);
	$(controller).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');

	var memberInfoController = require('../../controller/MemberInfoController');
	$(memberInfoController).on('termsListResult', termsListHandler);
	$(memberInfoController).on('termsResult', termsContentHandler);
	var util = require('../../utils/Util.js');

	var enteredId;
	var authNumberResendFlag = false;
	var firstTryFlag = true;		// 페이지 열리고 첫 시도인지 체크 (휴대전화로 가입시도 후 페이지 새로고침 했을 때 이전 세션 때문에 인증번호 틀림 에러코드 돌아오는 문제 때문에...)
	
	// recaptcha widget ID
	var recaptchaWidget,
	recaptchaData;

	var mobileAuthIntervalId;
	var callBackUrl;

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

		if (util.getUrlVar('callbackUrl') != undefined) {
			callBackUrl = decodeURIComponent(util.getUrlVar('callbackUrl'));
		} else {
			callBackUrl = '/';
		}
		
		$('#inputName').change(checkEmailField);
		$('#inputPW').change(checkPasswordField);
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		$('#loginForm').submit(loginHandler);
	};
	
	function myInfoResultHandler() {
		var loginData = loginDataModel.loginData();
		
		if (loginData != null) {
			alert('이미 로그인되어 있습니다');
			location.href = callBackUrl;
		}
	}
	
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
		Super.Super.messagePopup(term.termsName, term.termsContents, '100%', 'popEdge');
	};
	
	/**
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialLogin-'+eachService.socialName).attr({
				'href' : eachService.authUrl,
				'target' : '_blank'
			});
			// $('#socialLogin-'+eachService.socialName).attr('href', eachService.authUrl);
			// initSocialLoginPopupButton();
		}
	};
	
	/**
	 * 이메일 필드 검사
	 */
	function checkEmailField(e) {
		var inputValue = $.trim($('#inputName').val());

		if (util.checkValidMobileNumber(inputValue)) {
			$('#idAlert').text('');
		} else if (util.checkVaildEmail(inputValue) == false) {
			$('#idAlert').text('이메일 주소를 정확하게 입력해주세요.');
		} else {
			Mailcheck.run({
				email: inputValue,
				suggested: function(suggestion) {
					var enteredMail = inputValue.split('@');
					$('#idAlert').html('입력하신 메일 주소가 혹시 '+enteredMail[0]+'@<strong>'+suggestion.domain+'</strong> 아닌가요?');
				},
				empty: function() {
					$('#idAlert').text('');
				}
			});
		}
	};
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue = $('#inputPW').val();
		/*
		if (!util.checkValidPassword(inputValue)) {
			$('#pwAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#pwAlert').text('');
		}*/
	};

	/**
	 * 로그인 or 회원가입 요청
	 */
	function loginHandler(e) {
		e.preventDefault();

		var id = $.trim($('#inputName').val());
		var pw = $.trim($('#inputPW').val());
		var keepLogin = $('#saveInfoBox').hasClass('on') ? 'Y' : 'N';

		if (id == '') { 
			$('#idAlert').text('아이디(이메일 또는 휴대폰 번호)를 입력해주세요.');
			Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', '아이디(이메일 또는 휴대폰 번호)를 입력해주세요', '확인');
		} else if(pw == '') {
			$('#pwAlert').text('비밀번호를 입력해 주세요.');
			Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', '비밀번호를 입력해 주세요', '확인');
		} else {
			if (util.checkValidMobileNumber(id)) {
				// 휴대폰 번호
				enteredId = id;
				firstTryFlag = true;
				controller.login(id, pw, keepLogin);
			} else {
				// 이메일
				enteredId = $('#inputName').val();
				if (util.checkVaildEmail(enteredId)) {
					controller.login(enteredId, pw, keepLogin);
				} else {
					$('#idAlert').text('아이디(이메일 또는 휴대폰 번호)를 입력해주세요.');
					Super.Super.alertPopup('비밀번호 찾기', '아이디(이메일 또는 휴대폰 번호)를 정확하게 입력해주세요.', '확인');
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
	};
	
	/**
	 * 로그인 or 회원가입 완료 이벤트 핸들링
	 */
	function loginCompleteHandler(e, status, response) {
		var keepLogin = $('#saveInfoBox').hasClass('on') ? 'Y' : 'N';

		status = parseInt(status, 10);

		switch(status) {
			case 200:
			case 201:
				switch(Number(response.status)) {
					case 200:	// 로그인 성공
						// location.href = util.getReferrer() || '/';
						location.href = callBackUrl;
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
					default:
						Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
						break;
					case 1901:	// 모바일 인증번호
						if (!firstTryFlag) alert(response.message);
					case 1900:	// 모바일 가입 인증 요구
						Super.Super.htmlPopup('../../_popup/popAuthorizeMobile.html', '100%', 'popEdge', {
							onOpen: function() {
								$('#mobileAuthNumber').val('');
								$('#sendedPhoneNumber').text(util.mobileNumberFormat(enteredId));
								$('#resendButton').click(function(e) {
									authNumberResendFlag = true;
									controller.resendAuthNumber(enteredId);
								});

								controller.resendAuthNumber(enteredId);
								authNumberResendFlag = false;

								$('#remainTimeField').data().remainTime = 181;

								mobileAuthIntervalId = setInterval(function(){
									var time = $('#remainTimeField').data().remainTime-1;
									$('#remainTimeField').data().remainTime = Math.max(0, time);
									$('#remainTimeField').text(Math.floor(time/60)+':'+(time%60<10 ? '0'+(time%60) : time%60));
								}, 1000);
							},
							onSubmit: function() {
								if ($.trim($('#mobileAuthNumber').val()) == '') {
									alert('휴대전화로 전송된 인증번호를 입력해 주세요.');
								} else {
									controller.login(enteredId, $('#inputPW').val(), keepLogin, $('#mobileAuthNumber').val());
								}
							}
						});
						firstTryFlag = false;
						break;
				}
				break;
			case 401:
				switch(Number(response.errorCode)) {
					case 1613:	// 휴면계정
						Cookies.set('accountReuse', $('#inputName').val(), { expires: 1/1440 });	// 1 minutes
						location.href = '/member/accountReuse.html';
						break;
					case 1614: 	// recaptcha 설정
						eventManager.trigger(
							ALERTPOPUP_EVENT.OPEN,
							[
								'로그인/회원가입이 제한되었습니다.',
								'정보보호 및 스팸 방지를 위하여 아래의 \'로봇이 아닙니다\'를 클릭해주세요.',
								'확인'
							]
						);
						controller.notarobot();
						break;
					default:
						Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
						break;
				}
				break;
			default:
				Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
				break;
		}
	};

	function onRecaptchaHandler(e, status, response) {
		recaptchaData = response.data;
		setRecaptcha();
	}

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

	// recaptcha 설정
	function setRecaptcha() {
		if (recaptchaWidget && win.grecaptcha) {
			win.grecaptcha.reset(recaptchaWidget);
			return;
		}

		if ('undefined' === typeof win.VX) {
			win.VX = {};
		}

		var NS = win.VX,
		tag;

		NS.G_RECAPTCHA = {
			CALL_BACK : function() {
				eventManager.triggerHandler(RECAPTCHA_EVENT.CALL_BACK);
			}
		};

		win.VX_G_RECAPTCHA_CALL_BACK = VX.G_RECAPTCHA.CALL_BACK;

		eventManager.on(RECAPTCHA_EVENT.CALL_BACK, function() {
			if (recaptchaWidget) {
				return;
			}
			win.grecaptcha.VX_RECAPTCHA_DATA = recaptchaData.recaptcha;
			recaptchaWidget = win.grecaptcha.render('vxrecaptcha', {
				'sitekey' : '6Le4NyUTAAAAAB8tcMLMcftsItykhlcIBq4vtMhq',
				'size' : 'normal',
				'theme' : 'light'
			});
		});

		$.getScript('//www.google.com/recaptcha/api.js', function() {
			if (win.grecaptcha) {
				win.VX_G_RECAPTCHA_CALL_BACK();
			} else {
				readyReCaptcha();
			}
		});

		// tag = $('<script></script>');
		// tag.attr('src', 'https://www.google.com/recaptcha/api.js?onload=VX_G_RECAPTCHA_CALL_BACK&render=explicit');
		// $('head').append(tag);
 
	}

	function readyReCaptcha() {
		if (win.grecaptcha) {
			win.VX_G_RECAPTCHA_CALL_BACK();
		} else {
			setTimeout(readyReCaptcha, 10);
		}
	}
}