/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Resign.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/MemberInfoController');
	$(controller).on('deleteMemberResult', resignResponseHandler);
	$(controller).on('refundBankListResult', refundBankListResultHandler);
	$(controller).on('refundDataResult', refundDataResultHandler);

	var loginController = require('../../controller/LoginController');
	$(loginController).on('logoutResult', logoutResultHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		$('#changeRefundInfoButton').click(popRefundAccount);
		$('#resignForm').submit(resignHandler);
	}


	function resignHandler(e) {
		e.preventDefault();

		if ($('#agreeBox01').hasClass('on') && $('#agreeBox02').hasClass('on')) {
			var reasonCodes = new Array();
			$('#reasonList li').each(function(index) {
				if ($(this).find('label').hasClass('on')) {
					reasonCodes.push('BM_LEAVE_REASON_'+$(this).find('input').attr('id').substr(6));
				}
			});

			var reasonStatement = $('#reasonStatement').val();

			if (reasonCodes.length == 0) {
				MyPage.Super.Super.alertPopup('탈퇴에 실패하였습니다', '회원탈퇴 사유를 1개 이상 체크해주세요.', '닫기');
			} else {
				debug.log(reasonCodes, reasonStatement);
				controller.deleteMember(reasonCodes, reasonStatement);
			}
		} else {
			MyPage.Super.Super.alertPopup('탈퇴에 실패하였습니다', '탈퇴 동의를 하셔야 탈퇴하실 수 있습니다.', '닫기');
		}
		
		e.stopPropagation();
	};

	function resignResponseHandler(e, status, result) {
		if (status == 200) {
			MyPage.Super.Super.alertPopup('탈퇴가 완료되였습니다', result.message, '닫기', function() {
				loginController.logout();
			});
		} else {
			MyPage.Super.Super.alertPopup('탈퇴에 실패하였습니다', result.message, '닫기');
		}
	};
	
	function logoutResultHandler(e, status) {
		location.href = '/';
	};


	
	
	/**
	 * 환불정보 팝업 호출 (1) - 은행 목록 요청
	 */
	function popRefundAccount(e) {
		e.preventDefault();
		controller.refundBankList();
		e.stopPropagation();
	};

	/**
	 * 환불정보 팝업 호출 (2) - 팝업 열기
	 */
	function refundBankListResultHandler(e, status, result) {
		if (status == 200) {
			MyPage.Super.Super.htmlPopup('../../_popup/popRefundAccount.html', 590, 'popEdge', {
				onOpen: function() {
					var tags = '';
					for (var key in result.bankCodes) {
						tags += '<li><a href="#" data-value="'+result.bankCodes[key].code+'">'+result.bankCodes[key].bankName+'</a></li>';
					}
					$('#refundBankDrop').html(tags);
					eventManager.triggerHandler(DROPDOWNSCROLL_EVENT.REFRESH);
					$('#refundAccountForm').submit(submitChangeRefundAccount);
				},
				onSubmit: function() {
					$('#refundAccountForm').submit();
				}
			});
		} else {
			alert(status);
		}
	};
	
	/**
	 * 환불정보 변경요청  
	 */
	function submitChangeRefundAccount(e) {
		e.preventDefault();

		var bankCode = $('#refundBankDrop').closest('.js-drop-scroll').val();
		var accountNumber = $('#accountNumber').val();
		var depositorName = $('#depositorName').val();

		if (bankCode == '') {
			alert('은행을 선택해 주세요');
		} else if (!(/[0-9]+/g).test(accountNumber)) {
			alert('계좌번호는 숫자만 입력해 주세요');
		} else if ($.trim(depositorName) == '') {
			alert('예금주명을 입력해 주세요');
		} else {
			controller.refundData(bankCode[0], accountNumber, depositorName);
		} 
		
		e.stopPropagation();
	};
	
	/**
	 * 환불정보 변경요청 결과 핸들링
	 */
	function refundDataResultHandler(e, status, result) {
		e.preventDefault();
		if (status == 200) {
			alert('등록이 완료되었습니다');
			$.colorbox.close();
		} else {
			alert(result.message);
		}
		e.stopPropagation();
	};
};