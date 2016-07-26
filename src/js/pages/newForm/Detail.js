/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'newForm/Detail.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	cartController = require('../../controller/OrderController.js'),
	productController = require('../../controller/ProductController.js'),
	scrapController = require('../../controller/ScrapController.js'),
	followController = require('../../controller/FollowController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	DropDownScroll = require('../../components/DropDownScroll'),
	stickyBar = require('../../components/StickyBar.js'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCT_EVENT = events.PRODUCT,
	FOLLOWING_EVENT = events.FOLLOWING,
	OPTIONNUM_EVENT = events.OPTION_NUM,
	MEMBERINFO_EVENT = events.MEMBER_INFO;
	
	var loginController = require('../../controller/LoginController');
	var loginDataModel = require('../../model/LoginModel');

	var CardList = require('../../components/CardList.js');
	var recommendShopList;
	var recommendNewFormList;
	var partnerGoodsList;
 
 	var criteriaOptionCount;
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
			template : '#newForm-detail-templates'
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
		
		recommendShopList = CardList();
		recommendShopList.init('#recommendShopWrap', true);
		
		recommendNewFormList = CardList();
		recommendNewFormList.init('#recommendShopWrap', true);

		stickyBar.init();

		productController.detailCountAdd();
		$(window).on('beforeunload', function(){
			productController.detailCountSubtract();
		});

		productController.info(self.productNumber);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(scrapController).on('addScrapResult', scrapResultHandler);
		$(cartController).on(CART_EVENT.WILD_CARD, onControllerListener);
		$(productController).on(PRODUCT_EVENT.WILD_CARD, onControllerListener);
		$(followController).on(FOLLOWING_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function setBtnsEvents() {
		$('.accordion li a').on('click', onAccordionListener);
		$('.wrapper .js-add-cart, .wrapper .js-prd-buy, .wrapper .js-add-like, .wrapper .js-add-scrap').on('click', onCartBuyListener);
	}

	function destoryBtnsEvents() {
		$('.accordion li a').off('click', onAccordionListener);
		$('.wrapper .js-add-cart, .wrapper .js-prd-buy, .wrapper .js-add-like, .wrapper .js-add-scrap').off('click', onCartBuyListener);
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
			target.siblings().slideUp();
		} else {
			target.parent('li').removeClass('on').addClass('on');
			target.siblings().slideDown();
		}
	}

	function onCartBuyListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		isLogin = eventManager.triggerHandler(MEMBERINFO_EVENT.IS_LOGIN),
		orderGoodsUrl = '';

		if (target.hasClass('js-option-open')) {
			$('.detailBottomTab .bottomTabWrap').toggleClass('active');
			
			if ($('.detailBottomTab .bottomTabWrap').hasClass('active')) {
				$('.optionScroll').height($('.optionList').height());
				self.optionIScroll.refresh();
			}
			return;
		}

		if (!isLogin) {
			$(document).trigger('needLogin');
			return;
		}
		
		if (target.hasClass('js-add-like')) {
			if (target.hasClass('on')) {
				//
			} else {
				productController.likes(self.productNumber, 'BM_LIKE_SECTION_02');
			}
			return;
		}

		if (target.hasClass('js-add-scrap')) {
			if (target.hasClass('on')) {
				//
			} else {
				scrapController.addCardScrap(scrapController.SCRAP_TARGET_CODE_CARD_GOODS, self.productNumber);
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
			$('.detailBottomTab .bottomTabWrap').addClass('active');
			$('.optionScroll').height($('.optionList').height());
			self.optionIScroll.refresh();
		}
	}

	function scrapResultHandler(e, status, result) {
		if (status == 200) {
			$('.js-add-scrap').addClass('on');
			$('.js-add-scrap .countNum').text(Number($('.js-add-scrap .countNum').text())+1);
		}
	}

	function addCart() {
		var loginData = loginDataModel.loginData();

		if (orderData.length == 0) {
			alert('옵션을 선택해주세요.');
		} else {
			var cartData = orderData.concat();
			$.map(cartData, function(each) {
				delete each.quantity;
				delete each.price;
			});
			cartController.addMyCartList(cartData, 'newForm');
		}
	};

	function orderGoods() {
		var loginData = loginDataModel.loginData();
		
		if (orderData.length == 0) {
			alert('옵션을 선택해주세요.');
		} else if (loginData.stateCode == 'BM_MEM_STATE_01') {
			$(document).trigger('verifyMember', 'NEWFORM');
		} else {
			var cartData = orderData.concat();
			$.map(cartData, function(each) {
				delete each.quantity;
				delete each.price;
			});
			Cookies.set('instantNFOrder', cartData);
			location.href = '/order/orderService.html';
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

								if (!stickyBar.isReady()) {
									stickyBar.init();
									setStickySnsShare();
								}
							});
	};

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			// [S] CART - 장바구니
				case CART_EVENT.ADD:
					if (elements == 'newForm') {
						e.stopImmediatePropagation();
						if (status == 200) {
							if (confirm('선택하신 상품을 마이카트에 담았습니다.\n바로 확인 하시겠습니까?')) {
								location.href = '/myPage/myCartNewForm.html';
								return;
							}
						} else {
							alert('error '+status);
						}
					}
					break;
			// [E] CART - 장바구니

			// [S] PRODUCT - 상품
				case PRODUCT_EVENT.TOAST_MESSAGE:
					//console.log(result.message); 
					break;
				case PRODUCT_EVENT.INFO:
					orderData = new Array();

					criteriaOptionCount = result.data.product.criteriaOptionCount;
					optionsDataArray = new Array();
					selectedOptions = new Array();

					if (result && result.data && result.data.product) {
						$.each(result.data, function(index, product) {
							product.basePriceDesc = util.currencyFormat(parseInt(product.basePrice, 10));
							product.salePriceDesc = util.currencyFormat(parseInt(product.salePrice, 10));
							product.pyeongBasePriceDesc = util.currencyFormat(parseInt(product.pyeongBasePrice, 10));
							product.pyeongSalePriceDesc = util.currencyFormat(parseInt(product.pyeongSalePrice, 10));
						});
					}

					displayData(result.data.product, $('#shop-detail-description-templates'), $('.shop-detail-description-wrap'));
					displayData(result.data.product, $('#detail-info-templates'), $('.js-detail-info-wrap'));
					displayData(result.data.product, $('#detail-criteria-options-templates'), $('#criteria-options-wrap'));

					if (result.data.product.tags.length == 0) {
						$('#tagArea').hide();
					} else {
						displayData(result.data.product.tags, $('#detail-tags-templates'), $('#js-detail-tags-wrap'));
					}
					
					self.productName = result.data.product.productName;
					self.salePrice = result.data.product.salePrice;
					self.stock = result.data.product.stock;

					if (result.data.product.registeredLikeYn == 'Y') $('.js-add-like').addClass('on');
					if (result.data.product.registeredScrapYn == 'Y') $('.js-add-scrap').addClass('on');
					
					optionsDisplay();

					$('.js-add-cart, .js-option-open').on('click', onCartBuyListener);
					$('.optionListDrop').on(DropDownScroll.EVENT.CHANGE, optionSelectHandler);

					switch(result.data.product.saleStateCode) {
						case "PD_SALE_STATE_01":
							break;
						case "PD_SALE_STATE_02":
							$('.js-add-cart').remove();
							$('.js-prd-buy').css('background', '#666666').text('품절').removeClass('js-prd-buy');
							break;
						case "PD_SALE_STATE_03":
							$('.js-add-cart').remove();
							$('.js-prd-buy').css('background', '#666666').text('판매중지').removeClass('js-prd-buy');
							break;
					}

					productController.options(self.productNumber, criteriaOptionCount, 0, new Array());
					productController.partnerInfo(self.productNumber);
					
					productController.recommend(self.productNumber, 'PD_PROD_SVC_SECTION_01');
					productController.recommend(self.productNumber, 'PD_PROD_SVC_SECTION_02');
					break;
				case PRODUCT_EVENT.LIKES:
					switch(status) {
						case 200:
							win.alert('해당 상품을 \'좋아요\' 하였습니다.');
							location.reload();
							break;
						default:
							win.alert(result.message);
							break;
					}
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					break;
				case PRODUCT_EVENT.OPTIONS:
					optionsHandler(result.data.options);
					break;
				case PRODUCT_EVENT.INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCT_EVENT.PARTNER_INFO:
					var partnerData1 = result.data.partner;
					var partnerData2 = result.data.partner;
					if (partnerData2.memberMasterYn == 'Y') {
						partnerData2.link = '/manager/detail.html?expertNumber='+partnerData2.partnerNumber;
					} else {
						partnerData2.link = '/manager/brand.html?expertNumber='+partnerData2.partnerNumber;
					}
					displayData(partnerData1, $('#detail-partner-templates'), $('.js-detail-partner-wrap'));
					displayData(partnerData2, $('#info-partner-templates'), $('.js-info-partner-wrap'));

					self.expertNumber = partnerData2.partnerNumber;
					$('#btnFollow').on('click', onFollowListener);
					$('#btnMessage').attr('href', '/popup/popMessage.html?saleMemberNumber='+partnerData2.partnerNumber);
					
					partnerGoodsList = CardList();
					partnerGoodsList.init('#sellerCard', true);
					productController.partnerGoodsInfo(self.productNumber);
					break;
				case FOLLOWING_EVENT.ADD_FOLLOW:
					switch(status) {
						case 200: 
							$('#btnFollow').removeClass('js-add-follow').addClass('js-delete-follow').text('팔로잉');
							break;
						default: win.alert(result.message); break;
					}
					break;
				case PRODUCT_EVENT.PARTNER_GOODS:
					//console.log(result.data.productCards.length);
					partnerGoodsList.appendData(result.data.productCards);
					$('#sellerCard').bxSlider({
						pager:false,
						slideMargin: 10,
						minSlides: 2,
						maxSlides: 2,
						slideWidth: 285
					});
					break;
				case PRODUCT_EVENT.RECOMMEND:
					switch(response.data.productServiceSectionCode) {
						case 'PD_PROD_SVC_SECTION_01':
							// 샵
							if (result.data.productCards.length == 0) {
								$('#recommendLiving').hide();
							} else {
								recommendShopList.appendData(result.data.productCards);
								$('#recommendShopWrap').bxSlider({
									pager:false,
									slideMargin: 10,
									minSlides: 4,
									maxSlides: 4,
									slideWidth: 285
								});	
							}
							break;
						case 'PD_PROD_SVC_SECTION_02':
							// 리폼  
							if (result.data.productCards.length == 0) {
								$('#recommendNewForm').hide();
							} else {
								recommendNewFormList.appendData(result.data.productCards);
								$('#recommendNewFormWrap').bxSlider({
									pager:false,
									slideMargin: 10,
									minSlides: 4,
									maxSlides: 4,
									slideWidth: 285
								});
							}
							break;
					}
					break;
				case PRODUCT_EVENT.PREVIEW:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCT_EVENT.RELATED:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
			// [E] PRODUCT - 상품
		}
	}

	function onFollowListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);

		if (target.hasClass('js-add-follow')) {
			followController.addFollows(self.expertNumber, 'BM_FOLLOW_TYPE_01');
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
		if (options.length == 0) {
			// 최종선택.
			alert('상품 옵션 세부 데이터가 없습니다.');
			$('#totalOptionsPrice').html('0<b>원</b>');
		} else if (options.length == 1) {
			// 최종선택.
			var selectedOptionData = options[0];

			orderData = [{
				"productNumber": self.productNumber,
				"orderOptionNumber": selectedOptionData.orderOptionNumber,
				"quantity": 1,
				"price": Number(selectedOptionData.price)
			}];
			optionsDisplay();
			
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

	function reCalculateTotalPrice(orderData) {
		var newTotalPrice = 0;

		for (var key in orderData) {
			var eachOrder = orderData[key];
			newTotalPrice += (util.removeComma(eachOrder.price)*eachOrder.quantity);
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