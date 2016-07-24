/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/HomeServiceDetail.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('homeServiceDetailResult', getDetailHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		var serviceRequestNumber = util.getUrlVar().serviceRequestNumber;
		controller.homeServiceDetailMoving(serviceRequestNumber);
	};

	function getDetailHandler(e, status, result) {
		debug.log(result);

		//renderData(magazineData, '#description-templates', '#description-wrap', true);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};