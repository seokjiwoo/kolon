/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'order/CompleteAdvance.js';

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
				result.data.vxMemberName = self.memberName;
				result.data.vxOrderNumber = self.orderNumber;
				result.data.vxOrderDate = win.moment(new Date()).format('YYYY년 MM월 DD일');

				result.data.constPaymentInfo.method = result.data.constPaymentInfo.paymentMethods[0].paymentMethodCodeName;
				result.data.constPaymentInfo.totalPriceDesc = util.currencyFormat(result.data.constPaymentInfo.paymentPrice.totalProductPrice);
				result.data.constPaymentInfo.totalDiscountPriceDesc = util.currencyFormat(result.data.constPaymentInfo.paymentPrice.totalDiscountPrice);
				result.data.constPaymentInfo.totalConstExpectPriceDesc = util.currencyFormat(result.data.constPaymentInfo.paymentPrice.totalConstExpectPrice);
				result.data.constPaymentInfo.totalAdvancePriceDesc = util.currencyFormat(result.data.constPaymentInfo.paymentPrice.totalAdvancePrice);
				
				if (result.data.constOrderInfo && result.data.constOrderInfo.receiverContact) {
					result.data.constOrderInfo.receiverContact = util.mobileNumberFormat(result.data.constOrderInfo.receiverContact);
				}

				$.map(result.data.constProducts, function(eachItem){
					eachItem.constExpectPriceDesc = util.currencyFormat(eachItem.constExpectPrice);
					eachItem.productPriceDesc = util.currencyFormat(eachItem.productPrice);
					eachItem.discountPriceDesc = util.currencyFormat(eachItem.discountPrice);
				});
				
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
			$(document).trigger('needLogin');
		} else {
			self.memberName = loginData.memberName;
			controller.ordersAdvanceComplete(self.orderNumber);
		}
	}

};