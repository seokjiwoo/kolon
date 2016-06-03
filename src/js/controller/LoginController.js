/* global $ */

module.exports = ClassLoginController().getInstance();

function ClassLoginController() {
	var API_URL = 'http://uppp.oneplat.co/';
	var CDN_URL = 'http://cdn.oneplat.co/';
	
	var instance;
	var callerObj;
	
	var Model = require('../model/LoginModel');
	
	var model;
	
	var loadingFlag = false;
	
	return {
		getInstance: function() {
			if (!instance) instance = LoginController();
			return instance;
		}
	};
	
	function LoginController() {
		model = Model().init();
		$.ajaxSetup({
			type: "POST"
		});
		
		callerObj = {
			/**
			 * 소셜 로그인 URL 목록 요청
			 */
			getSocialLoginUrl: getSocialLoginUrl,
			/**
			 * 로그인 POST
			 * @param {String} id - user id
			 * @param {String} pw - user password
			 */
			login: login,
			/**
			 * 이메일 중복 체크
			 */
			checkEmail: checkEmail,
			/**
			 * 회원가입
			 */
			joinMember: joinMember,
			/**
			 * 회원정보 수정
			 */
			editMemberInfo: editMemberInfo,
			/**
			 * 아이디 찾기
			 */
			findId: findId,
			/**
			 * 비밀번호 찾기
			 */
			findPassword: findPassword,
			/**
			 * 비밀번호 찾기 - 휴대폰 인증문자 보내기
			 */
			authorizePhoneRequest: authorizePhoneRequest,
			/**
			 * 비밀번호 찾기 - 휴대폰 인증문자 확인
			 */
			authorizePhoneConfirm: authorizePhoneConfirm,
			/**
			 * 비밀번호 찾기 - 이메일 인증 요청
			 */
			authorizeEmailRequest: authorizeEmailRequest,
			/**
			 * 비밀번호 변경
			 */
			changePassword: changePassword,
			/**
			 * 비밀번호 설정
			 */
			resetPassword: resetPassword
		}
		
		return callerObj;	
	}
	
	/**
	 * 로그인 POST
	 */
	function login(id, pw) {
		callApi(API_URL+'/apis/user/login', 'POST', {
			"loginId": id,
			"loginPassword": pw
		}, function(status, result) {
			if (status == 200) {
				// make cookie
				$(callerObj).trigger('loginResult', [200]);
			} else {
				handleError('login', result);
				$(callerObj).trigger('loginResult', [result.status]);
			}
		}, false);
	};
	
	/**
	 * 소셜 로그인 URL 목록
	 */
	function getSocialLoginUrl() {
		callApi(API_URL+'/apis/member/socials/authLoginUrl', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('socialLoginUrlResult', [200, result.data.socialAuthLoginUrl]);
			} else {
				handleError('authLoginUrl', result);
			}
		}, false);
	};
	
	/**
	 * 회원가입 
	 */
	function joinMember(id, pw, name, phone, birthdate) {
		callApi(API_URL+'/apis/member', 'POST', {
			"birthDate": birthdate,
			"cellPhoneNumber": phone,
			"loginId": id,
			"loginPassword": pw,
			"memberName": name,
			"memberTerms": [
				{
					"termsNumber": 1
				}
			]
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('joinResult', [200, result.status]);
			} else {
				handleError('join', result);
			}
		}, true);
	};
	
	/**
	 * 회원정보 수정 
	 */
	function editMemberInfo(id, pw, name, phone, birthdate) {
		callApi(API_URL+'/apis/member', 'PUT', {
			"birthDate": birthdate,
			"cellPhoneNumber": phone,
			"loginId": id,
			"loginPassword": pw,
			"memberName": name,
			"memberTerms": [
				{
					"termsNumber": 2
				}
			]
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('joinResult', [200, result.status]);
			} else {
				handleError('join', result);
			}
		}, true);
	};
	
	/**
	 * 이메일 중복 체크
	 */
	function checkEmail(id) {
		callApi(API_URL+'/apis/member/checkEmail', 'POST', {
			"loginId": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('checkEmailResult', [200, result.status, result.message]);
			} else {
				handleError('checkEmail', result);
			}
		}, true);
	};
	
	/**
	 * 아이디 찾기
	 */
	function findId(name, phone) {
		callApi(API_URL+'/apis/member/findId', 'POST', {
			"cellPhoneNumber": phone,
			"memberName": name
		}, function(status, result) {
			if (status == '200') {
				$(callerObj).trigger('findIdResult', [result, name, phone]);
				/* {
					"errorCode": "string",
					"member": {
						"site": {
						"createDateTime": "string",
						"email": "string"
						},
						"socials": [
						{
							"createDateTime": "string",
							"endDateTime": "string",
							"joinStatus": "string",
							"memberNumber": 0,
							"socialEmail": "string",
							"socialName": "string",
							"socialNumber": 0,
							"socialSectionCode": "string",
							"socialUniqueId": "string"
						}
						]
					},
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('findId', result);
			}
		}, false);
	}
	
	/**
	 * 비밀번호 찾기
	 */
	function findPassword(id) {
		callApi(API_URL+'/apis/member/findPassword', 'POST', {
			"loginId": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('findPwResult', [result, id]);
			} else {
				handleError('findPassword', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 - 휴대폰 인증문자 보내기
	 */
	function authorizePhoneRequest(phone, name, verificationCode) {
		callApi(API_URL+'/apis/member/authorize/phone', 'POST', {
			"cellPhoneNumber": phone,
			"memberName": name,
			"verificationCode": verificationCode
		}, function(status, result) {
			if (status == 200) {
				/* {
					"authorize": {
						"authKey": "string",
						"expiredTime": "string"
					},
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('authorizePhoneRequest', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 - 휴대폰 인증문자 확인
	 */
	function authorizePhoneConfirm(authNumber) {
		callApi(API_URL+'/apis/member/authorize/phone/confirm', 'POST', {
			"authNumber": authNumber
		}, function(status, result) {
			if (status == 200) {
				/* {
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('authorizePhoneConfirm', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 - 이메일 인증 요청
	 */
	function authorizeEmailRequest(email) {
		callApi(API_URL+'/apis/member/authorize/email', 'POST', {
			"email": email
		}, function(status, result) {
			if (status == 200) {
				/* {
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('authorizePhoneConfirm', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 변경
	 */
	function changePassword(currentPassword, newPassword) {
		var memberNumber = 0;
		
		callApi(API_URL+'/apis/member/changePassword', 'PUT', {
			"currentPassword": currentPassword,
			"memberNumber": memberNumber,
			"newPassword": newPassword
		}, function(status, result) {
			if (status == 200) {
				/* {
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('changePassword', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 설정
	 */
	function resetPassword(authKey, newPassword) {
		var memberNumber = 0;
		
		callApi(API_URL+'/apis/member/resetPassword', 'PUT', {
			"authKey": authKey,
			"memberNumber": memberNumber,
			"newPassword": newPassword
		}, function(status, result) {
			if (status == 200) {
				/* {
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				handleError('resetPassword', result);
			}
		}, true);
	};
	
	/**
	 * 회원탈퇴
	 */
	function join(reasonCode, reasonStatement, modifyId) {
		callApi(API_URL+'/apis/member', 'DELETE', {
			"leaveReasonCode": reasonCode,
			"leaveReasonStatement": reasonStatement,
			"modifyId": modifyId
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('joinResult', [200, result.status]);
			} else {
				handleError('join', result);
			}
		}, true);
	};
	
	/*
	SNS 계정 연결 해제	DELETE	/apis/member/socials/{socialType}
	
	약관 목록	GET	/apis/member/terms
	약관 상세	GET	/apis/member/terms/{termsNumber}
	휴면 계정 활성화	POST	/apis/member/reuse
	*/
	
	/**
	 * Request AJAX call
	 */
	function callApi(url, method, data, callback, forceFlag) {
		if (loadingFlag == false || forceFlag == true) {
			loadingFlag = true;
			var ajaxOptions;
			if (method == 'GET') {
				ajaxOptions = {
					url: url,
					method: method
				}
			} else {
				ajaxOptions = {
					url: url,
					method: method,
					data: JSON.stringify(data),
					contentType: "application/json"
				}
			}
			
			$.ajax(ajaxOptions).done(function(data, textStatus, jqXHR) {
				callback.call(this, jqXHR.status, data);
				loadingFlag = false;
			}).fail(function(jqXHR, textStatus, errorThrown) {
				callback.call(this, {
					status: jqXHR.status,
					message: errorThrown
				});
				loadingFlag = false;
			});
		}
	};
	
	/**
	 * Error Handler
	 */
	function handleError(callerId, result) {
		console.log('ERROR ON', callerId, result);
	};
}

