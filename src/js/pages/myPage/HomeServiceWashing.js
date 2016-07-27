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
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	dropDownMenu =  require('../../components/DropDownMenu.js'),
	CARD_LIST_EVENT = events.CARD_LIST,
	COLORBOX_EVENTS = events.COLOR_BOX;

	var info;

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

		$(document).on(COLORBOX_EVENTS.COMPLETE, popupHandler);

		controller.homeServiceDetailWashing(serviceRequestNumber);
	};

	function popupHandler(e) {
		debug.log(fileName, 'popupHandler', e.type);

		if ($('#colorbox').hasClass('dateChangePop')) {
			setDateChangePopup();
		} else if ($('#colorbox').hasClass('washCancel')) {
			setWashCancelPopup();
		}
	}

	function getDetailHandler(e, status, result) {
		debug.log();

		info = result.washRequestDetail;
		
		info.stepClass1 = '';
		info.stepClass2 = '';
		info.stepClass3 = '';
		info.stepClass4 = '';
		info.stepClass5 = '';
		switch(info.statusCode) {
			case "LS_WASH_STATE_01": 
				info.step = 1;
				info.stepClass1 = 'on';
				break;
			case "LS_WASH_STATE_03": 
				info.step = 2;
				info.stepClass2 = 'on';
				break;
			case "LS_WASH_STATE_04": 
				info.step = 3;
				info.stepClass3 = 'on'; 
				break;
			case "LS_WASH_STATE_05": 
				info.step = 4;
				info.stepClass4 = 'on'; 
				break;
			case "LS_WASH_STATE_06": 
				info.step = 5;
				info.stepClass5 = 'on'; 
				break;

			case "LS_WASH_STATE_02": 
				info.step = 0;
				$('.myMenu ul li').removeClass('on');
				$('.myMenu ul li:eq(1)').addClass('on');
				break;
		}
		
		info.createDateTime = moment(info.createDateTime).format('YYYY.MM.DD HH:MM');
		info.requestTargetContact = util.mobileNumberFormat(info.requestTargetContact);
		info.memberPhoneNumber = util.mobileNumberFormat(info.memberPhoneNumber);

		renderData(info, '#description-templates', '#washingDetail', true);

		if (info.statusCode != "LS_WASH_STATE_01") $('#washCancelButton').remove();

		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function setDateChangePopup() {
		var rangePicker = $('#colorbox').find('.js-range-picker');
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-from'),
					altField : rangePicker.find('.js-alt-from'),
					button : rangePicker.find('.js-btn-from'),
					minDate : 0
				},
				to : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-to'),
					altField : rangePicker.find('.js-alt-to'),
					button : rangePicker.find('.js-btn-to'),
					defaultDate : +5
				}
			}
		});

		dropDownMenu.init({
			wrap : $('#colorbox')
		});
	};

	function setWashCancelPopup() {
		renderData(info, '#homeServiceCancelTemplates', '#homeServiceCancelWrap', true);

		$('#washCancelSubmitButton').click(function(e){
			e.preventDefault();
			alert('들어올 때는 마음대로지만 나갈 때는 아니란다');
		});
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};