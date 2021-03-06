/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Return.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CLAIMS_EVENT = events.CLAIMS;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-return-list-wrap',
			template : '#return-list-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		},
		rangePicker : {
			wrap : '.js-range-picker',
			altFrom : '.js-alt-from',
			altTo : '.js-alt-to'
		},
		search : {
			wrap : '.js-return-search',
			inp : '.js-inp',
			submit : '.js-submit',
		},
		dateFormat : 'YYYYMMDD',
		orderFilter : '.js-order-filter .js-filter'
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util, controller, eventManager, events, COLORBOX_EVENT);

		self = callerObj;
		self.opts = opts;

		self.isDebug = true;
		self.isFilter = false;

		setElements();
		setBindEvents();
		setRangePicker();
	}

	function getClaimsList(keyword, deliveryStateCode) {
		keyword = keyword || '';
		deliveryStateCode = deliveryStateCode || '';

		controller.myClaimsList(
			win.moment(self.rangeAltFrom.val()).format(self.opts.dateFormat),
			win.moment(self.rangeAltTo.val()).format(self.opts.dateFormat),
			keyword,
			deliveryStateCode
		);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};

		self.rangePicker = $(self.opts.rangePicker.wrap);
		self.rangeAltFrom = self.rangePicker.find(self.opts.rangePicker.altFrom);
		self.rangeAltTo = self.rangePicker.find(self.opts.rangePicker.altTo);

		self.search = $(self.opts.search.wrap);
		self.searchInp = self.search.find(self.opts.search.inp);
		self.searchSubmit = self.search.find(self.opts.search.submit);

		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(controller).on(CLAIMS_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		self.search.on('submit', function(e) {
			e.preventDefault();
		});
		self.searchSubmit.on('click', onSearch);
		self.searchInp.on('keydown', onSearch);

		self.templatesWrap.on('click', '.js-btn', onWrapPopBtnClick);

		$(self.opts.orderFilter).on('click', onFilterChange);
	}

	function onWrapPopBtnClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		isConfirm = false,
		info = target.closest('[data-order-info]').data('order-info');

		self.selPopBtnInfo = {
			target : target,
			info : info
		};

		if (target.hasClass('js-order-confirm')) {
			isConfirm = win.confirm('선택하신 상품의 구매를 확정하시겠습니까?');
		}

		if (isConfirm) {
			controller.orderConfirm(self.selPopBtnInfo.info.orderNumber, self.selPopBtnInfo.info.orderProductSequence);
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, template, templatesWrap) {
		template = template || self.template;
		templatesWrap = templatesWrap || self.templatesWrap;

		var source = template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		templatesWrap.imagesLoaded()
							.always(function() {
								templatesWrap.removeClass(self.opts.cssClass.isLoading);

								$(self.opts.orderFilter).off('click', onFilterChange);
								$(self.opts.orderFilter).on('click', onFilterChange);

								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
							});
	}

	function setColoboxEvevnts() {
		// 교환상세
		if (self.colorbox.hasClass('popOrderChangeDetail')) {
			controller.claimsExchange(self.selPopBtnInfo.info.orderNumber);
		}

		// 반품상세
		if (self.colorbox.hasClass('popOrderReturnDetail')) {
			controller.claimsReturn(self.selPopBtnInfo.info.orderNumber);
		}

		// self.colorbox.find('.btnColor02').on('click', function(e) {
		// 	e.preventDefault();
		// 	testResult();
		// });
	}

	function testResult() {
		win.alert('임시처리 결과처리 - location.reload');
		win.location.reload();
	}

	function destroyColoboxEvevnts() {
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				setColoboxEvevnts();
				break;
			case COLORBOX_EVENT.CLEANUP:
				destroyColoboxEvevnts();
				break;
		}
	}

	function onFilterChange(e) {
		e.preventDefault();
		
		var target = $(e.currentTarget),
		values = target.data('filter');

		debug.log(fileName, 'onFilterChange', values);
		getClaimsList(self.searchInp.val(), values);
	}

	function onSearch(e) {
		if (e.type === 'keydown' && e.which !== $.ui.keyCode.ENTER) {
			return;
		}

		e.preventDefault();

		if (!self.searchInp.val() || self.searchInp.val() === ' ') {
			win.alert('검색어를 입력하세요.');
			self.searchInp.val('').focus();
			return;
		}
		getClaimsList(self.searchInp.val());
	}

	function setRangePicker() {
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : self.rangePicker,
					picker : self.rangePicker.find('.js-picker-from'),
					altField : self.rangePicker.find('.js-alt-from'),
					button : self.rangePicker.find('.js-btn-from'),
					minDate : null
				},
				to : {
					wrap : self.rangePicker,
					picker : self.rangePicker.find('.js-picker-to'),
					altField : self.rangePicker.find('.js-alt-to'),
					button : self.rangePicker.find('.js-btn-to'),
					maxDate : 0
				}
			}
		});

		$('.js-sort-date li').click(function(e) {
			e.preventDefault();
			$(this).addClass('acitve').siblings('li').removeClass('acitve');

			switch($(this).text()) {
				case '1주일':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(7, 'days').format('YYYY-MM-DD'));
					break;
				case '2주일':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(14, 'days').format('YYYY-MM-DD'));
					break;
				case '1개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(1, 'months').format('YYYY-MM-DD'));
					break;
				case '3개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(3, 'months').format('YYYY-MM-DD'));
					break;
				case '6개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(6, 'months').format('YYYY-MM-DD'));
					break;
			}
			$('.js-picker-to').datepicker('setDate', win.moment().format('YYYY-MM-DD'));
			$('.js-picker-to').datepicker('option', 'minDate', win.moment($('.js-alt-from').val()).format('YYYY-MM-DD'));
			e.stopPropagation();

			getClaimsList();
		});

		$('.js-sort-date li.js-default').trigger('click');
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case CLAIMS_EVENT.LIST:
				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}

				if (result.data && result.data.orders) {
					$.each(result.data.orders, function(index, orders) {
						orders.totalPaymentPriceDesc = util.currencyFormat(parseInt(orders.totalPaymentPrice, 10));
						if (orders.listOrderItems) {
							$.each(orders.listOrderItems, function(index, listOrderItems) {
								listOrderItems.itemPriceDesc = util.currencyFormat(parseInt(listOrderItems.itemPrice, 10));
							});
						}
					});
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result.data);
				break;
			case CLAIMS_EVENT.EXCHANGE:
				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);

				displayData(result.data.detail, self.colorbox.find('#change-detail-templates'), self.colorbox.find('.js-change-detail'));
				break;
			case CLAIMS_EVENT.RETURN:
				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);

				displayData(result.data.detail, self.colorbox.find('#return-detail-templates'), self.colorbox.find('.js-return-detail'));
				break;
		}
	}
};