/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyServiceCancel.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ORDER_EVENT = events.ORDER,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;

	var clameState = 'SL_CONST_STATE_12,SL_CONST_STATE_13,SL_CONST_STATE_14,SL_CONST_STATE_15';

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '#js-order-list-wrap',
			template : '#order-list-templates'
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

		debug.log(fileName, 'init');

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();
		setRangePicker();

		getOrderList();
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
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		$('.dropChk').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);

		self.search.on('submit', function(e) {
			e.preventDefault();
		});

		self.searchSubmit.on('click', onSearch);
		self.searchInp.on('keydown', onSearch);
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

			getOrderList();
		});

		$('.js-sort-date li.js-default').trigger('click')
										.removeClass('js-default');
	}

	function getOrderList() {
		controller.myConstCancelList(
			win.moment(self.rangeAltFrom.pVal()).format(self.opts.dateFormat),
			win.moment(self.rangeAltTo.pVal()).format(self.opts.dateFormat),
			self.searchInp.pVal(),
			clameState
		);
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

	function onControllerListener(e, status, response, type) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case ORDER_EVENT.NEWFORM_CANCEL_LIST:
				/*
				result.data.totalPaymentPriceDesc = util.currencyFormat(parseInt(result.data.totalPaymentPrice, 10));

				if (result.data.listOrderItems) {
					$.each(result.data.listOrderItems, function(index, orderItems) {
						orderItems.itemPriceDesc = util.currencyFormat(parseInt(orderItems.itemPrice, 10));
						orderItems.deliveryChargeDesc = util.currencyFormat(parseInt(orderItems.deliveryCharge, 10));
						orderItems.productOptionPriceDesc = util.currencyFormat(parseInt(orderItems.productOptionPrice, 10));
						orderItems.discountApplyAmtDesc = util.currencyFormat(parseInt(orderItems.discountApplyAmt, 10));

						if (util.isLocal()) {
							orderItems.productImageUrl = 'https://dev.koloncommon.com/' + orderItems.productImageUrl;
						}

						orderItems.vxTotalPaymentPrice = orderItems.productPrice - orderItems.discountAmt;
						orderItems.vxTotalPaymentPriceDesc = util.currencyFormat(parseInt(orderItems.vxTotalPaymentPrice, 10));
					});
				}
				*/
				
				$.each(result.constOrderCancel, function(key, eachOrder){
					eachOrder.orderDate = moment(eachOrder.orderDateTime).format('YYYY.MM.DD');
					eachOrder.constProduct = eachOrder.constProducts[0];
					eachOrder.constProduct.productPriceDesc = util.currencyFormat(eachOrder.constProduct.productPrice);
				});

				debug.log(fileName, 'onControllerListener', eventType, status, result);
				displayData(result);
				break;

			case ORDER_EVENT.ORDER_CONFIRM:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;

			case ORDER_EVENT.ORDER_DETAIL:
				if (result && !result.data) {
					displayData([], type);
					return;
				}

				result.data.totalPaymentPriceDesc = util.currencyFormat(parseInt(result.data.totalPaymentPrice, 10));
				result.data.discountPriceDesc = util.currencyFormat(parseInt(result.data.discountPriceDesc, 10));

				if (result.data.listOrderItems) {
					$.each(result.data.listOrderItems, function(index, listOrderItems) {
						listOrderItems.itemPriceDesc = util.currencyFormat(parseInt(listOrderItems.itemPrice, 10));
						listOrderItems.discountPriceDesc = util.currencyFormat(parseInt(listOrderItems.discountPrice, 10));
						listOrderItems.deliveryFreeDesc = util.currencyFormat(parseInt(listOrderItems.deliveryFree, 10));
					});
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result.data, type);
				break;

			case ORDER_EVENT.ORDER_TRACKING:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				var deliverInfo = response.data.deliveryInfo;

				$('#dsProductName').text(deliverInfo.productName);
				$('#dsProductOrderNumber').text(deliverInfo.orderNumber);
				$('#dsDeliverName').text(deliverInfo.courierName);
				$('#dsDeliverName').attr('href', deliverInfo.invoiceInquiryUrl);
				$('#dsDeliverTel').text(deliverInfo.courierPhoneNumber);
				$('#dsDeliverCode').text(deliverInfo.invoiceNumber);
				break;
		}
	}
	
	// Handlebars 마크업 템플릿 구성
	function displayData(data, type) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty().addClass(self.opts.cssClass.isLoading).append(insertElements);

		self.templatesWrap.imagesLoaded().always(function() {
			self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
			eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
			eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
		});

		/*
		if (type === 'COLOR_BOX') {
			_template = self.colorbox.find('#cancel-request-templates');
			_templatesWrap =  self.colorbox.find('.js-cancelRequest-wrap');
		}

		if (type === 'COLOR_BOX') {
			self.colorbox.find('form').on('submit', function(e) {e.preventDefault();});
			self.colorbox.find('.js-cancel-submit').on('click', function(e) {
				e.preventDefault();

				var forms = self.colorbox.find('.js-cancel-form'),
				isValid = false,
				cancelType, cancelReson;

				$.each(forms, function() {
					cancelType = $(this).find('.js-type').pVal();
					cancelReson = $(this).find('.js-inp').pVal();
					if (cancelType && cancelReson) {
						isValid = true;
					} else {
						isValid = false;
						return false;
					}
				});

				if (!isValid) {
					win.alert('취소 사유를 선택/입력 해주세요.');
					return;
				}

				$.each(forms, function() {
					cancelType = $(this).find('.js-type').pVal();
					cancelReson = $(this).find('.js-inp').pVal();
				});
			});
		}*/
	}

	function setColoboxEvevnts() {
		/*
		// 취소신청
		if (self.colorbox.hasClass('popOrderCancelRequest')) {
			controller.orderDetail(self.selPopBtnInfo.info.orderNumber, 'COLOR_BOX');
		}

		// 배송추적
		if (self.colorbox.hasClass('popOrderDelivery')) {
			controller.orderTrackingInfo(
				self.selPopBtnInfo.info.orderNumber,
				self.selPopBtnInfo.info.deliveryNumber
			);
		}

		self.colorbox.find('.btnColor02').on('click', function(e) {
			e.preventDefault();
			testResult();
		});*/
	}

	function testResult() {
		//win.alert('임시처리 결과처리 - location.reload');
		win.location.reload();
	}

	function destroyColoboxEvevnts() {
	}

	function onColorBoxAreaListener(e) {
		/*
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				setColoboxEvevnts();
				break;
			case COLORBOX_EVENT.CLEANUP:
				destroyColoboxEvevnts();
				break;
		}*/
	}
};