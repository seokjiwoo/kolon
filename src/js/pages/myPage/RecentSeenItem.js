/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Like.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var controller = require('../../controller/MyPageController.js');
	$(controller).on('recentViewItemsResult', itemListHandler);

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

		controller.recentViewItems();
	}

	function itemListHandler(e, status, result) {
		cardList.appendData(result.data.likeList);
	}
};