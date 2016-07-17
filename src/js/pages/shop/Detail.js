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
 
 	var criteriaOptionCount;
	var optionsUseFlag;
	var optionsDataArray;
	var orderData;
	var selectedOptions;
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
		$('#sellerCard').bxSlider({
			pager:false,
			slideMargin: 10,
			minSlides: 2,
			maxSlides: 2,
			slideWidth: 285
		});
		$.each($('.slider04'), function(){
			$(this).bxSlider({
				pager:false,
				slideMargin: 10,
				minSlides: 4,
				maxSlides: 4,
				slideWidth: 285
			});
		})
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
		eventManager.on(OPTIONNUM_EVENT.CHANGE, optionQtyChangeHandler);
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
		if (optionsUseFlag && orderData.length == 0) {
			alert('옵션을 선택해주세요.');
		} else {
			var cartData = orderData.concat();
			$.map(cartData, function(each) {
				delete each.name;
				delete each.price;
			});

			$('.js-ajax-data').html('ajax 전송 data : ' + JSON.stringify(cartData));
			
			cartController.addMyCartList(cartData);
		}
	};

	function orderGoods() {
		if (optionsUseFlag && orderData.length == 0) {
			alert('옵션을 선택해주세요.');
		} else {
			Cookies.set('instantOrder', orderData);
			location.href = '/order/orderGoods.html';
		}
	};

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
			// [S] CART - 장바구니
				case CART_EVENT.ADD:
					switch (status) {
						case 200:
							// 옵션 유무에 따라 인터렉션 달라짐 - ppt114
							// 옵션이 없을 경우 confirm '선택하신 상품을 마이커먼에 담았습니다. 바로 확인 하시겠습니까?';
							if (win.confirm('선택하신 상품을 마이커먼에 담았습니다.\n바로 확인 하시겠습니까?')) {
								location.href = '/myPage/myCartShop.html';
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

					orderData = new Array();

					criteriaOptionCount = result.data.product.criteriaOptionCount;
					optionsDataArray = new Array();
					selectedOptions = new Array();
					salePrice = result.data.product.salePrice;
					optionsUseFlag = (result.data.product.optionUseYn == 'Y');

					if (result && result.data && result.data.product) {
						$.each(result.data, function(index, product) {
							product.basePriceDesc = util.currencyFormat(parseInt(product.basePrice, 10));
							product.salePriceDesc = util.currencyFormat(parseInt(product.salePrice, 10));
						});
					}
					
					displayData(result.data.product, $('#shop-detail-description-templates'), $('.shop-detail-description-wrap'));
					displayData(result.data.product, $('#detail-info-templates'), $('.js-detail-info-wrap'));
					displayData(result.data.product, $('#detail-criteria-options-templates'), $('#criteria-options-wrap'));
					
					if (!optionsUseFlag) {
						var oneOptionData = [{
							"productNumber": self.productNumber,
							"orderOptionNumber": 0,
							"productQuantity": 1,
							"optionQuantity": 1,
							"name": result.data.product.productName,
							"price": result.data.product.salePrice
						}];
						displayData(oneOptionData, $('#detail-selected-options-templates'), $('#selectedOptionList'));
						totalQty = 1;
						$('.cancelOption').hide();
					}

					optionsDisplay();

					$('.js-add-cart, .js-option-open').on('click', onCartBuyListener);
					$('.optionListDrop').on(DropDownScroll.EVENT.CHANGE, optionSelectHandler);

					productController.options(self.productNumber, criteriaOptionCount, 0, selectedOptions);
					productController.partnerInfo(self.productNumber);
					break;
				case PRODUCT_EVENT.OPTIONS:
					optionsHandler(result.data.options);
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

	function optionsDisplay() {
		$('.optionScroll').height($('.optionList').height());
		if ($('.optionList').find('li').size() > 3) {
			$('.optionScroll').closest('.activeRight').addClass('has-iscroll');
		} else {
			$('.optionScroll').closest('.activeRight').removeClass('has-iscroll');
		}

		if (!self.optionIScroll) {
			self.optionIScroll = new win.IScroll('.optionScroll', {
				scrollbars: true,
				mouseWheel: true,
				fadeScrollbars: false,
				bounce: false
			});

			$('.activeOption .activeRight').on('mousewheel DOMMouseScroll', function(e) {
				var target = $(e.target),
				isScrollArea = target.hasClass('.optionScroll') || target.closest('.optionScroll').size();

				if (isScrollArea) {
					e.preventDefault();
				}
			});
		} else {
			self.optionIScroll.refresh();
		}
	}

	function optionsHandler(options) {
		if (options.length == 1) {
			// 단일옵션 or 최종선택.
			var selectedOptionData = options[0];

			var addKey = true;
			for (var key in orderData) {
				if (orderData[key].orderOptionNumber == selectedOptionData.orderOptionNumber) addKey = false;
			}
			if (addKey) {
				orderData.push({
					"productNumber": self.productNumber,
					"orderOptionNumber": selectedOptionData.orderOptionNumber,
					"productQuantity": 1,
					"optionQuantity": 1,
					"name": selectedOptionData.optionName,
					"price": util.currencyFormat(selectedOptionData.price)
				});
			}

			displayData(orderData, $('#detail-selected-options-templates'), $('#selectedOptionList'));
			optionsDisplay();

			$('.cancelOption').click(optionRemoveHandler);
			
			var totalPrice = reCalculateTotalPrice(orderData);
			$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
		} else {
			var optionLevel;
			var valueArray = new Array();

			for (var key in options) {
				var eachOptions = options[key];
				optionLevel = eachOptions.optionLevel;
				if (eachOptions.price != null) {
					eachOptions.priceTag = '('+util.currencyFormat(parseInt(eachOptions.price, 10))+'원)';
					eachOptions.price = util.currencyFormat(parseInt(eachOptions.price, 10));
				}
				valueArray.push(eachOptions.optionName);
			}

			optionsDataArray[optionLevel] = valueArray;
			displayData(options, $('#detail-options-templates'), $('#optionsDrop'+(optionLevel-1)+'Con'));
			DropDownScroll.refresh();
		}
	}

	function optionSelectHandler(e, data) {
		e.preventDefault();

		var optionLevel = Number($(this).attr('id').substr(11))+1;
		var optionAddress = data.values.split("-");
		var selectedOptionData = optionsDataArray[parseInt(optionAddress[0])][parseInt(optionAddress[1])];

		selectedOptions[optionLevel-1] = selectedOptionData;
		selectedOptions.splice(optionLevel);
		productController.options(self.productNumber, criteriaOptionCount, optionLevel, selectedOptions);
	};

	function optionQtyChangeHandler(e, target, value) {
		//var newQty = parseInt(target.find('.num').text());
		totalQty = value;

		if (optionsUseFlag) {
			for (var key in orderData) {
				var eachOrder = orderData[key];
				if (eachOrder.orderOptionNumber == target.data().optionNum) {
					eachOrder.productQuantity = value;
					eachOrder.optionQuantity = value;
				}
			}

			var totalPrice = reCalculateTotalPrice(orderData);
			$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
		} else {
			$('#totalOptionsPrice').html(util.currencyFormat(salePrice*value)+'<b>원</b>');
		}
	};

	function optionRemoveHandler(e) {
		e.preventDefault();
		for (var key in orderData) {
			var eachOrder = orderData[key];
			if (eachOrder.orderOptionNumber == $(this).data().optionNum) orderData.splice(key, 1);
		}

		displayData(orderData, $('#detail-selected-options-templates'), $('#selectedOptionList'));
		optionsDisplay();

		$('.cancelOption').click(optionRemoveHandler);
		
		var totalPrice = reCalculateTotalPrice(orderData);
		$('#totalOptionsPrice').html(util.currencyFormat(totalPrice)+'<b>원</b>');
	};

	function reCalculateTotalPrice(orderData) {
		var newTotalPrice = 0;

		for (var key in orderData) {
			var eachOrder = orderData[key];
			newTotalPrice += (util.removeComma(eachOrder.price)*eachOrder.optionQuantity);
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