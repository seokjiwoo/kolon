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
	var serviceRequestNumber;
	var serviceCompanyCode = 'LS_COMPANY_SECTION_02';	// 임시처리. 바꿔야 함.

	var now;
	var pickup;
	var delivery;

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('homeServiceDetailResult', getDetailHandler);
	$(controller).on('cancelWashingResult', cancelWashingHandler);
	$(controller).on('changeWashingPickupTimeListResult', changePickupTimeListHandler);
	$(controller).on('changeWashingPickupTimeResult', changeWashingTimeHandler);
	$(controller).on('changeWashingDeliveryTimeListResult', changeDeliveryTimeListHandler);
	$(controller).on('changeWashingDeliveryTimeResult', changeWashingTimeHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		serviceRequestNumber = util.getUrlVar().serviceRequestNumber;

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
		
		info.createDateTime = moment(info.createDateTime.split('.')[0]).format('YYYY.MM.DD HH:MM');
		info.requestTargetContact = util.mobileNumberFormat(info.requestTargetContact);
		info.memberPhoneNumber = util.mobileNumberFormat(info.memberPhoneNumber);

		now = moment();
		pickup = moment(info.pickUpReservationDateTime);
		delivery = moment(info.deliveryUpReservationDateTime);
		
		info.pickupDate = pickup.format('YYYY.MM.DD dddd / A hh:mm');
		if (info.deliveryUpReservationDateTime != null) info.deliveryDate = delivery.format('YYYY.MM.DD dddd / A hh:mm');

		renderData(info, '#description-templates', '#washingDetail', true);
		
		if (now.diff(pickup, 'minute') < 90 || (info.deliveryUpReservationDateTime != null && now.diff(delivery, 'minute') < 90)) {
			$('#washChangeButton').show();
		} else {
			$('#washChangeButton').hide();
		}
		if (info.statusCode != "LS_WASH_STATE_01") $('#washCancelButton').remove();

		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function setDateChangePopup() {
		renderData(info, '#homeServiceChangeTemplates', '#homeServiceChangeWrap', true);

		if (now.diff(pickup, 'minute') < 90) {
			// 픽업 수정가능
			controller.changeWashingPickupTimeList(serviceCompanyCode, serviceRequestNumber);
		} else {
			$('#pickupRow').hide();
		}
		if (info.deliveryUpReservationDateTime != null && now.diff(delivery, 'minute') < 90) {
			// 배송 수정가능
			controller.changeWashingDeliveryTimeList(serviceCompanyCode, serviceRequestNumber);
		} else {
			$('#deliveryRow').hide();
		}

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

	function changePickupTimeListHandler(e, status, result) {
		//
			// changeWashingPickupTime
	};

	function changeDeliveryTimeListHandler(e, status, result) {
		//
			//  changeWashingDeliveryTime
	};

	function changeWashingTimeHandler(e, status, result) {
		if (status == 200) {
			alert('변경이 완료되었습니다');
			location.href = '/myPage/homeService.html';
		} else {
			alert(result.message);
		}
	};

	function setWashCancelPopup() {
		renderData(info, '#homeServiceCancelTemplates', '#homeServiceCancelWrap', true);

		$('#reasonSelect').change(function(e){
			if ($(this).val() == '-' || $(this).val() == '') {
				$('#reasonField').val('');
			} else {
				$('#reasonField').val($(this).val());
			}
		});
		$('#reasonField').change(function(e){
			$('#reasonSelect').val('');
		});
		$('#washCancelForm').submit(function(e){
			e.preventDefault();
			if ($('#reasonSelect').val() == '-') {
				alert('주문 취소 사유를 선택해주세요');
			} else if ($('#reasonSelect').val() == '' && $.trim($('#reasonField').val()) == '') {
				alert('주문 취소 사유를 입력해주세요');
			} else {
				var reason = $('#reasonSelect').val();
				if ($.trim($('#reasonField').val()) == '') reason = $('#reasonField').val();

				controller.cancelWashing(serviceCompanyCode, serviceRequestNumber, reason);
			}
		});
	};

	function cancelWashingHandler(e, status, result) {
		if (status == 200) {
			alert('취소가 완료되었습니다');
			location.href = '/myPage/homeService.html';
		} else {
			alert(result.message);
		}
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};