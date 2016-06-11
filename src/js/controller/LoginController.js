/* global $ */

module.exports = ClassLoginController().getInstance();

function ClassLoginController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	var Model = require('../model/LoginModel');
	var model;
	
	return {
		getInstance: function() {
			if (!instance) instance = LoginController();
			return instance;
		}
	};
	
	function LoginController() {
		model = Model().init();
		
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
			
		}
		
		return callerObj;	
	};
	
	/**
	 * 로그인
	 */
	function login(id, pw) {
		Super.callApi('/apis/user/login', 'POST', {
			"loginId": id,
			"loginPassword": pw
		}, function(status, result) {
			if (status == 200) {
				// make cookie
				$(callerObj).trigger('loginResult', [200]);
			} else {
				Super.handleError('login', result);
				$(callerObj).trigger('loginResult', [result.status]);
			}
		}, false);
	};
	
	/**
	 * 로그아웃
	 */
	function logout() {
		Super.callApi('/apis/user/logout', 'GET', {}, function(status, result) {
			if (status == 200) {
				// remove cookie
				$(callerObj).trigger('logoutResult', [200]);
			} else {
				Super.handleError('logout', result);
				$(callerObj).trigger('logoutResult', [result.status]);
			}
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

