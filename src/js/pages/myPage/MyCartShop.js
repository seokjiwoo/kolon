/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyCartShop.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/ScrapController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	OPTIONNUM_EVENT = events.OPTION_NUM,
	CHECKBOX_EVENT = events.CHECK_BOX,
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.singleCard',
			template : '#myCartShop-list-templates'
		},
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
		displayData();
		displayUpdate();

		win.setTimeout(function() {
			// $('.optList').each(function(){
			// 	$(this).find('.btnDel').click(function(e) {
			// 		e.preventDefault();
			// 		$(this).parent().hide();
			// 	});
			// 	$(this).find('.option').eq(0).find('.btnDel').click(function(e) {
			// 		e.preventDefault();
			// 		$(this).parent().next().css('border-top','0');
			// 	});
			// });

			// $('.btnDel').on('click',function(e) {
			// 	e.preventDefault();
			// 	$(this).parent('.conDel').hide();
			// });
		}, 1000);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		eventManager.on(OPTIONNUM_EVENT.CHANGE, onOptionNumChange);
		eventManager.on(CHECKBOX_EVENT.CHANGE, onCheckBoxChange);
	}

	function onOptionNumChange(e, target, value) {
		target.closest('.js-myCartShop-list').data('list-info').productQuantity = value;
		displayUpdate();
	}

	function onCheckBoxChange(e, target, chkGroup, chked) {
		var list = [];

		$.each(chked, function() {
			list.push($(this).closest('.js-myCartShop-list').get(0));
		});
		displayUpdate(list);
	}

	function displayUpdate(chked) {
		var list = chked || self.templatesWrap.find('.js-myCartShop-list'),
		orderInfo = self.templatesWrap.find('.js-myCartShop-orderInfo'),
		info = {},
		value = 0,
		productDeliverValue = 0,
		discountValue = 0;

		$.each(list, function() {
			info = $(this).data('list-info');
			value = (info.productOrderPrice * info.productQuantity) + info.deliveryCharge - info.productSalePrice - info.productDiscountSalePrice;

			$(this).find('.js-list-totalPrice').html(util.currencyFormat(value));
			$(this).find('.optionNum .num').html(info.productQuantity);
			discountValue += info.productSalePrice;
			productDeliverValue += (info.productOrderPrice * info.productQuantity) + info.deliveryCharge;
		});

		orderInfo.find('.js-orderInfo-price').html(util.currencyFormat(productDeliverValue));
		orderInfo.find('.js-dicount-price').html(util.currencyFormat(discountValue));
		orderInfo.find('.js-orderInfo-totalPrice').html(util.currencyFormat(productDeliverValue - discountValue));
	}

	function displayData() {
		var list = [
			{
				"cartNumber": 0,
				"criteriaPyeong": "string",
				"deliveryCharge": 0,
				"discountSetupYn": "N",
				"memberNumber": 0,
				"optionUseYn": "string",
				"orderOptionName": "string",
				"orderOptionNumber": 0,
				"producerType": "string",
				"productDiscountSalePrice": 0,
				"productImageUrl": "/images/temp09.jpg",
				"productName": "productName - [코오롱] 크리스탈 샹들리에0",
				"productNumber": 0,
				"productOrderPrice": 100000,
				"productQuantity": 1,
				"productSalePrice": 0
			},
			{
				"cartNumber": 0,
				"criteriaPyeong": "string",
				"deliveryCharge": 1000,
				"discountSetupYn": "string",
				"memberNumber": 0,
				"optionUseYn": "Y",
				"orderOptionName": "orderOptionName - 모던 화이트",
				"orderOptionNumber": 0,
				"producerType": "string",
				"productDiscountSalePrice": 0,
				"productImageUrl": "/images/temp09.jpg",
				"productName": "productName - [코오롱] 크리스탈 샹들리에1",
				"productNumber": 0,
				"productOrderPrice": 100000,
				"productQuantity": 5,
				"productSalePrice": 1000
			},
			{
				"cartNumber": 0,
				"criteriaPyeong": "string",
				"deliveryCharge": 0,
				"discountSetupYn": "string",
				"memberNumber": 0,
				"optionUseYn": "Y",
				"orderOptionName": "orderOptionName - 모던 화이트",
				"orderOptionNumber": 0,
				"producerType": "string",
				"productDiscountSalePrice": 0,
				"productImageUrl": "/images/temp09.jpg",
				"productName": "productName - [코오롱] 크리스탈 샹들리에2",
				"productNumber": 0,
				"productOrderPrice": 100000,
				"productQuantity": 1,
				"productSalePrice": 0
			}
		];

		$.map(list, function(item) {
			item.deliveryChargeDesc = util.currencyFormat(item.deliveryCharge);
			item.productOrderPriceDesc = util.currencyFormat(item.productOrderPrice);
			item.productSalePriceDesc = util.currencyFormat(item.productSalePrice);
		});

		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(list));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});

		self.templatesWrap.find('.js-list-size').html(self.templatesWrap.find('.js-myCartShop-list').size());
	}
};