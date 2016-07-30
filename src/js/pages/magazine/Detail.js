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

	var snsShare = require('../../components/SnsShare.js');
	
	var controller = require('../../controller/MagazineController');
	$(controller).on('magazineInfoResult', getDetailHandler);
	$(controller).on('magazineLikesResult', likeResultHandler);
	var scrapController = require('../../controller/ScrapController.js');
	$(scrapController).on('addScrapResult', scrapResultHandler);
	
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

		snsShare.init();
		
		if (magazineData.registeredLikeYn == 'Y') $('.js-add-like').addClass('on');
		if (magazineData.registeredScrapYn == 'Y') $('.js-add-scrap').addClass('on');
		$('.js-add-like').click(function(e){
			e.preventDefault();
			if ($(this).hasClass('on')) {
				// unlike?
				controller.likes(magazineData.magazineNumber);
			} else {
				controller.likes(magazineData.magazineNumber);
			}
		});
		$('.js-add-scrap').click(function(e){
			e.preventDefault();
			if ($(this).hasClass('on')) {
				alert('이미 스크랩한 글입니다.');
			} else {
				scrapController.addCardScrap(scrapController.SCRAP_TARGET_CODE_CARD_MAGAZINE, magazineData.magazineNumber);
			}
		});
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};

	function likeResultHandler(e, status, result) {
		if (status == 200) {
			$('.js-add-like').addClass('on');
			$('.js-add-like .countNum').text(Number($('.js-add-like .countNum').text())+1);
		} else {
			alert(result.message);
		}
	};

	function scrapResultHandler(e, status, result) {
		if (status == 200) {
			$('.js-add-scrap').addClass('on');
			$('.js-add-scrap .countNum').text(Number($('.js-add-scrap .countNum').text())+1);
		} else {
			alert(result.message);
		}
	};
};