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
	CLAIMS_EVENT = events.CLAIMS,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;

	var clameState = 'SL_CLAIM_STATE_01_01,SL_CLAIM_STATE_01_02,SL_CLAIM_STATE_01_03,SL_CLAIM_STATE_02_01,SL_CLAIM_STATE_02_02,SL_CLAIM_STATE_02_03,SL_CLAIM_STATE_03_01,SL_CLAIM_STATE_03_02,SL_CLAIM_STATE_03_03,SL_CLAIM_STATE_01_04,SL_CLAIM_STATE_02_04,SL_CLAIM_STATE_03_04,SL_CLAIM_STATE_01_05,SL_CLAIM_STATE_02_05,SL_CLAIM_STATE_01_06,SL_CLAIM_STATE_02_06';
	
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
		dateFormat : 'YYYYMMDD'
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

		getOrderList();
	}

	function getOrderList() {
		controller.myClaimsList(
			win.moment(self.rangeAltFrom.pVal()).format(self.opts.dateFormat),
			win.moment(self.rangeAltTo.pVal()).format(self.opts.dateFormat),
			self.searchInp.pVal(),
			clameState
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

		$('.dropChk').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);

		self.search.on('submit', function(e) {
			e.preventDefault();
		});
		self.searchSubmit.on('click', onSearch);
		self.searchInp.on('keydown', onSearch);

		self.templatesWrap.on('click', '.js-btn', onWrapPopBtnClick);
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

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.pVal(), data);
		clameState = data.values.join(',');
		getOrderList();
	}

	function onSearch(e) {
		if (e.type === 'keydown' && e.which !== $.ui.keyCode.ENTER) {
			return;
		}

		e.preventDefault();

		if (!self.searchInp.pVal() || self.searchInp.pVal() === ' ') {
			win.alert('검색어를 입력하세요.');
			self.searchInp.val('').focus();
			return;
		}
		getOrderList();
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

		$('.js-picker-from').on('onSelect', function() {
			getOrderList();
		});
		$('.js-picker-to').on('onSelect', function() {
			getOrderList();
		});

		$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));
		$('.sortTerm li a').click(function(e) {
			e.preventDefault();
			$(this).addClass('on').parent().siblings('li').find('a').removeClass('on');
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
			$('.js-picker-to').datepicker('option', 'minDate', win.moment($('.js-alt-from').pVal()).format('YYYY-MM-DD'));
			e.stopPropagation();

			getOrderList();
		});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case CLAIMS_EVENT.LIST:
				//result.data.totalPaymentPriceDesc = util.currencyFormat(parseInt(result.data.totalPaymentPrice, 10));
				if (result.data.listOrderItems) {
					$.each(result.data.listOrderItems, function(index, orderItems) {
						orderItems.itemPriceDesc = util.currencyFormat(parseInt(orderItems.itemPrice, 10));
						if (orderItems.deliveryChargePaymentCode == 'SL_DLVY_CHARGE_PAYMENT_04' || orderItems.deliveryCharge == 0) {
							orderItems.deliveryChargeDesc = '무료';
						} else {
							orderItems.deliveryChargeDesc = util.currencyFormat(orderItems.deliveryCharge);
						}
						orderItems.productOptionPriceDesc = util.currencyFormat(parseInt(orderItems.productOptionPrice, 10));
						orderItems.discountApplyAmtDesc = util.currencyFormat(parseInt(orderItems.discountApplyAmt, 10));

						orderItems.vxTotalPaymentPrice = orderItems.productPrice - orderItems.discountAmt;
						orderItems.vxTotalPaymentPriceDesc = util.currencyFormat(parseInt(orderItems.vxTotalPaymentPrice, 10));
					});
				}
				
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result.data);
				break;
			case CLAIMS_EVENT.EXCHANGE:
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				displayData(result.data.detail, self.colorbox.find('#change-detail-templates'), self.colorbox.find('.js-change-detail'));
				break;
			case CLAIMS_EVENT.RETURN:
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				displayData(result.data.detail, self.colorbox.find('#return-detail-templates'), self.colorbox.find('.js-return-detail'));
				break;
		}
	}
};