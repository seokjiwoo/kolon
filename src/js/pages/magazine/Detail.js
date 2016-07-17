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
		console.log(magazineData);

		renderData(magazineData, '#top-cont-templates', '#top-cont-wrap', true);
		renderData(magazineData, '#description-templates', '#description-wrap', true);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};