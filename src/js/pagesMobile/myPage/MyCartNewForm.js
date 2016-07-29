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
			totalPrice : '.js-orderInfo-totalPrice',
			moreWrap : '.js-orderInfo-more-wrap',
			moreBtn : '.js-orderInfo-more'
		},
		templates : {
			wrap : '.singleCard',
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

		// myCartShop 리스트 조회
		controller.myCartList('PD_PROD_SVC_SECTION_02');
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(CART_EVENT.WILD_CARD, onControllerListener);

		// eventManager.on(OPTIONNUM_EVENT.CHANGE, onOptionNumChange);
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
				var list = $('[data-chk-group=\'myCartNewForm\']').not('[data-chk-role=\'chkAll\']').filter('.on');
				var deleteList = [];
				$.each(list, function() {
					deleteList.push($(this).data('cart-number'));
				});
				if (!deleteList.length) {
					alert('삭제할 상품이 없습니다.');
					return;
				}

				// myCartNewForm 리스트 삭제
				controller.deleteMyCartList(deleteList);
			}
		});

		// $('[data-option-num]').on('change', function() {
		// 	var target = $(this),
		// 	value = parseInt($(this).val(), 10),
		// 	info = target.closest(self.opts.cartList.wrap).data('list-info');
		// 	info.quantity = value;

		// 	target.closest(self.opts.cartList.wrap).attr('data-list-info', JSON.stringify(info));
		// 	displayUpdate();

		// 	controller.updateMyCartList(info.cartNumber, {
		// 		"productNumber": info.productNumber,
		// 		"orderOptionNumber": info.optionNumber,
		// 		"quantity": value
		// 	});
		// });
	}

	// function onOptionNumChange(e, target, value) {
	// 	var info = target.closest(self.opts.cartList.wrap).data('list-info');
	// 	info.quantity = value;

	// 	target.closest(self.opts.cartList.wrap).attr('data-list-info', JSON.stringify(info));
	// 	displayUpdate();

	// 	controller.updateMyCartList(info.cartNumber, {
	// 		"productNumber": info.productNumber,
	// 		"orderOptionNumber": info.optionNumber,
	// 		"quantity": value
	// 	});
	// }

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
			
			totalSaleValue += value2;

			//$(this).find(self.opts.cartList.totalPrice).html(util.currencyFormat(value2));
			$(this).find(self.opts.optionNum).html(info.quantity);

			orderData.push({
				"productNumber": info.productNumber,
				"productOptionNumber": info.productOptionNumber
			});
		});

		orderInfo.find(self.opts.cartOrderInfo.price).html(util.currencyFormat(totalSaleValue));
		orderInfo.find(self.opts.cartOrderInfo.totalPrice).html(util.currencyFormat(totalSaleValue));

		$('.js-list-size').text(orderData.length);
	}

	function onCartOrderInfoToggler(e) {
		e.preventDefault();

		$(self.opts.cartOrderInfo.moreWrap).toggle();
		$(this).toggleClass('opened');
	}

	function displayData(data) {
		$.map(data, function(eachCartItem) {
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
				console.log('result.data.myCarts', result.data.myCarts.length)
				displayData(result.data.myCarts);
				displayUpdate();
				setDeleteEvents();

				$('.js-myCartNewForm-order').click(function(e){
					var loginData = loginDataModel.loginData();

					if (loginData.stateCode == 'BM_MEM_STATE_01') {
						$(document).trigger('verifyMember', ['MYCART_NEWFORM']);
					} else {
						Cookies.set('instantNFOrder', [$(this).data('order-info')]);
						location.href = '/order/orderService.html?fromCart=Y';
					}
				});

				$('#js-myCartNewForm-submit').click(function(e){
					var loginData = loginDataModel.loginData();

					if (!orderData.length) {
						win.alert('실측 신청하실 상품을 선택해주세요.');
						return;
					}

					if (loginData.stateCode == 'BM_MEM_STATE_01') {
						$(document).trigger('verifyMember', ['MYCART_NEWFORM']);
					} else {
						Cookies.set('instantNFOrder', orderData);
						location.href = '/order/orderService.html?fromCart=Y';
					}
				});
				break;
			case CART_EVENT.UPDATE:
				controller.myCartList('PD_PROD_SVC_SECTION_02');
				break;
			case CART_EVENT.DELETE:
				switch(status) {
					case 200:
						win.location.reload();
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				break;
		}
	}

};