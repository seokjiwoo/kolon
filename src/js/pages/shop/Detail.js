/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'shop/Detail.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	cartController = require('../../controller/OrderController.js'),
	productController = require('../../controller/ProductController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCT_EVENT = events.PRODUCT,
	MEMBERINFO_EVENT = events.MEMBER_INFO;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.container',
			template : '#shop-detail-templates'
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
		
		debug.log(fileName, 'init');

		self = callerObj;
		self.opts = opts;
		self.productNumber = util.getUrlVar().productNumber;
		self.reviewNumber = util.getUrlVar().reviewNumber;

		if (debug.isDebugMode()) {
			if (!self.productNumber) {
				var productNumber = win.prompt('queryString not Found!\n\nproductNumber 를 입력하세요', '');
				location.href += '?productNumber=' + productNumber;
				return;
			}/* 리뷰는 빠졌음!!
			if (!self.reviewNumber) {
				var reviewNumber = win.prompt('queryString not Found!\n\nreviewNumber 를 입력하세요', '');
				location.href += '&reviewNumber=' + reviewNumber;
				return;
			}*/
		}
		
		setElements();
		setBindEvents();

		setBtnsEvents();

		productController.evals(self.productNumber);
		productController.info(self.productNumber);
		// info call 후에 추가
		// productController.partnerInfo(self.productNumber);
		productController.preview(self.productNumber);
		productController.related(self.productNumber);
		//productController.reviews(self.productNumber, self.reviewNumber);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(cartController).on(CART_EVENT.WILD_CARD, onControllerListener);
		$(productController).on(PRODUCT_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function setBtnsEvents() {
		$('.socialBtnOpen').on('click', onSocialOpenListener);
		$('.socialBtnClose').on('click', onSocialCloseListener);
		$('.accordion li a').on('click', onAccordionListener);

		$('.wrapper .js-add-card, .wrapper .js-prd-buy').on('click', onCartBuyListener);
	}

	function destoryBtnsEvents() {
		$('.socialBtnOpen').off('click', onSocialOpenListener);
		$('.socialBtnClose').off('click', onSocialCloseListener);
		$('.accordion li a').off('click', onAccordionListener);

		$('.wrapper .js-add-card, .wrapper .js-prd-buy').off('click', onCartBuyListener);
	}

	function onSocialOpenListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);
		if (target.parent('.socialBtn').hasClass('active')) {
			target.parent('.socialBtn').removeClass('active');
		} else {
			target.parent('.socialBtn').removeClass('active').addClass('active');
		}
	}

	function onSocialCloseListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);
		target.parent('.socialBtn').removeClass('active');
	}

	function onAccordionListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);
		if (target.parent('li').hasClass('on')) {
			target.parent('li').removeClass('on');
		} else {
			target.parent('li').removeClass('on').addClass('on');
		}
	}

	function onCartBuyListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		isLogin = eventManager.triggerHandler(MEMBERINFO_EVENT.IS_LOGIN),
		orderGoodsUrl = '',
		data = {};

		if (!isLogin) {
			win.alert('로그인이 필요합니다.');
			location.href = '/member/login.html';
			return;
		}

		if (target.hasClass('js-add-card')) {
			data = [
				{
					"myCartAddCompositions": [
						{
							"addCompositionProductNumber": 0,
							"addCompositionProductQuantity": 0,
							"orderOptionNumber": 0
						}
					],
					"optionQuantity": 0,
					"orderOptionNumber": 0,
					"productNumber": parseInt(self.productNumber, 10),
					"productQuantity": 0
				}
			];

			// 옵션 유무에 따라 인터렉션 달라짐 - ppt114
			// 옵션이 없을 경우 confirm '선택하신 상품을 마이커먼에 담았습니다. 바로 확인 하시겠습니까?';
			$('.js-ajax-data').html('ajax 전송 data : ' + JSON.stringify(data));
			cartController.addMyCartList(data);
		} else {
			orderGoodsUrl = '/order/orderGoods.html';
			orderGoodsUrl += '?productNumber=' + (self.productNumber || 1);
			orderGoodsUrl += '&orderOptionNumber=' + (self.orderOptionNumber || 1);
			orderGoodsUrl += '&quantity=' + (self.quantity || 1);

			location.href = orderGoodsUrl;
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, template, templatesWrap) {
		template = template || self.template;
		templatesWrap = templatesWrap || self.templatesWrap;

		var source = template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		templatesWrap.imagesLoaded()
							.always(function() {
								templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								destoryBtnsEvents();
								setBtnsEvents();
							});
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			// default:
			// 	dummyData = [];

			// 	/*
			// 	401	Unauthorized
			// 	403	Forbidden
			// 	404	Not Found
			// 	 */
			// 	switch(status) {
			// 		case 200:
			// 			break;
			// 		default:
			// 			win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
			// 			result = dummyData;
			// 			break;
			// 	}

			// 	debug.log(fileName, 'onControllerListener', eventType, status, response);
			// 	displayData(result);
			// 	break;

			// [S] CART - 장바구니
				case CART_EVENT.ADD:
					switch (status) {
						case 200:
							// 옵션 유무에 따라 인터렉션 달라짐 - ppt114
							// 옵션이 없을 경우 confirm '선택하신 상품을 마이커먼에 담았습니다. 바로 확인 하시겠습니까?';
							if (win.confirm('선택하신 상품을 마이커먼에 담았습니다.\n바로 확인 하시겠습니까?')) {
								location.href = '/myPage/';
							}
							break;
						default:
							break;
					}
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
			// [E] CART - 장바구니

			// [S] PRODUCT - 상품
				case PRODUCT_EVENT.EVALS:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));

					displayData(result, $('#detail-events-templates'), $('.js-detail-events-wrap'));
					displayData(result, $('#detail-tags-templates'), $('.js-detail-tags-wrap'));
					break;
				case PRODUCT_EVENT.INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));

					if (result && result.data && result.data.product) {
						$.each(result.data, function(index, product) {
							product.basePriceDesc = util.currencyFormat(parseInt(product.basePrice, 10));
							product.salePriceDesc = util.currencyFormat(parseInt(product.salePrice, 10));
						});
					}
					displayData(result.data.product, $('#detail-info-templates'), $('.js-detail-info-wrap'));

					productController.partnerInfo(self.productNumber);
					break;
				case PRODUCT_EVENT.PARTNER_INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));

					displayData(result.data.partner, $('#detail-partner-templates'), $('.js-detail-partner-wrap'));
					break;
				case PRODUCT_EVENT.PREVIEW:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCT_EVENT.RELATED:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCT_EVENT.REVIEWS:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
			// [E] PRODUCT - 상품
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