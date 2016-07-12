/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Order.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ORDER_EVENT = events.ORDER,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-order-wrap',
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
		Super.init();
		
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

	function getOrderList(keyword, deliveryStateCode) {
		keyword = keyword || '';
		deliveryStateCode = deliveryStateCode || '';

		controller.myOrdersList(
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
			isConfirm = win.confirm('선택하신 상품의 구매를 확정하시겠습니까?');
		}

		if (isConfirm) {
			controller.orderConfirm(self.selPopBtnInfo.info.orderNumber, self.selPopBtnInfo.info.orderProductSequence);
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function setColoboxEvevnts() {
		// 취소신청
		if (self.colorbox.hasClass('popOrderCancelRequest')) {
			controller.orderDetail(self.selPopBtnInfo.info.orderNumber);
		}

		// 배송추적
		if (self.colorbox.hasClass('popOrderDelivery')) {
			controller.orderTrackingInfo(
				self.selPopBtnInfo.info.orderNumber,
				self.selPopBtnInfo.info.orderProductSequence,
				self.selPopBtnInfo.info.deliveryNumber,
				self.selPopBtnInfo.info.orderNumber
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

		debug.log(fileName, 'onDropCheckMenuChange', target, target.val(), data);
		getOrderList(self.searchInp.val(), data.values.join(','));
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
		getOrderList(self.searchInp.val());
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
			$('.js-picker-to').datepicker('option', 'minDate', win.moment($('.js-alt-from').val()).format('YYYY-MM-DD'));
			e.stopPropagation();

			getOrderList();
		});
	}

	function onControllerListener(e, status, response/*, elements*/) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case ORDER_EVENT.ORDER_LIST:
				dummyData = {"cellPhoneNum":"string","discountPrice":0,"generalPhoneNum":"string","listOrderItems":[{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_01","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"},{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_02","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"},{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_03","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"},{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_04","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"},{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_05","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"},{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_06","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"}],"optionNumber":"string","orderCancelCode":"string","orderCencelDesc":"string","orderDate":"string","orderNumber":0,"ordererEmail":"string","ordererId":"string","ordererName":"string","productNumber":"string","receiverName":"string","sellerId":"string","sellerName":"string","totalPaymentPrice":0,"totalPrice":0};
				if (self.isDebug && self.isFilter) {
					dummyData = {"cellPhoneNum":"string","discountPrice":0,"generalPhoneNum":"string","listOrderItems":[{"deliveryAddressNumber":"string","deliveryFee":"string","deliveryNumber":"string","deliveryState":"string","deliveryStateCode":"SL_ORDER_STATE_01","discountPrice":0,"itemCount":0,"itemPrice":0,"optionName":"string","optionNumber":"string","orderItemReceiver":{"addrSeq":"string","addressManagementName":"string","deliveryAddressNumber":"string","deliveryRequestMemo":"string","receiverDetailAddress":"string","receiverLotBaseAddress":"string","receiverName":"string","receiverRoadBaseAddress":"string","receiverTel1":"string","receiverTel2":"string","zipCode":"string"},"orderProductSequence":"string","paymentPrice":0,"productImageUrl":"../images/temp09.jpg","productName":"string","productNumber":"string","receiverName":"string","sellerName":"string","sellerNumber":"string"}],"optionNumber":"string","orderCancelCode":"string","orderCencelDesc":"string","orderDate":"string","orderNumber":0,"ordererEmail":"string","ordererId":"string","ordererName":"string","productNumber":"string","receiverName":"string","sellerId":"string","sellerName":"string","totalPaymentPrice":0,"totalPrice":0};
				}
				self.isFilter = !self.isFilter;

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}

				result.totalPaymentPriceDesc = util.currencyFormat(parseInt(result.totalPaymentPrice, 10));

				if (result.listOrderItems) {
					$.each(result.listOrderItems, function(index, val) {
						val.itemPriceDesc = util.currencyFormat(parseInt(val.itemPrice, 10));
					});
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				break;

			case ORDER_EVENT.ORDER_CONFIRM:
				switch(status) {
					case 200:
						window.alert('구매가 확정되었습니다.');
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;

			case ORDER_EVENT.ORDER_DETAIL:
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;

			case ORDER_EVENT.ORDER_TRACKING:
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
		}
	}
};