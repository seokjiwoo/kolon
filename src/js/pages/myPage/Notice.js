/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Notice.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var controller = require('../../controller/MyPageController.js');
	$(controller).on('noticeTypeCodeResult', noticeTypeCodeHandler);
	$(controller).on('noticeListResult', noticeListHandler);
	$(controller).on('noticeDeleteResult', deleteNoticeResultHandler);

	var noticeTypeArray;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();

		$('#deleteAll').click(deleteNotice);
		
		controller.noticeTypeCode();
	};

	function noticeTypeCodeHandler(e, status, result) {
		noticeTypeArray = result;
		controller.noticeList();
	};

	function noticeListHandler(e, status, result) {
		console.log(noticeTypeArray);

		var type = '';
		switch(type) {
			case 'BM_NOTICE_TYPE_01':
				// 1:1 메시지
				break;
			case 'BM_NOTICE_TYPE_02':
				// 댓글(의견묻기)
				break;
			case 'BM_NOTICE_TYPE_03':
				// 댓글(상세)
				break;
			case 'BM_NOTICE_TYPE_04':
				// 댓글(리뷰)
				break;
			case 'BM_NOTICE_TYPE_05':
				// 배송 시작
				break;
			case 'BM_NOTICE_TYPE_06':
				// 배송 완료
				break;
			case 'BM_NOTICE_TYPE_07':
				// 견적서 도착
				break;
			case 'BM_NOTICE_TYPE_08':
				// 시공 시작
				break;
			case 'BM_NOTICE_TYPE_09':
				// 시공중(타임라인)
				break;
			case 'BM_NOTICE_TYPE_10':
				// 시공 완료
				break;
			case 'BM_NOTICE_TYPE_11':
				// 가입 인사
				break;
		}
	};

	function deleteNotice() {
		controller.noticeDelete();
	};

	function deleteNoticeResultHandler(e, status, result) {
		location.reload(true);
	};
};