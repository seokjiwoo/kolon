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
	DropDownScroll = require('../../components/DropDownScroll'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCT_EVENT = events.PRODUCT,
	OPTIONNUM_EVENT = events.OPTION_NUM,
	MEMBERINFO_EVENT = events.MEMBER_INFO;
 
	var optionsUseFlag;
	var optionsDataArray;
	var orderData = {
		"myCartAddCompositions": [],
		"optionQuantity": 0,
		"orderOptionNumber": 0,
		"productNumber": 0,
		"productQuantity": 0
	};
	var salePrice;
	var totalQty;

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
		//self.reviewNumber = util.getUrlVar().reviewNumber;

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

		//productController.evals(self.productNumber);
		productController.info(self.productNumber);
		// info call 후에 추가
		productController.partnerInfo(self.productNumber);
		//productController.preview(self.productNumber);
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
		eventManager.on(OPTIONNUM_EVENT.CHANGE, optionChangeHandler);
	}

	function setBtnsEvents() {
		$('.socialBtnOpen').on('click', onSocialOpenListener);
		$('.socialBtnClose').on('click', onSocialCloseListener);
		$('.accordion li a').on('click', onAccordionListener);

		$('.wrapper .js-add-cart, .wrapper .js-prd-buy').on('click', onCartBuyListener);
	}

	function destoryBtnsEvents() {
		$('.socialBtnOpen').off('click', onSocialOpenListener);
		$('.socialBtnClose').off('click', onSocialCloseListener);
		$('.accordion li a').off('click', onAccordionListener);

		$('.wrapper .js-add-cart, .wrapper .js-prd-buy').off('click', onCartBuyListener);
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
		orderGoodsUrl = '';

		if (!isLogin) {
			win.alert('로그인이 필요합니다.');
			location.href = '/member/login.html';
			return;
		}
		if (target.hasClass('js-option-open')) {
			$('.detailBottomTab .bottomTabWrap').toggleClass('active');
			
			if ($('.detailBottomTab .bottomTabWrap').hasClass('active')) {
				$('.optionScroll').height($('.optionList').height());
				self.optionIScroll.refresh();
			}
			return;
		}

		if ($('.detailBottomTab .bottomTabWrap').hasClass('active')) {
			if (target.hasClass('js-add-cart')) {
				addCart();
			} else if (target.hasClass('js-prd-buy')) {
				orderGoods();
			}
		} else {
			if (optionsUseFlag) {
				$('.detailBottomTab .bottomTabWrap').addClass('active');
				$('.optionScroll').height($('.optionList').height());
				self.optionIScroll.refresh();
			} else {
				if (target.hasClass('js-add-cart')) {
					addCart();
				} else if (target.hasClass('js-prd-buy')) {
					orderGoods();
				}
			}
		}
	}

	function addCart() {
		if (optionsUseFlag && orderData.myCartAddCompositions.length == 0) {
			alert('옵션을 선택해주세요.');
		} else {
			updateDataQty();
			$('.js-ajax-data').html('ajax 전송 data : ' + JSON.stringify(orderData));
			
			cartController.addMyCartList(orderData);
		}
	};

	function orderGoods() {
		if (optionsUseFlag && orderData.myCartAddCompositions.length == 0) {
			alert('옵션을 선택해주세요.');
		} else {
			updateDataQty();
			Cookies.set('instantOrder', orderData);
			location.href = '/order/orderGoods.html';
		}
	};

	function updateDataQty() {
		orderData.optionQuantity = 0;
		if (optionsUseFlag) {
			orderData.productQuantity = 0;
			for (var key in orderData.myCartAddCompositions) {
				var eachOptions = orderData.myCartAddCompositions[key];
				orderData.optionQuantity += eachOptions.addCompositionProductQuantity;
				orderData.productQuantity += eachOptions.addCompositionProductQuantity;
			}
		} else {
			orderData.productQuantity = totalQty;
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
			/*	case PRODUCT_EVENT.EVALS:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					$.map(result, function(each) {
						console.log(result);
					});

					displayData(result, $('#detail-events-templates'), $('.js-detail-events-wrap'));
					displayData(result, $('#detail-tags-templates'), $('.js-detail-tags-wrap'));
					break;*/
				case PRODUCT_EVENT.INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					
					orderData.productNumber = result.data.product.productNumber;
					orderData.optionQuantity = 0;
					orderData.productQuantity = 0;
					orderData.orderOptionNumber = 0;
					orderData.myCartAddCompositions = new Array();

					optionsDataArray = new Array();
					salePrice = result.data.product.salePrice;
					optionsUseFlag = (result.data.product.optionUseYn == 'Y');

					if (result && result.data && result.data.product) {
						$.each(result.data, function(index, product) {
							product.basePriceDesc = util.currencyFormat(parseInt(product.basePrice, 10));
							product.salePriceDesc = util.currencyFormat(parseInt(product.salePrice, 10));

							$.each(product.criteriaOptions, function(index, options) {
								$.each(options.options, function(optIndex, eachOptions) {
									eachOptions.price = util.currencyFormat(parseInt(eachOptions.price, 10));
									if (optionsDataArray[index] == undefined) optionsDataArray[index] = new Array();
									optionsDataArray[index][parseInt(eachOptions.orderOptionNumber)] = eachOptions;
								});
							});
						});
					}
					
					displayData(result.data.product, $('#shop-detail-description-templates'), $('.shop-detail-description-wrap'));
					displayData(result.data.product, $('#detail-info-templates'), $('.js-detail-info-wrap'));
					displayData(result.data.product, $('#detail-criteria-options-templates'), $('#criteria-options-wrap'));
					
					$('.optionScroll').height($('.optionList').height());
					if (!optionsUseFlag) {
						var oneOptionData = [{
							"addCompositionProductNumber": result.data.product.productNumber,
							"addCompositionProductQuantity": 1,
							"orderOptionNumber": '0',
							"name": result.data.product.productName,
							"price": result.data.product.salePrice
						}];
						displayData(oneOptionData, $('#detail-selected-options-templates'), $('#selectedOptionList'));
						totalQty = 1;
						$('.cancelOption').hide();
					}
					if ($('.optionList').find('li').size() > 3) {
						$('.optionScroll').closest('.activeRight').addClass('has-iscroll');
						$('.optionScroll').on('mousewheel', function(e) {
							e.preventDefault();
						});
					}
					self.optionIScroll = new win.IScroll('.optionScroll', {
						scrollbars: true,
						mouseWheel: true,
						fadeScrollbars: false,
						bounce: false
					});

					$('.js-add-cart, .js-option-open').on('click', onCartBuyListener);
					DropDownScroll.refresh();
					$('.optionListDrop').on(DropDownScroll.EVENT.CHANGE, optionSelectHandler);

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

	function optionSelectHandler(e, data) {
		e.preventDefault();
		var optionAddress = data.values.split("-");
		var selectedOptionData = optionsDataArray[parseInt(optionAddress[0])][parseInt(optionAddress[1])];
		
		var addKey = true;
		for (var key in orderData.myCartAddCompositions) {
			var eachOptions = orderData.myCartAddCompositions[key];
			if (eachOptions.orderOptionNumber == selectedOptionData.orderOptionNumber) addKey = false;
		}
		if (addKey) {
			orderData.myCartAddCompositions.push({
				"addCompositionProductNumber": orderData.productNumber,
				"addCompositionProductQuantity": 1,
				"orderOptionNumber": selectedOptionData.orderOptionNumber,
				"name": selectedOptionData.optionName,
				"price": selectedOptionData.price
			});
		}

		displayData(orderData.myCartAddCompositions, $('#detail-selected-options-templates'), $('#selectedOptionList'));
		$('.optionScroll').height($('.optionList').height());
		self.optionIScroll.refresh();

		$('.cancelOption').click(optionRemoveHandler);
		
		var totalPrice = reCalculateTotalPrice(orderData);
		$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
	};

	function optionChangeHandler(e, value) {
		var newQty = parseInt(value.find('.num').text());
		totalQty = newQty;

		if (optionsUseFlag) {
			for (var key in orderData.myCartAddCompositions) {
				var eachOptions = orderData.myCartAddCompositions[key];
				if (eachOptions.orderOptionNumber == value.data().optionNum) eachOptions.addCompositionProductQuantity = newQty;
			}
			
			var totalPrice = reCalculateTotalPrice(orderData);
			$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
		} else {
			$('#totalOptionsPrice').html(util.currencyFormat(salePrice*newQty)+'<b>원</b>');
		}
	};

	function optionRemoveHandler(e) {
		e.preventDefault();
		for (var key in orderData.myCartAddCompositions) {
			var eachOptions = orderData.myCartAddCompositions[key];
			console.log(eachOptions.orderOptionNumber, $(this).data().optionNum);
			if (eachOptions.orderOptionNumber == $(this).data().optionNum) {
				console.log(key);
				orderData.myCartAddCompositions.splice(key, 1);
			}
		}

		displayData(orderData.myCartAddCompositions, $('#detail-selected-options-templates'), $('#selectedOptionList'));
		$('.optionScroll').height($('.optionList').height());
		self.optionIScroll.refresh();

		$('.cancelOption').click(optionRemoveHandler);
		
		var totalPrice = reCalculateTotalPrice(orderData);
		$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
	};

	function reCalculateTotalPrice(orderData) {
		var newTotalPrice = 0;

		for (var key in orderData.myCartAddCompositions) {
			var eachOptions = orderData.myCartAddCompositions[key];
			newTotalPrice += (util.removeComma(eachOptions.price)*eachOptions.addCompositionProductQuantity);
		}

		return newTotalPrice;
	};

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}
};