/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyCartNewForm.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/MyPageController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CHECKBOX_EVENT = events.CHECK_BOX,
	CART_EVENT = events.CART;

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		newFormList : {
			wrap : '.js-myCartNewForm-list',
			totalPrice : '.js-list-totalPrice'
		},
		templates : {
			wrap : '.singleCard',
			template : '#myCartNewForm-list-templates'
		},
		listSize : '.js-list-size',
		listDel : '.js-list-delete',
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		// myCartNewForm 리스트 조회
		var productSectionCode = 'PD_PROD_TYPE_02';
		controller.myCartList(productSectionCode);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(CART_EVENT.WILD_CARD, onControllerListener);

		eventManager.on(CHECKBOX_EVENT.CHANGE, onCheckBoxChange);
	}

	function setDeleteEvents() {
		// 선택 리스트 삭제 처리
		$(self.opts.listDel).on('click', function(e) {
			e.preventDefault();

			var list = $('[data-chk-group=\'myCartNewForm\']').not('[data-chk-role=\'chkAll\']').filter('.on'),
			deleteList = [];

			$.each(list, function() {
				deleteList.push($(this).data('cart-number'));
			});

			if (!deleteList.length) {
				return;
			}

			// myCartNewForm 리스트 삭제
			controller.deleteMyCartList(deleteList);
		});
	}

	function onCheckBoxChange(/*e, target, chkGroup, chked*/) {
	}

	function displayData(data) {
		$.map(data, function(item) {
			item.deliveryChargeDesc = util.currencyFormat(item.deliveryCharge);
			item.productOrderPriceDesc = util.currencyFormat(item.productOrderPrice);
			item.productSalePriceDesc = util.currencyFormat(item.productSalePrice);
		});

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

		self.templatesWrap.find(self.opts.listSize).html(self.templatesWrap.find(self.opts.newFormList.wrap).size());
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case CART_EVENT.LIST:
				dummyData = [{"cartNumber":0,"criteriaPyeong":"criteriaPyeong","deliveryCharge":0,"discountSetupYn":"N","memberNumber":0,"optionUseYn":"string","orderOptionName":"string","orderOptionNumber":0,"producerType":"producerType","productDiscountSalePrice":0,"productImageUrl":"/images/temp09.jpg","productName":"productName - [코오롱] 크리스탈 샹들리에0","productNumber":0,"productOrderPrice":100000,"productQuantity":1,"productSalePrice":0},{"cartNumber":1,"criteriaPyeong":"string","deliveryCharge":1000,"discountSetupYn":"string","memberNumber":0,"optionUseYn":"Y","orderOptionName":"orderOptionName - 모던 화이트","orderOptionNumber":0,"producerType":"string","productDiscountSalePrice":0,"productImageUrl":"/images/temp09.jpg","productName":"productName - [코오롱] 크리스탈 샹들리에1","productNumber":0,"productOrderPrice":100000,"productQuantity":5,"productSalePrice":1000},{"cartNumber":2,"criteriaPyeong":"string","deliveryCharge":0,"discountSetupYn":"string","memberNumber":0,"optionUseYn":"Y","orderOptionName":"orderOptionName - 모던 화이트","orderOptionNumber":0,"producerType":"string","productDiscountSalePrice":0,"productImageUrl":"/images/temp09.jpg","productName":"productName - [코오롱] 크리스탈 샹들리에2","productNumber":0,"productOrderPrice":100000,"productQuantity":1,"productSalePrice":0}];

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
						result = dummyData;
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				setDeleteEvents();
				break;
			case CART_EVENT.DELETE:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				 */
				/*
				204	No Content
				401	Unauthorized
				403	Forbidden
				 */
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
		}
	}

	function testResult() {
		win.alert('임시처리 결과처리 - location.reload');
		win.location.reload();
	}

};