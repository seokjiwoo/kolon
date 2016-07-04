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
	$(controller).on('logoutResult', logoutResultHandler);
	
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

		$('#resignForm').submit(resignHandler);
	}


	function resignHandler(e) {
		e.preventDefault();

		if ($('#agree01').prop('checked') && $('#agree02').prop('checked')) {
			var reasonCodes = new Array();
			$('#reasonList li').each(function(index) {
				if ($(this).find('input').prop('checked')) {
					reasonCodes.push('BM_LEAVE_REASON_'+$(this).find('input').attr('id').substr(6));
				}
			});

			var reasonStatement = $('#reasonStatement').val();

			if (reasonCodes.length == 0) {
				MyPage.Super.Super.alertPopup('탈퇴에 실패하였습니다', '회원탈퇴 사유를 1개 이상 체크해주세요.', '닫기');
			} else {
				console.log(reasonCodes, reasonStatement);
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
				controller.logout();
			});
		} else {
			MyPage.Super.Super.alertPopup('탈퇴에 실패하였습니다', result.message, '닫기');
		}
	};
	
	function logoutResultHandler(e, status) {
		location.href = '/';
	};
};