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
			wrap : '.js-myCartNewForm-list',
			totalPrice : '.js-list-totalPrice'
		},
		cartOrderInfo : {
			wrap : '.js-myCartNewForm-orderInfo',
			price : '.js-orderInfo-price',
			discount : '.js-dicount-price',
			delivery : '.js-order-delivery',
			totalPrice : '.js-orderInfo-totalPrice',
			moreBtn : '.js-orderInfo-more',
			moreWrap : '.js-orderInfo-more-wrap'
		},
		templates : {
			wrap : '.js-myCartNewForm-list-wrap',
			template : '#myCartNewForm-list-templates'
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

		// myCartNewForm 리스트 조회
		var productSectionCode = 'PD_PROD_SVC_SECTION_02';
		controller.myCartList(productSectionCode);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.chkedList = null;
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
		info.quantity = value;

		target.closest(self.opts.cartList.wrap).attr('data-list-info', JSON.stringify(info));
		displayUpdate();

		controller.updateMyCartList(info.productNumber, {
			"orderOptionNumber": target.data().optionNum,
			"quantity": value
		});
	}

	function onCheckBoxChange(e, target, chkGroup, chked) {
		var list = [];

		$.each(chked, function() {
			list.push($(this).closest(self.opts.cartList.wrap).get(0));
		});

		self.templatesWrap.find(self.opts.listSize).html(chked.size());

		// 체크 수량에 따라 삭제 버튼 - 활성/비활성화 처리
		if (chked.size()) {
			self.templatesWrap.find(self.opts.listDel).removeAttr('disabled');
		} else {
			self.templatesWrap.find(self.opts.listDel).attr('disabled',true);
		}

		self.chkedList = list;

		displayUpdate();
	}

	function displayUpdate() {
		orderData = new Array();
		
		var list = (self.chkedList === null) ? self.templatesWrap.find(self.opts.cartList.wrap) : self.chkedList,
		orderInfo = self.templatesWrap.find(self.opts.cartOrderInfo.wrap),
		info = {},
		value1 = 0,
		value2 = 0,
		totalBaseValue = 0,
		discountValue = 0,
		totalSaleValue = 0,
		totalDeliveryValue = 0;

		$.each(list, function() {
			info = $(this).data('list-info');
			value1 = (info.basePrice * info.quantity);// + info.deliveryCharge;
			value2 = (info.salePrice * info.quantity) + info.deliveryCharge;

			totalDeliveryValue += (info.deliveryCharge || 0);

			totalBaseValue += value1;
			discountValue += (info.basePrice-info.salePrice)*info.quantity;
			totalSaleValue += value2;

			$(this).find(self.opts.cartList.totalPrice).html(util.currencyFormat(value2));
			$(this).find(self.opts.optionNum).html(info.quantity);

			orderData.push({
				"productNumber": info.productNumber,
				"orderOptionNumber": info.optionNumber,
				"quantity": info.quantity,
			});
		});

		orderInfo.find(self.opts.cartOrderInfo.price).html(util.currencyFormat(totalBaseValue));
		orderInfo.find(self.opts.cartOrderInfo.discount).html(util.currencyFormat(discountValue));
		orderInfo.find(self.opts.cartOrderInfo.delivery).html(util.currencyFormat(totalDeliveryValue));
		orderInfo.find(self.opts.cartOrderInfo.totalPrice).html(util.currencyFormat(totalSaleValue));
	}

	function onCartOrderInfoToggler(e) {
		e.preventDefault();

		$(self.opts.cartOrderInfo.moreWrap).toggle();
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

		$(self.opts.cartOrderInfo.moreBtn).on('click', onCartOrderInfoToggler);
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

				$('#js-myCartShop-submit').click(function(e) {
					e.preventDefault();

					var loginData = loginDataModel.loginData();

					if (loginData.stateCode == 'BM_MEM_STATE_01') {
						$(document).trigger('verifyMember');
					} else {
						Cookies.set('instantOrder', orderData);
						location.href = '/order/orderService.html?fromCart=Y';
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