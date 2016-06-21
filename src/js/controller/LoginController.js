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
			logout: logout
		}
		
		return callerObj;	
	};
	
	/**
	 * 로그인 or 회원가입
	 * 서버에서 아이디가 있으면 로그인, 없으면 회원가입 처리.
	 */
	function login(id, pw) {
		Super.callApi('/apis/user/login', 'POST', {
			"loginId": id,
			"loginPassword": pw
		}, function(status, result) {
			if (status == 200) {
				Super.callApi('/apis/me', 'GET', {}, function(status, result) {
					if (status == 200) {
						switch(result.status) {
							case '200':
								// 로그인 성공
								model.setLoginInfo(result.data.data.myInfo);
								break;
							case '201':
								// 회원가입 성공
								alert('회원가입 성공');
								break;
						}
					} else {
						Super.handleError('login/myData', status);
					}
					$(callerObj).trigger('loginResult', [status, result]);
				});
			} else {
				Super.handleError('login', result);
				$(callerObj).trigger('loginResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 로그아웃
	 */
	function logout() {
		Super.callApi('/apis/user/logout', 'GET', {}, function(status, result) {
			if (status == 200) {
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
		Super.callApi('/apis/member/socials/authLoginUrl', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('socialLoginUrlResult', [200, result.data.socialAuthLoginUrl]);
			} else {
				Super.handleError('getSocialLoginUrl', result);
			}
		}, true);
	};
	
	/*
	SNS 계정 로그인 결과	 GET 	  /apis/member/socials/{socialType}/login
	*/
}

