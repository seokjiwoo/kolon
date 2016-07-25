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
		controller.myCartList('PD_PROD_SVC_SECTION_01');
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
		$('').each(function(){
		});
		$('.optList .js-opt-delete').click(function(e) {
			e.preventDefault();
			if (confirm('선택하신 상품을 삭제하시겠습니까?')) {
				var deleteList = [$(this).data('cart-number')];
				controller.deleteMyCartList(deleteList);
			}
		});

		// 선택 리스트 삭제 처리
		$(self.opts.listDel).on('click', function(e) {
			e.preventDefault();
			if (confirm('선택하신 상품을 삭제하시겠습니까?')) {
				var list = $('[data-chk-group=\'myCartShop\']').not('[data-chk-role=\'chkAll\']').filter('.on');
				var deleteList = [];
				$.each(list, function() {
					deleteList.push($(this).data('cart-number'));
				});
				if (!deleteList.length) {
					alert('삭제할 상품이 없습니다.');
					return;
				}

				// myCartShop 리스트 삭제
				controller.deleteMyCartList(deleteList);
			}
		});
	}

	function onOptionNumChange(e, target, value) {
		var info = target.closest(self.opts.cartList.wrap).data('list-info');
		info.quantity = value;

		target.closest(self.opts.cartList.wrap).attr('data-list-info', JSON.stringify(info));
		displayUpdate();

		controller.updateMyCartList(info.cartNumber, {
			"productNumber": info.productNumber,
			"orderOptionNumber": info.optionNumber,
			"quantity": value
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
			value1 = (info.basePrice) + info.deliveryCharge;
			value2 = (info.salePrice) + info.deliveryCharge;

			totalBaseValue += value1;
			discountValue += info.discountPrice;
			totalSaleValue += value2;

			//$(this).find(self.opts.cartList.totalPrice).html(util.currencyFormat(value2));
			$(this).find(self.opts.optionNum).html(info.quantity);

			orderData.push({
				"productNumber": info.productNumber,
				"orderOptionNumber": info.optionNumber,
				"quantity": info.quantity
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
			eachCartItem.discountPriceDesc = util.currencyFormat(eachCartItem.discountPrice);
			

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
						$(document).trigger('verifyMember', ['MYCART_SHOP']);
					} else {
						Cookies.set('instantOrder', orderData);
						location.href = '/order/orderGoods.html';
					}
				});
				break;
			case CART_EVENT.UPDATE:
				controller.myCartList('PD_PROD_SVC_SECTION_01');
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