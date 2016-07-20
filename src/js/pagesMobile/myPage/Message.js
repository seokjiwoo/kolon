/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var controller = require('../../controller/MessageController.js');
	$(controller).on('messageListResult', messageListHandler);

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		// /apis/inquiries
		controller.messageList();
	}

	function messageListHandler(e, status, result) {
		if (status == 200) {
			debug.log(result);
		} else {
			MyPage.Super.Super.alertPopup('', result.message, '확인');

			if (result.errorCode == '1409') {
				debug.log($('#messageListWrap'));
				$('#messageListWrap').css({
					textAlign: 'center',
					marginTop: '20px',
					padding: '200px 0',
					background: '#eeeeee',
				}).text(result.message);
			}
		}
	}
};