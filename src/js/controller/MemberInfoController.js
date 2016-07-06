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
			getMyInfo: getMyInfo,
			/**
			 * 회원탈퇴
			 */
			deleteMember: deleteMember
		}
		
		return callerObj;	
	};
	
	/**
	 * 약관 목록 받아오기
	 */
	function getMemberTermsList() {
		Super.callApi('/apis/terms?termsSectionCode=DP_TERMS_SECTION_02', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('termsListResult', [result.data.terms]);
			} else {
				Super.handleError('getMemberTermsList', result);
			}
		}, true);
	};
	
	/**
	 * 약관 본문 받아오기
	 */
	function getMemberTermsContent(termsNumber) {
		Super.callApi('/apis/terms/'+termsNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('termsResult', [result.data.term]);
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
	 * 비밀번호 찾기 (이메일)
	 */
	function findPasswordByMail(id) {
		Super.callApi('/apis/authorize/find/email', 'POST', {
			"email": id
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('findPwResult', [status, result]);
			} else {
				Super.handleError('findPasswordByMail', result);
				$(callerObj).trigger('findPwResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 비밀번호 찾기 (휴대폰)
	 */
	function findPasswordByPhone(id) {
		Super.callApi('/apis/authorize/vertify?type=PASSWORD&phoneNumber='+id, 'GET', {}, function(status, result) {
			if (status == 200) {
				openKMCISWindow(result.data.identityUrl);
				//$(callerObj).trigger('findPwResult', [status, result]);
			} else {
				Super.handleError('findPasswordByPhone', result);
				$(callerObj).trigger('findPwResult', [status, result]);
			}
		}, false);
	};

	/**
	 * 휴대폰 본인인증 팝업 오픈 (한국모바일인증)
	 */
	function openKMCISWindow(certInformation) {
		if ( $('#reqKMCISForm').length != 0 ) $('#reqKMCISForm').remove();
		$('body').append('<form id="reqKMCISForm" name="reqKMCISForm" method="post" action="'+certInformation.reqUrl+'"><input type="hidden" name="tr_cert" id="tr_cert" value = "'+certInformation.trCert+'"><input type="hidden" name="tr_url" id="tr_url" value = "'+certInformation.trUrl+'"></form>');
		var UserAgent = navigator.userAgent;
		
		if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
			// 모바일일 경우 (변동사항 있을경우 추가 필요)
			$('#reqKMCISForm').attr('target', '');
		} else {
			// 모바일이 아닐 경우
			KMCIS_window = window.open('', 'KMCISWindow', 'width=425, height=550, resizable=0, scrollbars=no, status=0, titlebar=0, toolbar=0, left=435, top=250' );
			if (KMCIS_window == null) {
				alert(" ※ 화면 상단에 있는 팝업 차단 알림줄을 클릭하여 팝업을 허용해 주시기 바랍니다. \n\n※ 그 외의 브라우저의 팝업차단 기능을 사용하는 경우 팝업허용을 해주시기 바랍니다.");
			}   
			$('#reqKMCISForm').attr('target', 'KMCISWindow');
		}  
		
		$('#reqKMCISForm').submit();
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
	function deleteMember(reasonCodes, reasonStatement) {
		Super.callApi('/apis/member', 'DELETE', {
			"deleteAgreeYn": "Y",
			"leaveAgreeYn": "Y",
			"leaveReasonCodes": reasonCodes,
			"leaveReasonStatement": reasonStatement
		}, function(status, result) {
			if (status == 200) {
			} else {
				Super.handleError('deleteMember', result);
			}
			$(callerObj).trigger('deleteMemberResult', [status, result]);
		}, false);
	};
}

