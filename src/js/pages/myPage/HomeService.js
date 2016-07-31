/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/HomeService.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	dropDownMenu =  require('../../components/DropDownMenu.js');

	var eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	CARD_LIST_EVENT = events.CARD_LIST,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;

	var clameState = 'LS_WASH_STATE_01,LS_WASH_STATE_03,LS_WASH_STATE_04,LS_WASH_STATE_05,LS_MOVING_STATE_01,LS_MOVING_STATE_03,LS_MOVING_STATE_04';

	var info;
	var serviceRequestNumber;
	var serviceCompanyCode;
	var statusCode;

	var now;
	var pickup;
	var delivery;
	
	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('homeServiceOrderListResult', listHandler);
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
	},
	opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			categoryPop : 'dateChangePop'
		}
	},
	self;
	
	return callerObj;
	
	function init() {
		MyPage.init();

		debug.log(fileName, 'init');

		self = callerObj;

		setElements();
		initRangePicker();
		setBindEvents();

		refreshListCritica();
	}

	function setElements() {
		self.colorbox = $(opts.colorbox.target);
	}

	function initRangePicker() {
		setRangePicker();

		$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));
		$('.sortTerm li a').click(function(e) {
			e.preventDefault();
			$(this).addClass('on').parent().siblings('li').find('a').removeClass('on');
			switch($(this).text()) {
				case '1주일':
					$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));
					break;
				case '2주일':
					$('.js-picker-from').datepicker('setDate', moment().subtract(14, 'days').format('YYYY-MM-DD'));
					break;
				case '1개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(1, 'months').format('YYYY-MM-DD'));
					break;
				case '3개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(3, 'months').format('YYYY-MM-DD'));
					break;
				case '6개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(6, 'months').format('YYYY-MM-DD'));
					break;
			}
			$('.js-picker-to').datepicker('setDate', moment().format('YYYY-MM-DD'));
			
			refreshListCritica();
			e.stopPropagation();
		});
	};

	function refreshListCritica(e) {
		if (e != undefined) e.preventDefault();
		var fromDate = moment($('.js-picker-from').datepicker('getDate')).format('YYYY-MM-DD');
		var toDate = moment($('.js-picker-to').datepicker('getDate')).format('YYYY-MM-DD');
		controller.homeServiceOrderList($('#recordInput').pVal(), fromDate, toDate, clameState);
		if (e != undefined) e.stopPropagation();
	};

	function setRangePicker() {
		var rangePicker = $('.js-range-picker');
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-from'),
					altField : rangePicker.find('.js-alt-from'),
					button : rangePicker.find('.js-btn-from'),
					minDate : null
				},
				to : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-to'),
					altField : rangePicker.find('.js-alt-to'),
					button : rangePicker.find('.js-btn-to'),
					maxDate : 0
				}
			}
		});

		$('.js-picker-from').on('onSelect', function() {
			refreshListCritica();
		});
		$('.js-picker-to').on('onSelect', function() {
			refreshListCritica();
		});
	};

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		$('.dropChk').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
		
		$('#searchButton').click(refreshListCritica);
	}

	var currentPopupFunctionName;

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if ($('#colorbox').hasClass('dateChangePop')) {
					currentPopupFunctionName = 'change';					
					controller.homeServiceDetailWashing(serviceRequestNumber);
				} else if ($('#colorbox').hasClass('washCancel')) {
					currentPopupFunctionName = 'cancel';
					controller.homeServiceDetailWashing(serviceRequestNumber);
				}
				break;
			case CB_EVENTS.CLEANUP:
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}

	function getDetailHandler(e, status, result) {
		info = result.washRequestDetail;
		serviceCompanyCode = info.livingCompanySectionCode;

		info.createDateTime = moment(info.createDateTime.split('.')[0]).format('YYYY.MM.DD HH:MM');
		info.requestTargetContact = util.mobileNumberFormat(info.requestTargetContact);
		info.memberPhoneNumber = util.mobileNumberFormat(info.memberPhoneNumber);
		
		now = moment();
		pickup = moment(info.pickUpReservationDateTime);
		delivery = moment(info.deliveryUpReservationDateTime);

		info.pickupDate = pickup.format('YYYY.MM.DD dddd / A hh:mm');
		if (info.deliveryUpReservationDateTime != null) info.deliveryDate = delivery.format('YYYY.MM.DD dddd / A hh:mm');

		switch(currentPopupFunctionName) {
			case 'change':
				setDateChangePopup();
				break;
			case 'cancel':
				setWashCancelPopup();
				break;
		}
	}

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.pVal(), data);
		clameState = data.values.join(',');
		refreshListCritica();
	}

	function setHomeServiceLayer() {
		debug.log(fileName, 'setHomeServiceLayer');

		var rangePicker = self.colorbox.find('.js-range-picker');
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
			wrap : self.colorbox
		});
	}

	function destoryHomeServiceLayer() {
		debug.log(fileName, 'destoryHomeServiceLayer');
		
		self.colorbox.find('.js-picker .js-picker').datepicker('destroy');
		$(dropDownMenu).trigger(dropDownMenu.EVENT.DESTROY);
	}

	function listHandler(e, status, result) {
		$.map(result.livingRequestHistoryList, function(each) {
			each.createDate = moment(each.createDateTime).format('YYYY. MM. DD');
			switch(each.serviceSectionCode) {
				case 'LS_SERVICE_TYPE_01':
					switch(each.statusCode) {
						case "LS_MOVING_STATE_01": 
						case "LS_MOVING_STATE_02": each.paymentStatus = '실측 후 견적 안내 및 계약 진행'; break;
						case "LS_MOVING_STATE_03": 
						case "LS_MOVING_STATE_04": each.paymentStatus = '업체와 협의 중'; break;
						case "LS_MOVING_STATE_05": 
						case "LS_MOVING_STATE_06": each.paymentStatus = '결제완료'; break;
						case "LS_MOVING_STATE_07": each.paymentStatus = ''; break;
					}
				case 'LS_SERVICE_TYPE_02':
					switch(each.statusCode) {
						case "LS_WASH_STATE_01": each.paymentStatus = '세탁물 수거 후에 결제가능'; break;
						case "LS_WASH_STATE_02": 
						case "LS_WASH_STATE_03": 
						case "LS_WASH_STATE_04": 
						case "LS_WASH_STATE_05": 
							each.paymentStatus = util.currencyFormat(each.price)+' 원<br>';
							if (each.paymentStateCode == 'LS_ORDER_STATE_01') {
								each.paymentStatus += '<a href="/order/orderHomeService.html?orderNumber='+each.serviceRequestNumber+'" class="btnSizeS btnColor02">결제하기</a>';
							} else {
								each.paymentStatus += '<span>'+each.paymentStateCodeName+'</span>';
							}
							break;
					}
					break;
			}
		});
		debug.log(result);
		renderData(result, '#homeservice-list-templates', '#homeservice-wrap', true);
		
		$('.btnPop').click(function(e){
			serviceRequestNumber = $(this).data().orderNumber;
		});

		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};



	function setDateChangePopup() {
		renderData(info, '#homeServiceChangeTemplates', '#homeServiceChangeWrap', true);

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

		if (now.diff(pickup, 'minute') < 90) {
			// 픽업 수정가능
			statusCode = 'pickup';
			controller.changeWashingPickupTimeList(serviceCompanyCode, serviceRequestNumber);
			$('.js-picker-from').datepicker("option", "maxDate", new Date(moment().add(7, 'day')));
			$('.js-picker-from').on('onSelect', function(){
				refreshTimeDrop();
			});
		} else {
			$('#pickupRow').hide();
		}
		if (info.deliveryUpReservationDateTime != null && now.diff(delivery, 'minute') < 90) {
			// 배송 수정가능
			statusCode = 'delivery';
			controller.changeWashingDeliveryTimeList(serviceCompanyCode, serviceRequestNumber);
			$('.js-picker-to').datepicker("option", "maxDate", new Date(moment().add(7, 'day')));
			$('.js-picker-to').on('onSelect', function(){
				refreshTimeDrop();
			});
		} else {
			$('#deliveryRow').hide();
		}

		$('#washChangeForm').submit(function(e){
			e.preventDefault();

			switch(statusCode) {
				case 'pickup':
					var requestDate = moment($('.js-picker-from').datepicker('getDate')).format('YYYY-MM-DD');
					var requestValue = $('#pickupDrop').pVal().split('|');
							
					if (requestValue.length == 1) {
						alert('변경예정시각을 선택해주세요');
					} else {
						controller.changeWashingPickupTime(serviceCompanyCode, serviceRequestNumber, requestValue[0], requestValue[1]);
					}
					break;
				case 'delivery':
					var requestDate = moment($('.js-picker-to').datepicker('getDate')).format('YYYY-MM-DD');
					var requestValue = $('#deliveryDrop').pVal().split('|');
							
					if (requestValue.length == 1) {
						alert('변경예정시각을 선택해주세요');
					} else {
						controller.changeWashingDeliveryTime(serviceCompanyCode, serviceRequestNumber, requestValue[0], requestValue[1]);
					}
					break;
			}
		});

		dropDownMenu.init({
			wrap : $('#colorbox')
		});

		$.colorbox.resize();
	};

	var timeArray; 

	function changePickupTimeListHandler(e, status, result) {
		timeArray = result.availableDateTime;
		refreshTimeDrop();
	};

	function changeDeliveryTimeListHandler(e, status, result) {
		timeArray = result.availableDateTime;
		refreshTimeDrop();
	};

	function refreshTimeDrop() {
		switch(statusCode) {
			case 'pickup':
				var requestDate = moment($('.js-picker-from').datepicker('getDate')).format('YYYY-MM-DD');
				break;
			case 'delivery':
				var requestDate = moment($('.js-picker-to').datepicker('getDate')).format('YYYY-MM-DD');
				break;
		}

		if (timeArray[requestDate] == undefined) {
			//
		} else {
			var tags = '';
			$.each(timeArray[requestDate], function(key, each){
				if (serviceCompanyCode == 'LS_COMPANY_SECTION_01') {
					if (each.washOnYn == 'Y') tags += '<option value="'+each.dateTime+'|'+each.washOnDateTime+'">'+key+'</option>';
				} else if (serviceCompanyCode == 'LS_COMPANY_SECTION_02') {
					if (each.washSwatYn == 'Y') tags += '<option value="'+each.dateTime+'|'+each.washSwatDateTime+'">'+key+'</option>';
				};
			});
			if (tags == '') tags = '<option value="">선택 가능한 시간이 없습니다</option>';
			$('.timeDrop').html(tags);
		}
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
			if ($(this).pVal() == '-' || $(this).pVal() == '') {
				$('#reasonField').val('');
			} else {
				$('#reasonField').val($(this).pVal());
			}
		});
		$('#reasonField').change(function(e){
			$('#reasonSelect').val('');
		});
		$('#washCancelForm').submit(function(e){
			e.preventDefault();
			if ($('#reasonSelect').pVal() == '-') {
				alert('취소 신청 사유를 선택해주세요');
			} else if ($('#reasonSelect').pVal() == '' && $.trim($('#reasonField').pVal()) == '') {
				alert('취소 신청 사유를 입력해주세요');
			} else {
				var reason = $('#reasonSelect').pVal();
				if ($.trim($('#reasonField').pVal()) == '') reason = $('#reasonField').pVal();
				controller.cancelWashing(serviceCompanyCode, serviceRequestNumber, reason);
			}
		});

		$.colorbox.resize();
	};

	function cancelWashingHandler(e, status, result) {
		if (status == 200) {
			alert('취소가 완료되었습니다');
			location.href = '/myPage/homeService.html';
		} else {
			alert(result.message);
		}
	};
};