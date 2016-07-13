/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/Index.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass();

	var CardList = require('../../components/CardList.js');
	var cardList;

	var controller = require('../../controller/ExpertsController.js');
	$(controller).on('expertsListResult', expertListHandler);
	
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

		var slider = $('#managerSlider').bxSlider({
			pager:false,
			nextSelector: '#sliderNext',
  			prevSelector: '#sliderPrev',
			onSlideAfter: function (currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {
				$('#slideCon0'+(currentSlideHtmlObject)).fadeIn().css('display','block').siblings().hide();
				switch(currentSlideHtmlObject) {
					case 0:
						$('.bx-prev').css('background-position','-348px 0');
						$('.bx-next').css('background-position','-174px 0');
						break;
					case 1:
						$('.bx-prev').css('background-position','-0 0');
						$('.bx-next').css('background-position','-348px 0');
						break;
					case 2:
						$('.bx-prev').css('background-position','-174px 0');
						$('.bx-next').css('background-position','0 0');
						break;
				}
			}
		});

		controller.list();
	}

	function expertListHandler(e, status, result) {
		cardList.appendData(result.experts);
	};

	function cardAppendedHandler(e) {
		console.log('카드 이벤트 설정?');
	};
}