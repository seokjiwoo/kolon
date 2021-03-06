/* global $ */

module.exports = ClassLoginController().getInstance();

function ClassLoginController() {
	var debug = require('../utils/Console.js');

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	var model = require('../model/LoginModel');
	
	$(document).on('getSocialLoginResult', socialLoginResultHandler);

	var socialLoginFlag;

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	ALERTPOPUP_EVENT = events.ALERT_POPUP;
	
	return {
		getInstance: function() {
			if (!instance) instance = LoginController();
			return instance;
		}
	};
	
	function LoginController() {
		callerObj = {
			/**
			 * 소셜 로그인 URL 목록 요청
			 */
			getSocialLoginUrl: getSocialLoginUrl,
			/**
			 * 로그인
			 * @param {String} id - user id
			 * @param {String} pw - user password
			 */
			login: login,
			/**
			 * Not a robot
			 */
			notarobot: notarobot,
			/**
			 * 로그아웃
			 */
			logout: logout,
			/**
			 * 로그인 정보 갱신
			 */
			refreshMyInfo: refreshMyInfo,
			/**
			 * 비번 검증
			 */
			confirmPassword: confirmPassword,
			/**
			 * 회원가입을 위한 모바일 인증번호 재발급 요청
			 */
			resendAuthNumber: resendAuthNumber,
			/**
			 * 인증메일 재전송 요청
			 */
			resendAuthMail: resendAuthMail,
			/**
			 * 소셜 연결
			 */
			socialConnect: socialConnect,
			/**
			 * 소셜 연결 해제
			 */
			socialDisconnect: socialDisconnect,
			/**
			 * 휴면 계정 활성화
			 */
			reuseAccount: reuseAccount
		}
		
		return callerObj;	
	};
	
	/**
	 * 로그인 or 회원가입
	 * 서버에서 아이디가 있으면 로그인, 없으면 회원가입 처리.
	 */
	function login(id, pw, keepLogin, authNumber) {
		var loginPostObj = {
			"loginId": id,
			"loginPassword": pw
		}
		if (authNumber != undefined) loginPostObj.certiNumber = authNumber;
		if (keepLogin == undefined) {
			loginPostObj.keepYn = 'N';
		} else {
			loginPostObj.keepYn = keepLogin;
		}

		// recaptcha
		if (window.VX_G_RECAPTCHA_CALL_BACK && window.grecaptcha) {
			if (!window.grecaptcha.getResponse()) {
				eventManager.trigger(
					ALERTPOPUP_EVENT.OPEN,
					[
						'로그인/회원가입이 제한되었습니다.',
						'정보보호 및 스팸 방지를 위하여 아래의 \'로봇이 아닙니다\'를 클릭해주세요.',
						'확인'
					]
				);
				return;
			}
			loginPostObj.recaptcha = window.grecaptcha.VX_RECAPTCHA_DATA;
		}

		Super.callApi('/apis/user/login', 'POST', loginPostObj, function(status, result) {
			if (status == 200) {
				switch(result.status) {
					case '200':
						// 로그인 성공
						Super.callApi('/apis/me', 'GET', {}, function(status, result) {
							if (status == 200) {
								model.setLoginInfo(result.data.data);
							} else {
								Super.handleError('login/myData', status);
							}
							$(callerObj).trigger('loginResult', [status, result]);
						});
						break;
					case '201':
						// 회원가입 성공
						$(callerObj).trigger('loginResult', [status, result]);
						break;
					case '401':
						//
						break;
				}
			} else {
				Super.handleError('login', result);
				$(callerObj).trigger('loginResult', [status, result]);
			}
		}, false);
	};

	function notarobot() {
		Super.callApi('/apis/authorize/notarobot', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('notarobotResult', [status, result]);
			} else {
				Super.handleError('notarobot', result);
				$(callerObj).trigger('notarobotResult', [status, result]);
			}
		}, true);
	};
	
	/**
	 * 소셜로그인 결과 핸들링
	 * document에 trigger걸렸을 때 핸들링. trigger 함수는 html에 위치.
	 */
	function socialLoginResultHandler(e, socialData) {
		debug.log('SOCIAL LOGIN RESULT HANDLER>');
		debug.log(socialData);

		socialData.status = Number(socialData.status);

		switch(socialData.status) {
			case 200:
			case 201:
				if (model.loginData() == null) {
					// 로그인 상태가 아닐 때 - 로그인 or 회원가입
					Super.callApi('/apis/me', 'GET', {}, function(status, result) {
						if (status == 200) {
							socialLoginFlag = true;
							socialConnect(socialData.data);
						} else {
							Super.handleError('login/myData', status);
						}
						$(callerObj).trigger('loginResult', [status, result]);
					});
				} else {
					// 로그인 상태일 때 - 소셜연결
					socialLoginFlag = false;
					socialConnect(socialType, socialData.data);
				}
				break;
			default:
				$(callerObj).trigger('loginResult', [socialData.status, socialData]);
				break;
		}
	};

	function socialConnect(socialData) {
		var socialName = '';
		/* {
			memberSocial: {
				memberName: 'blah',
				socialNumber: 'blah',
				socialSectionCode: 'blah',
				socialUniqueId: 'blah',
			}
		} */
		switch(socialData.memberSocial.socialSectionCode) {
			case 'BM_SOCIAL_SECTION_01':
				socialName = 'fackbook'
				break;
			case 'BM_SOCIAL_SECTION_02':
				socialName = 'naver'
				break;
			case 'BM_SOCIAL_SECTION_03':
				socialName = 'kakao'
				break;
		}

		Super.callApi('/apis/member/socials/'+socialName, 'POST', {
			"socialEmail": '',
			"socialName": socialName,
			"socialUniqueId": socialData.memberSocial.socialUniqueId
		}, function(status, result) {
			if (status == 200) {
				if (socialLoginFlag) {
					model.setLoginInfo(result.data.data);
				} else {
					$(callerObj).trigger('socialConnectResult', [status, result, socialName]);
				}
			} else {
				Super.handleError('login/socialConnect', status);
				$(callerObj).trigger('socialConnectResult', [status, result, socialName]);
			}
		});
	}
	
	function socialDisconnect(socialType) {
		Super.callApi('/apis/member/socials/'+socialType, 'DELETE', {
			"socialName": socialType
		}, function(status, result) {
			if (status == 200) {
			} else {
				Super.handleError('socialDisconnect', result);
			}
			$(callerObj).trigger('socialDisconnectResult', [status, result, socialType]);
		}, false);
	};

	/**
	 * 내 정보 갱신
	 */
	function refreshMyInfo() {
		Super.callApi('/apis/me/simple', 'GET', {}, function(status, result) {
			if (status == 200) {
				model.setLoginInfo(result.data.data);
			} else if (status == 401) {
				model.removeLoginInfo();
			} else {
				Super.handleError('refreshMyInfo', status);
			}
			
			$(callerObj).trigger('myInfoResult', [status, result]);
		});
	}

	/**
	 * 비번 검증
	 */
	function confirmPassword(pw) {
		Super.callApi('/apis/member/confirmPassword', 'POST', {
			"password": pw
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('confirmPasswordResult', [200, result]);
			} else {
				Super.handleError('confirmPassword', result);
				$(callerObj).trigger('confirmPasswordResult', [status, result]);
			}
		}, false);
	}
	

	/**
	 * 회원가입을 위한 모바일 인증번호 재발급 요청
	 */
	function resendAuthNumber(phoneNumber) {
		Super.callApi('/apis/authorize/issue/phone', 'POST', {
			"phoneNumber": phoneNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('resendAuthNumberResult', [200, result]);
			} else {
				Super.handleError('resendAuthNumber', result);
				$(callerObj).trigger('resendAuthNumberResult', [status, result]);
			}
		}, false);
	}
	
	/**
	 * 인증메일 재전송 요청
	 */
	function resendAuthMail(mail) {
		Super.callApi('/apis/authorize/certification/email', 'GET', {
			"email": mail
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('resendAuthMailResult', [200, result]);
			} else {
				Super.handleError('resendAuthMail', result);
				$(callerObj).trigger('resendAuthMailResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 로그아웃
	 */
	function logout() {
		Super.callApi('/apis/user/logout', 'GET', {}, function(status, result) {
			if (status == 200) {
				model.removeLoginInfo();
			} else if (status == 401 || status == 0) {
				// does nothing
			} else {
				Super.handleError('logout', result);
			}
			$(callerObj).trigger('logoutResult', [status]);
		}, false);
	};
	
	/**
	 * 소셜 로그인 URL 목록
	 */
	function getSocialLoginUrl() {
		Super.callApi('/apis/user/socials/loginUrl', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('socialLoginUrlResult', [200, result.data.socialAuthLoginUrl]);
			} else {
				Super.handleError('getSocialLoginUrl', result);
			}
		}, true);
	};

	/**
	 * 휴면 계정 활성화
	 */
	function reuseAccount() {
		Super.callApi('/apis/member/reuse', 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('reuseAccountResult', [200, result]);
			} else {
				Super.handleError('reuseAccount', result);
				$(callerObj).trigger('reuseAccountResult', [status, result]);
			}
		}, false);
	}
}

