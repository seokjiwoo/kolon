/* global $ */

module.exports = ClassMemberInfoController().getInstance();

function ClassMemberInfoController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	var tempMemberNumber;
	var tempAuthKey;

	$(document).on('getMobileAuthPasswordFindResult', mobileAuthPasswordFindResultHandler);
	$(document).on('getMobileAuthVerifyResult', mobileAuthVerifyResultHandler);
	
	return {
		getInstance: function() {
			if (!instance) instance = MemberInfoController();
			return instance;
		}
	};
	
	function MemberInfoController() {
		callerObj = {
			/**
			 * 내 정보 받아오기
			 */
			getMyInfo: getMyInfo,
			/**
			 * 회원가입 약관 목록 받아오기
			 */
			getMemberTermsList: getMemberTermsList,
			/**
			 * 회원가입 약관 본문 받아오기
			 */
			getMemberTermsContent: getMemberTermsContent,
			/**
			 * 이메일 아이디 변경
			 */
			changeEmailId: changeEmailId,
			/**
			 * 회원정보 수정
			 */
			editMemberInfo: editMemberInfo,
			/**
			 * 환불 정보 수정 요청
			 */
			refundData: refundData,
			/**
			 * 환불 정보 입력용 은행 목록 요청 
			 */
			refundBankList: refundBankList,
			/**
			 * 비밀번호 찾기 (이메일)
			 */
			findPasswordByMail: findPasswordByMail,
			/**
			 * 비밀번호 찾기 (휴대폰)
			 */
			findPasswordByPhone: findPasswordByPhone,
			/**
			 * 휴대폰 본인인증
			 */
			verifyMemberByPhone: verifyMemberByPhone,
			/**
			 * 비밀번호 변경
			 */
			changePassword: changePassword,
			/**
			 * 비밀번호 설정
			 */
			resetPassword: resetPassword,
			/**
			 * 회원탈퇴
			 */
			deleteMember: deleteMember
		}
		
		return callerObj;	
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
	 * 이메일 아이디 변경
	 */
	function changeEmailId(id, certiNumber) {
		var data = {
			"id": id
		};
		if (certiNumber != undefined) data.certiNumber = certiNumber;

		Super.callApi('/apis/member/id', 'POST', data, function(status, result) {
			if (status != 200) Super.handleError('changeEmailId', result);
			$(callerObj).trigger('changeEmailIdResult', [status, result]);
		}, false);
	};
	
	/**
	 * 비밀번호 변경
	 */
	function changePassword(currentPassword, newPassword) {
		Super.callApi('/apis/member/changePassword', 'PUT', {
			"currentPassword": currentPassword,
			"newPassword": newPassword
		}, function(status, result) {
			if (status != 200) Super.handleError('changePassword', result);
			$(callerObj).trigger('changePasswordResult', [status, result]);
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
			} else {
				Super.handleError('findPasswordByPhone', result);
				$(callerObj).trigger('findPwResult', [status, result]);
			}
		}, false);
	};

	/**
	 * 회원 실명인증 요청
	 */
	function verifyMemberByPhone(number) {
		Super.callApi('/apis/authorize/vertify?type=IDENTITY&phoneNumber='+number, 'GET', {}, function(status, result) {
			if (status == 200) {
				openKMCISWindow(result.data.identityUrl);
			} else {
				Super.handleError('verifyMemberByPhone', result);
				$(callerObj).trigger('verifyMemberResult', [status, result]);
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
	 * 휴대폰 본인인증 완료 (비번찾기) 핸들링
	 * document에 trigger걸렸을 때 핸들링. trigger 함수는 html에 위치.
	 */
	function mobileAuthPasswordFindResultHandler(e, authData) {
		if (authData.status == 200) {
			$(callerObj).trigger('findPwResult', [Number(authData.status), authData]);
		} else {
			Super.handleError('mobileAuthPasswordFindResultHandler', authData);
			$(callerObj).trigger('findPwResult', [Number(authData.status), authData]);
		}
	};

	/**
	 * 휴대폰 본인인증 완료 (실명인증) 핸들링
	 * document에 trigger걸렸을 때 핸들링. trigger 함수는 html에 위치.
	 */
	function mobileAuthVerifyResultHandler(e, authData) {
		if (authData.status == 200) {
			$(callerObj).trigger('verifyMemberResult', [Number(authData.status), authData]);
		} else {
			Super.handleError('mobileAuthVerifyResultHandler', authData);
			$(callerObj).trigger('verifyMemberResult', [Number(authData.status), authData]);
		}
	};

	/**
	 * 환불 정보 입력용 은행 목록 요청 
	 */
	function refundBankList() {
		Super.callApi('/apis/codes/bank', 'GET', {}, function(status, result) {
			if (status != 200) Super.handleError('refundBankList', result);
			$(callerObj).trigger('refundBankListResult', [status, result.data]);
		}, true);
	};

	/**
	 * 환불 정보 수정 요청
	 */
	function refundData(bankCode, accountNumber, depositorName) {
		Super.callApi('/apis/member/refundAccount', 'POST', {
			"accountNumber": accountNumber,
			"bankCode": bankCode,
			"depositorName": depositorName
		}, function(status, result) {
			if (status != 200) Super.handleError('refundData', result);
			$(callerObj).trigger('refundDataResult', [status, result]);
		}, true);
	};

	/**
	 * 비밀번호 재설정
	 */
	function resetPassword(authKey, newPassword) {
		Super.callApi('/apis/member/resetPassword', 'POST', {
			"key": authKey,
			"passwd": newPassword
		}, function(status, result) {
			if (status != 200) Super.handleError('resetPassword', result);
			$(callerObj).trigger('resetPasswordResult', [status, result]);
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

