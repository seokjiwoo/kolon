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
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	OPTIONNUM_EVENT = events.OPTION_NUM,
	CHECKBOX_EVENT = events.CHECK_BOX,
	CART_EVENT = events.CART;
	
	var loginController = require('../../controller/LoginController');
	var loginDataModel = require('../../model/LoginModel');

	var orderData;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		cartList : {
			wrap : '.js-myCartShop-list',
			totalPrice : '.js-list-totalPrice'
		},
		cartOrderInfo : {
			wrap : '.js-myCartShop-orderInfo',
			price : '.js-orderInfo-price',
			discount : '.js-dicount-price',
			totalPrice : '.js-orderInfo-totalPrice'
		},
		templates : {
			wrap : '.singleCard',
			template : '#myCartShop-list-templates'
		},
		listSize : '.js-list-size',
		listDel : '.js-list-delete',
		optionNum : '.optionNum .num',
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

		// myCartShop 리스트 조회
		var productSectionCode = 'PD_PROD_SVC_SECTION_01';
		controller.myCartList(productSectionCode);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(CART_EVENT.WILD_CARD, onControllerListener);

		eventManager.on(OPTIONNUM_EVENT.CHANGE, onOptionNumChange);
		eventManager.on(CHECKBOX_EVENT.CHANGE, onCheckBoxChange);
	}

	function setDeleteEvents() {
		// 옵션 삭제 처리 - 확인필요
		$('.optList').each(function(){
			$(this).find('.js-opt-delete').click(function(e) {
				e.preventDefault();
				/*
				eventManager.trigger(OPTIONNUM_EVENT.CHANGE, [$(this).parent(), 0]);
				$(this).closest('.optList').remove();
				*/
			});
		});

		// 선택 리스트 삭제 처리
		$(self.opts.listDel).on('click', function(e) {
			e.preventDefault();

			var list = $('[data-chk-group=\'myCartShop\']').not('[data-chk-role=\'chkAll\']').filter('.on'),
			deleteList = [];

			$.each(list, function() {
				deleteList.push($(this).data('cart-number'));
			});

			if (!deleteList.length) {
				return;
			}

			// myCartShop 리스트 삭제
			controller.deleteMyCartList(deleteList);
		});
	}

	function onOptionNumChange(e, target, value) {
		var info = target.closest(self.opts.cartList.wrap).data('list-info');
		info.productQuantity = value;

		target.closest(self.opts.cartList.wrap).attr('data-list-info', JSON.stringify(info));
		displayUpdate();

		controller.updateMyCartList(info.productNumber, {
			"orderOptionNumber": target.data().optionNum,
			"optionQuantity": value,
			"productQuantity": value
		});
	}

	function onCheckBoxChange(e, target, chkGroup, chked) {
		var list = [];

		$.each(chked, function() {
			list.push($(this).closest(self.opts.cartList.wrap).get(0));
		});
		displayUpdate(list);
	}

	function displayUpdate(chked) {
		orderData = new Array();
		
		var list = chked || self.templatesWrap.find(self.opts.cartList.wrap),
		orderInfo = self.templatesWrap.find(self.opts.cartOrderInfo.wrap),
		info = {},
		value1 = 0,
		value2 = 0,
		totalBaseValue = 0,
		discountValue = 0,
		totalSaleValue = 0;

		$.each(list, function() {
			info = $(this).data('list-info');
			value1 = (info.basePrice * info.productQuantity) + info.deliveryCharge;
			value2 = (info.salePrice * info.productQuantity) + info.deliveryCharge;

			totalBaseValue += value1;
			discountValue += (info.basePrice-info.salePrice)*info.productQuantity;
			totalSaleValue += value2;

			$(this).find(self.opts.cartList.totalPrice).html(util.currencyFormat(value2));
			$(this).find(self.opts.optionNum).html(info.productQuantity);

			orderData.push({
				"productNumber": info.productNumber,
				"orderOptionNumber": info.optionNumber,
				"productQuantity": info.productQuantity,
				"optionQuantity": info.productQuantity,
			});
		});

		orderInfo.find(self.opts.cartOrderInfo.price).html(util.currencyFormat(totalBaseValue));
		orderInfo.find(self.opts.cartOrderInfo.discount).html(util.currencyFormat(discountValue));
		orderInfo.find(self.opts.cartOrderInfo.totalPrice).html(util.currencyFormat(totalSaleValue));
	}

	function displayData(data) {
		$.map(data, function(eachCartItem) {
			if (eachCartItem.deliveryCharge == null) eachCartItem.deliveryCharge = 0;
			eachCartItem.deliveryChargeDesc = util.currencyFormat(eachCartItem.deliveryCharge);
			eachCartItem.basePriceDesc = util.currencyFormat(eachCartItem.basePrice);
			eachCartItem.salePriceDesc = util.currencyFormat(eachCartItem.salePrice);

			if (util.isLocal()) {
				eachCartItem.productImageUrl = 'https://dev.koloncommon.com' + eachCartItem.productImageUrl;
			}
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

		self.templatesWrap.find(self.opts.listSize).html(self.templatesWrap.find(self.opts.cartList.wrap).size());
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case CART_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result.data.myCarts);
				displayUpdate();
				setDeleteEvents();

				$('#js-myCartShop-submit').click(function(e){
					var loginData = loginDataModel.loginData();

					if (loginData.stateCode == 'BM_MEM_STATE_01') {
						$(document).trigger('verifyMember');
					} else {
						Cookies.set('instantOrder', orderData);
						location.href = '/order/orderGoods.html';
					}
				});
				break;
			case CART_EVENT.DELETE:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
		}
	}

	function testResult() {
		win.location.reload();
	}

};