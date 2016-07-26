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
	CARD_LIST_EVENT = events.CARD_LIST;

	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('homeServiceOrderListResult', listHandler);

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
		controller.homeServiceOrderList($('#recordInput').val(), fromDate, toDate);
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

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
		
		$('#searchButton').click(refreshListCritica);
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					setHomeServiceLayer();
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					destoryHomeServiceLayer();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
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
						case "LS_WASH_STATE_05": each.paymentStatus = util.currencyFormat(each.price)+' 원<br><a href="/order/orderHomeService.html?orderNumber='+each.serviceRequestNumber+'" class="btnSizeS btnColor02">결제하기</a>'; break;
					}
					break;
			}
		});
		debug.log(result);
		renderData(result, '#homeservice-list-templates', '#homeservice-wrap', true);

		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};