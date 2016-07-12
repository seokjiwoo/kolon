/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/RecentSeenItem.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var CardList = require('../../components/CardList.js');
	var cardList;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();


		cardList = CardList();
		cardList.init();
		
		debug.log(fileName, $, util);
	}
};