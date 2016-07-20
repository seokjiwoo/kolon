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
			renderData(result, '#message-list-templates', '#messageListWrap', true);
		} else {
			if (result.errorCode == '1409') {
				$('#messageListWrap').css({
					textAlign: 'center',
					marginTop: '20px',
					padding: '200px 0',
					background: '#ffffff',
				}).text(result.message);
			}
		}
	};
	
	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};