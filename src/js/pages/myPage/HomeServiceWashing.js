/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/HomeServiceDetail.js';

	var eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	CARD_LIST_EVENT = events.CARD_LIST;

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
		controller.homeServiceDetailWashing(serviceRequestNumber);
	};

	function getDetailHandler(e, status, result) {
		debug.log();

		var info = result.washRequestDetail;
		
		info.stepClass1 = '';
		info.stepClass2 = '';
		info.stepClass3 = '';
		info.stepClass4 = '';
		info.stepClass5 = '';
		switch(info.statusCode) {
			case "LS_WASH_STATE_01": 
				info.step = 1;
				info.stepClass1 = 'on'; break;
			case "LS_WASH_STATE_02": 
				info.step = 2;
				info.stepClass2 = 'on';
				$('.myMenu ul li').removeClass('on');
				$('.myMenu ul li:eq(1)').addClass('on');
				break;
			case "LS_WASH_STATE_03": 
				info.step = 3;
				info.stepClass3 = 'on'; 
				break;
			case "LS_WASH_STATE_04": 
				info.step = 4;
				info.stepClass4 = 'on'; 
				break;
			case "LS_WASH_STATE_05": 
				info.step = 5;
				info.stepClass5 = 'on'; 
				break;
		}
		
		info.createDateTime = moment(info.createDateTime).format('YYYY.MM.DD HH:MM');
		info.requestTargetContact = util.mobileNumberFormat(info.requestTargetContact);
		info.memberPhoneNumber = util.mobileNumberFormat(info.memberPhoneNumber);

		renderData(info, '#description-templates', '#washingDetail', true);

		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};