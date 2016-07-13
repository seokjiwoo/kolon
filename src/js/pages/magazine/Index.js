/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'magazine/Index.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var CardList = require('../../components/CardList.js');
	var cardList;
	
	var model = require('../../model/CardListModel.js');
	
	var controller = require('../../controller/MagazineController');
	$(controller).on('magazineListResult', getListHandler);

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		debug.log(fileName, $, util);

		cardList = CardList();
		$(cardList).on('cardAppended', cardAppendedHandler);
		cardList.init();	// 카드 리스트
		
		controller.list();
		bestKeySlide();
	};

	function getListHandler(e, status, result) {
		cardList.appendData(result.magazineCards);
	};

	function bestKeySlide(){
		$('#bestKeySlide').bxSlider({
			mode: 'vertical',
			minSlides: 5,
			controls:false,
			infiniteLoop:false
		});
	};

	function cardAppendedHandler(e) {
		console.log('카드 이벤트 설정?');
	};
};