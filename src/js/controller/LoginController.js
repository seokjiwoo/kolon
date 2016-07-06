/* global $ */

module.exports = ClassLoginController().getInstance();

function ClassLoginController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	var model = require('../model/LoginModel');
	
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
		if (keepLogin == undefined) loginPostObj.keepLogin = 'N';

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

	/**
	 * 내 정보 갱신
	 */
	function refreshMyInfo() {
		Super.callApi('/apis/me', 'GET', {}, function(status, result) {
			if (status == 200) {
				model.setLoginInfo(result.data.data);
			} else {
				Super.handleError('login/myData', status);
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
		// 
	}
	
	/**
	 * 로그아웃
	 */
	function logout() {
		Super.callApi('/apis/user/logout', 'GET', {}, function(status, result) {
			if (status == 200 || status == 0) {
				model.removeLoginInfo();
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
	
	/*
	SNS 계정 로그인 결과	 GET 	  /apis/member/socials/{socialType}/login
	*/
}

