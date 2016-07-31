/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Order.js';

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

	var clameState = 'SL_ORDER_STATE_01,SL_ORDER_STATE_02,SL_ORDER_STATE_03,SL_ORDER_STATE_04,SL_ORDER_STATE_05,SL_ORDER_STATE_06';
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-order-list-wrap',
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
			wrap : '.js-order-search',
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

		setElements();
		setBindEvents();
		setRangePicker();

		getOrderList();
	}

	function getOrderList() {
		controller.myOrdersList(
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
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
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
			if (win.confirm('선택하신 상품의 구매를 확정하시겠습니까?')) {
				controller.orderConfirm(self.selPopBtnInfo.info.orderNumber, self.selPopBtnInfo.info.productNumber, self.selPopBtnInfo.info.orderOptionNumber);
			}
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, type) {
		var _template = self.template,
		_templatesWrap = self.templatesWrap;

		var source = _template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		_templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		_templatesWrap.imagesLoaded()
							.always(function() {
								_templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
							});
	}

	function displayCancelPopup(data, type) {
		var _template = self.colorbox.find('#cancel-request-templates');
		var _templatesWrap = self.colorbox.find('.js-cancelRequest-wrap');

		var source = _template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		_templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		_templatesWrap.imagesLoaded()
							.always(function() {
								_templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
							});
		
		var cancelOrderDataArray = new Array();
		$.each(data.product, function(key, each){
			cancelOrderDataArray.push(new Array(each.productNumber, each.orderOptionNumber));
		});

		self.colorbox.find('form').on('submit', function(e) {e.preventDefault();});
		self.colorbox.find('#js-order-cancel-form').on('submit', function(e) {
			e.preventDefault();

			var isValid = true,
			cancelType, cancelReson;

			$.each($('.cancelReasonDrop'), function(key, each){
				cancelOrderDataArray[key].push($(each).pVal());
				if (!$(each).pVal()) isValid = false;
			});
			$.each($('.cancelReasonField'), function(key, each){
				cancelOrderDataArray[key].push(encodeURI($(each).pVal()));
				if (!$(each).pVal()) isValid = false;
			});
			
			if (!isValid) {
				win.alert('취소 신청 사유를 선택/입력 해주세요.');
				return;
			}
			
			var cancelOrderArray = new Array();
			$.map(cancelOrderDataArray, function(each) {
				cancelOrderArray.push(each.join('|'));
			});

			var cancelOrder = cancelOrderArray.join(',');
			
			controller.orderCancel(self.selPopBtnInfo.info.orderNumber, cancelOrder);
		});
	};

	function setColoboxEvevnts() {
		// 취소신청
		if (self.colorbox.hasClass('popOrderCancelRequest')) {
			if (self.selPopBtnInfo.info.joinedOrder == "1") {
				controller.cancelDetail(self.selPopBtnInfo.info.orderNumber, self.selPopBtnInfo.info.productNumber+'|'+self.selPopBtnInfo.info.orderOptionNumber);
			} else {
				var cancelRequestMessage = '';
				$.each($('[data-order-info]'), function(key, each){
					var eachInfo = $(each).data('order-info');
					if (self.selPopBtnInfo.info.orderNumber == eachInfo.orderNumber) {
						cancelRequestMessage += (eachInfo.productNumber+'|'+eachInfo.orderOptionNumber+',');
					} 
				});
				controller.cancelDetail(self.selPopBtnInfo.info.orderNumber, cancelRequestMessage);
			}
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
		});
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

	function onControllerListener(e, status, response, type) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case ORDER_EVENT.ORDER_LIST:
				result.data.totalPaymentPriceDesc = util.currencyFormat(parseInt(result.data.totalPaymentPrice, 10));

				if (result.data.listOrderItems) {
					$.each(result.data.listOrderItems, function(index, orderItems) {
						orderItems.orderDate = moment(orderItems.orderDateTime).format('YYYY.MM.DD');
						
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

				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result.data);
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
			
			case ORDER_EVENT.CANCEL_DETAIL:
				displayCancelPopup(result.data, type);
				break;
			
			case ORDER_EVENT.ORDER_CANCEL:
				if (result == 200) {
					alert('주문취소가 완료되었습니다');
					location.reload(true);
				} else {
					alert(result.message);
				}
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
};