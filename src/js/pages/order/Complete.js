/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'order/Complete.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	ORDER_EVENT = events.ORDER,
	COLORBOX_EVENT = events.COLOR_BOX;

	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-order-complete-wrap',
			template : '#order-complete-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		debug.log(fileName, $, util, controller, eventManager, events, COLORBOX_EVENT);

		self = callerObj;
		self.opts = opts;

		self.orderNumber = util.getUrlVar().orderNumber;

		setElements();
		setBindEvents();

		// myInfoResultHandler - 호출후 실행하는 형태 구성
		// controller.ordersComplete(self.orderNumber);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
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

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			default:
				dummyData = {
					"status": "200",
					"message": "ok",
					"data": {
						"savingSchedPoint": 0,
						"listOrderItem": [],
						"paymentInfo": {
							"orderPrice": 0,
							"discountPrice": 0,
							"deliveryCharge": 0,
							"totalPaymentPrice": 0,
							"slCreditCard": null,
							"slDwb": null,
							"slAccountTransfer": null
						}
					}
				};

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						// win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
						result = dummyData;
						break;
				}

				result.data.vxMemberName = self.memberName;
				result.data.vxOrderNumber = self.orderNumber;
				result.data.vxOrderDate = win.moment(new Date()).format('YYYY년 MM월 DD일');

				result.data.savingSchedPointDesc = util.currencyFormat(result.data.savingSchedPoint, 10);
				result.data.paymentInfo.orderPriceDesc = util.currencyFormat(result.data.paymentInfo.orderPrice, 10);
				result.data.paymentInfo.discountPriceDesc = util.currencyFormat(result.data.paymentInfo.discountPrice, 10);
				result.data.paymentInfo.deliveryChargeDesc = util.currencyFormat(result.data.paymentInfo.deliveryCharge, 10);
				result.data.paymentInfo.totalPaymentPriceDesc = util.currencyFormat(result.data.paymentInfo.totalPaymentPrice, 10);

				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				if (result.data.slCreditCard != null) {
					result.data.paymentInfo.method = '신용카드';
				} else if (result.data.slDwb != null) {
					result.data.paymentInfo.method = '무통장 입금';
				} else if (result.data.slAccountTransfer != null) {
					result.data.paymentInfo.method = '실시간 계좌이체';
				}
				displayData(result.data);
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}


	function myInfoResultHandler(e) {
		var loginData = loginDataModel.loginData();

		if (loginData == null) {
			alert('로그인이 필요한 페이지입니다');
			location.href = '/member/login.html';
		} else {
			self.memberName = loginData.memberName;
			controller.ordersComplete(self.orderNumber);
		}
	}

};