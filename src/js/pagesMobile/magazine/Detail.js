/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'magazine/Detail.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var controller = require('../../controller/MagazineController');
	$(controller).on('magazineInfoResult', getDetailHandler);
	var scrapController = require('../../controller/ScrapController.js');
	$(scrapController).on('addScrapResult', scrapResultHandler);

	var eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		var articleNumber = util.getUrlVar().articleNumber;
		controller.info(articleNumber);
	};

	function getDetailHandler(e, status, result) {
		var magazineData = result.data.magazine;
		debug.log(magazineData);

		renderData(magazineData, '#top-cont-templates', '#top-cont-wrap', true);
		renderData(magazineData, '#description-templates', '#description-wrap', true);
		
		if (magazineData.registeredLikeYn == 'Y') $('.js-add-like').addClass('on');
		if (magazineData.registeredScrapYn == 'Y') $('.js-add-scrap').addClass('on');
		$('.js-add-like').click(function(e){
			e.preventDefault();
			if ($(this).hasClass('on')) {
				//
			} else {
				controller.likes(magazineData.magazineNumber);
			}
		});
		$('.js-add-scrap').click(function(e){
			e.preventDefault();
			if ($(this).hasClass('on')) {
				//
			} else {
				scrapController.addCardScrap(scrapController.SCRAP_TARGET_CODE_CARD_MAGAZINE, magazineData.magazineNumber);
			}
		});

		eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};

	function scrapResultHandler(e, status, result) {
		if (status == 200) {
			$('.js-add-scrap').addClass('on');
			$('.js-add-scrap .countNum').text(Number($('.js-add-scrap .countNum').text())+1);
		}
	};
};