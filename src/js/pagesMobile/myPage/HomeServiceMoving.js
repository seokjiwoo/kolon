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
		result.movingRequestDetail.stepClass1 = '';
		result.movingRequestDetail.stepClass2 = '';
		result.movingRequestDetail.stepClass3 = '';
		switch(result.movingRequestDetail.statusCode) {
			case "LS_MOVING_STATE_01": 
			case "LS_MOVING_STATE_02": result.movingRequestDetail.stepClass1 = 'on'; break;
			case "LS_MOVING_STATE_03": 
			case "LS_MOVING_STATE_04": result.movingRequestDetail.stepClass2 = 'on'; break;
			case "LS_MOVING_STATE_05": 
			case "LS_MOVING_STATE_06": result.movingRequestDetail.stepClass3 = 'on'; break;
			case "LS_MOVING_STATE_07": 
				$('.myMenu ul li').removeClass('on');
				$('.myMenu ul li:eq(1)').addClass('on');
				break;
		}

		result.movingRequestDetail.memberPhoneNumber = util.mobileNumberFormat(result.movingRequestDetail.memberPhoneNumber);
		result.movingRequestDetail.requestTargetContact = util.mobileNumberFormat(result.movingRequestDetail.requestTargetContact);
		result.movingRequestDetail.createDate = moment(result.movingRequestDetail.createDateTime).format('YYYY. MM. DD');
		result.movingRequestDetail.movingDate = moment(result.movingRequestDetail.movingDate).format('YYYY. MM. DD');

		renderData(result.movingRequestDetail, '#description-templates', '.description-wrap', true);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};