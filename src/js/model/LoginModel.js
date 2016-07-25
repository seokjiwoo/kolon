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
		/*if (Cookies.getJSON(COOKIE_NAME) == undefined) {
			loginFlag = false;
			loginData = null;
		} else {
			loginFlag = true;
			loginData = Cookies.getJSON(COOKIE_NAME);
		}*/

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
		loginFlag = true;

		var imageUrl = null;
		if (data.myInfo.imageUrl != null) imageUrl = data.myInfo.imageUrl;
		
		loginData = {
			stateCode: data.myInfo.memberStateCode,
			memberName: data.myInfo.memberName,
			email: data.myInfo.email,
			phone: data.myInfo.cellPhoneNumber,
			joinSectionCode: data.myInfo.joinSectionCode,
			savingPoint: data.myInfo.savingPoint,
			emailAuthYn: data.myInfo.emailAuthYn,
			imageUrl: imageUrl,
			myMenu: data.myMenu,
			myActivity: data.myActivity,
		};
	};

	function removeLoginInfo() {
		loginFlag = false;
		loginData = null;
	};
}

