/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/MyPageController.js');
	$(controller).on('myTimeLineResult', myTimeLineHandler);
	
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

		controller.myTimeLine();
	}

	function myTimeLineHandler(e, status, result) {
		console.log(result.data);
	}
};