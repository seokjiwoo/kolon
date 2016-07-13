/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'order/OrderGoods.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ORDER_EVENT = events.ORDER;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			delivery1 : {
				wrap : '.delivery1',
				template : '#order-delivery1-templates',
			},
			delivery2 : {
				wrap : '.delivery2',
				template : '#order-delivery2-templates',	
			},
			wrap : '.test',
			template : '#order-goods-templates'
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


		self.productNumber = util.getUrlVar().productNumber;
		self.orderOptionNumber = util.getUrlVar().orderOptionNumber;
		self.quantity = util.getUrlVar().quantity;

		if (!self.productNumber) {
			var productNumber = win.prompt('queryString not Found!\n\nproductNumber 를 입력하세요', '');
			location.href += '?productNumber=' + productNumber;
			return;
		}

		if (!self.orderOptionNumber) {
			var orderOptionNumber = win.prompt('queryString not Found!\n\norderOptionNumber 를 입력하세요', '');
			location.href += '&orderOptionNumber=' + orderOptionNumber;
			return;
		}

		if (!self.quantity) {
			var quantity = win.prompt('queryString not Found!\n\nquantity 를 입력하세요', '');
			location.href += '&quantity=' + quantity;
			return;
		}

		setElements();
		setBindEvents();

		controller.myOrdersInfo([
			{
				'productNumber': self.productNumber,
				'orderOptionNumber': self.orderOptionNumber,
				'quantity': self.quantity
			}
		]);
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
		var delivery1 = self.opts.templates.delivery1,
		delivery2 = self.opts.templates.delivery2,
		source, template, insertElements;

		source = $(delivery1.template).html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(data));

		$(delivery1.wrap).empty()
							.append(insertElements)
							.imagesLoaded()
							.always(function() {
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});


		source = $(delivery2.template).html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(data));
		
		$(delivery2.wrap).empty()
							.append(insertElements)
							.imagesLoaded()
							.always(function() {
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case ORDER_EVENT.ORDERS_INFO:
				dummyData = {
					"addresses": [
						{
							"addressManagementName": "회사",
							"addressSectionCode": "BM_ADDR_SECTION_01",
							"addressSectionCodeName": "회원주소",
							"addressSequence": 1,
							"cellPhoneNumber": "01012344321",
							"detailAddress": "1202호",
							"generalPhoneNumber": "021231234",
							"lotBaseAddress": "서울시 종로구 운니동 98-78번지 가든타워",
							"memberNumber": 1,
							"receiverName": "홍길동",
							"roadBaseAddress": "서울시 종로구 율곡로 84",
							"zipCode": "123456"
						}
					],
					"banks": [
						{
							"bankName": "한국은행",
							"code": "001"
						}
					],
					"cards": [
						{
							"cardCompanyName": "비씨",
							"code": "01"
						}
					],
					"orderNumber": "string",
					"paymentInfo": {
						"leftPoint": "1050",
						"savingPoint": "1300",
						"totalDiscountPrice": "200000",
						"totalOrderPrice": "1500000",
						"totalPaymentPrice": "1300000"
					},
					"pgInfo": {
						"buyerAddr": "string",
						"buyerEmail": "string",
						"buyerName": "string",
						"buyerTel": "string",
						"ediDate": "20160708235011",
						"encodeParameters": "string",
						"encryptData": "string",
						"goodsCl": "string",
						"goodsCnt": "string",
						"goodsName": "string",
						"mallIp": "111.222.121.212",
						"mallUserID": "string",
						"mid": "string",
						"moid": "string",
						"optionList": "string",
						"socketYN": "string",
						"sub_ID": "string",
						"trKey": "string",
						"userIp": "1.2.3.4",
						"vbankExpDate": "string"
					},
					"products": [
						{
							"deliveryCharge": 2500,
							"discountPrice": 400000,
							"orderOptionName": "화이트 우드무늬",
							"orderOptionNum": 654,
							"paymentPrice": 2600000,
							"pointInfo": "PD_POINT_PAY_METHOD_01:10.00:5000",
							"productImageUrl": "http://uppp.oneplat.net/img/iiii.jpg",
							"productName": "테이블",
							"productNumber": 5,
							"productOptionPrice": 1500000,
							"productPrice": 3000000,
							"quantity": 2
						}
					]
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

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
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
};