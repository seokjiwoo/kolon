/* global $ */

module.exports = ClassLoginModel().getInstance();

function ClassLoginModel() {
	var COOKIE_NAME = 'cmonloginfo';

	var instance;
	var callerObj;

	var loginData;
	var loginFlag;
	
	return {
		getInstance: function() {
			if (!instance) instance = LoginModel();
			return instance;
		}
	};
	
	function LoginModel() {
		if (Cookies.getJSON(COOKIE_NAME) == undefined) {
			loginFlag = false;
			loginData = null;
		} else {
			loginFlag = true;
			loginData = Cookies.getJSON(COOKIE_NAME);
		}

		callerObj = {
			loginFlag: function() { return loginFlag; },
			loginData: function() { return loginData; },
			/**
			 * 로그인 정보 설정
			 */
			setLoginInfo: setLoginInfo,
			/**
			 * 로그인 정보 삭제
			 */
			removeLoginInfo: removeLoginInfo
		}
		
		return callerObj;	
	};
	
	function setLoginInfo(data) {
		var imageUrl = null;
		if (data.memberImages != null) imageUrl = data.memberImages.imageUrl;
		
		Cookies.set(COOKIE_NAME, {
			memberNumber: data.memberNumber,
			stateCode: data.memberStateCode,
			nickName: data.nickName,
			email: data.email,
			imageUrl: imageUrl
		});
	};

	function removeLoginInfo() {
		Cookies.remove(COOKIE_NAME);
	};
}

