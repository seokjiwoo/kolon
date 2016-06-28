/* global $ */

module.exports = ClassMemberInfoController().getInstance();

function ClassMemberInfoController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	var tempMemberNumber;
	var tempAuthKey;
	
	return {
		getInstance: function() {
			if (!instance) instance = MemberInfoController();
			return instance;
		}
	};
	
	function MemberInfoController() {
		callerObj = {
			/**
			 * 회원가입 약관 목록 받아오기
			 */
			getMemberTermsList: getMemberTermsList,
			/**
			 * 회원가입 약관 본문 받아오기
			 */
			getMemberTermsContent: getMemberTermsContent,
			/**
			 * 이메일 중복 체크
			 */
			checkEmail: checkEmail,
			/**
			 * 회원정보 수정
			 */
			editMemberInfo: editMemberInfo,
			/**
			 * 아이디 찾기
			 */
			findId: findId,
			/**
			 * 비밀번호 찾기 (이메일)
			 */
			findPasswordByMail: findPasswordByMail,
			/**
			 * 비밀번호 찾기 (휴대폰)
			 */
			findPasswordByPhone: findPasswordByPhone,
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
			resetPassword: resetPassword,
			/**
			 * 내 정보 받아오기
			 */
			getMyInfo: getMyInfo
		}
		
		return callerObj;	
	};
	
	/**
	 * 약관 목록 받아오기
	 */
	function getMemberTermsList() {
		Super.callApi('/apis/member/terms', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('termsListResult', [result.data.memberTerms]);
			} else {
				Super.handleError('getMemberTermsList', result);
			}
		}, true);
	};
	
	/**
	 * 약관 본문 받아오기
	 */
	function getMemberTermsContent(termsNumber) {
		Super.callApi('/apis/member/terms/'+termsNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('termsResult', [result.data.memberTerm]);
			} else {
				Super.handleError('getMemberTermsContent', result);
			}
		}, false);
	};
	
	/**
	 * 회원정보 변경 
	 */
	function editMemberInfo(name, birthDate, phone, agreeMail, agreeSms) {
		Super.callApi('/apis/member', 'PUT', {
			"birthDate": birthDate,
			"emailReceiveYn": agreeMail,
			"generalPhoneNumber": phone,
			"memberName": name,
			"smsReceiveYn": agreeSms
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('editMemberInfoResult', [status, result]);
			} else {
				Super.handleError('editMemberInfo', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 변경
	 */
	function changePassword(currentPassword, newPassword) {
		var memberNumber = 0;
		
		Super.callApi('/apis/member/changePassword', 'PUT', {
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
				Super.handleError('changePassword', result);
			}
		}, false);
	};
	
	/**
	 * 이메일 중복 체크
	 */
	function checkEmail(id) {
		Super.callApi('/apis/member/checkEmail', 'POST', {
			"loginId": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('checkEmailResult', [status, result]);
			} else {
				Super.handleError('checkEmail', result);
				$(callerObj).trigger('checkEmailResult', [status, result]);
			}
		}, true);
	};
	
	/**
	 * 아이디 찾기
	 */
	function findId(name, phone) {
		Super.callApi('/apis/member/findId', 'POST', {
			"cellPhoneNumber": phone,
			"memberName": name
		}, function(status, result) {
			if (status == '200') {
				$(callerObj).trigger('findIdResult', [result, name, phone]);
			} else {
				Super.handleError('findId', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 (이메일)
	 */
	function findPasswordByMail(id) {
		Super.callApi('/apis/authorize/find/email', 'POST', {
			"email": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('findPwResult', [result, id]);
			} else {
				Super.handleError('findPasswordByMail', result);
				$(callerObj).trigger('findPwResult', [result]);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 (휴대폰)
	 */
	function findPasswordByPhone(id) {
		Super.callApi('/apis/authorize/find/email', 'POST', {
			"phoneNumber": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('findPwResult', [result, id]);
			} else {
				Super.handleError('findPasswordByPhone', result);
				$(callerObj).trigger('findPwResult', [result]);
			}
		}, false);
	};
	

	
	/**
	 * 비밀번호 찾기 - 휴대폰 인증문자 보내기
	 */
	function authorizePhoneRequest(phone, name) {
		Super.callApi('/apis/member/authorize/phone', 'POST', {
			"authSectionCode": "BM_AUTH_SECTION_01",
			"cellPhoneNumber": phone,
			"memberName": name
		}, function(status, result) {
			if (status == 200) {
				console.log('> '+result.data.phoneAuthNumber);	// 임시코드. 실제 서비스에선 이게 날아오면 안 됨.
				
				tempMemberNumber = result.data.memberAuthorizePhone.memberNumber;
				tempAuthKey = result.data.memberAuthorizePhone.authKey;		// 이건 phone/confirm에서 날아와야 하는 거 아닌가?
				
				$(callerObj).trigger('authorizePhoneRequestResult', [result, id]);
			} else {
				Super.handleError('authorizePhoneRequest', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 - 휴대폰 인증문자 확인
	 */
	function authorizePhoneConfirm(authNumber) {
		Super.callApi('/apis/member/authorize/phone/confirm', 'POST', {
			"authNumber": authNumber,
			"memberNumber": tempMemberNumber
		}, function(status, result) {
			if (status == 200) {
				// tempAuthKey는 여기서 저장해야 할 거 같은데...
				
				$(callerObj).trigger('authorizePhoneConfirmResult', [result, tempAuthKey]);
			} else {
				Super.handleError('authorizePhoneConfirm', result);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 - 이메일 인증 요청
	 */
	function authorizeEmailRequest(email) {
		Super.callApi('/apis/member/authorize/email', 'POST', {
			"email": email
		}, function(status, result) {
			if (status == 200) {
				/* {
					"errorCode": "string",
					"message": "string",
					"status": "string"
				} */
			} else {
				Super.handleError('authorizePhoneConfirm', result);
			}
		}, false);
	};

	/**
	 * 내 정보 받아오기
	 */
	function getMyInfo() {
		Super.callApi('/apis/me', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myInfoResult', [result.data.data.myInfo]);
			} else {
				Super.handleError('getMyInfo', result);
			}
		}, false);
	};
	
	
	/**
	 * 비밀번호 재설정
	 */
	function resetPassword(authKey, newPassword) {
		var memberNumber = 0;
		
		Super.callApi('/apis/member/resetPassword', 'PUT', {
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
				Super.handleError('resetPassword', result);
			}
		}, false);
	};
	
	/**
	 * 회원탈퇴
	 */
	function deleteMember(reasonCode, reasonStatement, modifyId) {
		Super.callApi('/apis/member', 'DELETE', {
			"leaveReasonCode": reasonCode,
			"leaveReasonStatement": reasonStatement,
			"modifyId": modifyId
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('joinResult', [200, result.status]);
			} else {
				Super.handleError('join', result);
			}
		}, false);
	};
	
	/*
	휴면 계정 활성화		 POST		/apis/member/reuse
	SNS 계정 연결 해제	  DELETE	 /apis/member/socials/{socialType}
	SNS 계정 연결 			POST	   /apis/member/socials/{socialType} 
	*/
}

