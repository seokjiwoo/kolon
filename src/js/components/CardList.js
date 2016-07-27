/* global $ */

module.exports = function() {
	var util = require('../utils/Util.js');
	var debug = require('../utils/Console.js');

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	ISOTOPE_EVENT = events.ISOTOPE,
	CARD_LIST_EVENT = events.CARD_LIST,
	CART_EVENT = events.CART,
	FOLLOWING_EVENT = events.FOLLOWING;

	var orderController = require('../controller/OrderController.js');
	$(orderController).on(CART_EVENT.ADD, addCartHandler);

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init,
		/**
		 * 데이터 추가
		 * @param {Array} cardListArray - Card List data Array
		 */
		appendData: appendData,
		/**
		 * 데이터 전부 삭제
		 */
		removeAllData: removeAllData,
		/**
		 * HTML로 바로 넣기
		 * @param {String} tags
		 */
		html: html,
		/**
		 * 카드 오버 이펙트 초기화
		 */
		initOverEffect: initOverEffect,
		/**
		 * 카드 오버 이펙트 삭제
		 */
		cleanOverEffect: cleanOverEffect,
		refresh : refresh,
		destory : destory
	};
	
	return callerObj;

	var wrap,
	_wrapId;

	var fixedFlag;
	
	function init(wrapId, _fixedFlag) {
		fixedFlag = _fixedFlag;
		_wrapId = wrapId || '#cardWrap';
		wrap = $(_wrapId);

		if (!fixedFlag) {
			if (!util.isMobile()) {
				// PC
				var sizeDefine = {
					columnWidth : 285,
					gutter : 20
				}
			} else {
				// Mobile
				var sizeDefine = {
					columnWidth : 145,
					gutter : 10
				}
			}
			wrap.isotope({
				itemSelector : _wrapId + ' > li:not(.stamp)',
				stamp : _wrapId + ' > .stamp',
				layoutMode : 'packery',
				packery : sizeDefine,
				transitionDuration: 0
			});

			bindEffects();
		}
		initOverEffect();
		initCardRadio();
	};

	function refresh() {
		destory();
		init(_wrapId);
	}

	function destory() {
		if (wrap.data('isotope')) {
			wrap.isotope('destroy');
			cleanOverEffect();
		}
	};

	function appendData(cardListArray) {
		/*
		DP_CARD_TYPE_01: 매거진
		DP_CARD_TYPE_02: 뉴폼 상품
		DP_CARD_TYPE_03: 샵 상품
		DP_CARD_TYPE_04: 개인화 설정
		DP_CARD_TYPE_05: 알림
		DP_CARD_TYPE_06: 기능 (검색/연결/소개)
		DP_CARD_TYPE_07: 전문가
		DP_CARD_TYPE_08: 홈서비스
		DP_CARD_TYPE_09: 엔하우징
		*/

		$.map(cardListArray, function(each) {
			each.background = each.cardImageUrl == undefined ? "" : "background-image:url('"+each.cardImageUrl+"');";

			switch(each.cardTypeCode) {
				case 'DP_CARD_TYPE_01':
					each.cardClass = 'cardType06 cardSize02';
					each.detailUrl = "/magazine/detail.html?articleNumber="+each.cardNumber;
					break;
				case 'DP_CARD_TYPE_02':
					each.cardClass = 'cardType01 cardSize03';
					each.detailUrl = "/newForm/detail.html?productNumber="+each.cardNumber;
					each.productType = each.productTypeCodeName.toLowerCase();
					
					each.basePrice = util.currencyFormat(each.basePrice)+' <span class="priceBottom">원</span>';
					each.salePrice = util.currencyFormat(each.salePrice)+' <span class="priceBottom">원</span>';
					each.pyeongSalePrice = util.currencyFormat(each.pyeongSalePrice)+' <span class="priceBottom">원 / 평</span>';
					each.discountPrice = util.currencyFormat(each.discountPrice)+' <span class="priceBottom">원</span>';
					break;
				case 'DP_CARD_TYPE_03':
					each.cardClass = 'cardType02 cardSize02';
					each.detailUrl = "/shop/detail.html?productNumber="+each.cardNumber;
					each.productType = each.productTypeCodeName.toLowerCase();
					
					each.basePrice = util.currencyFormat(each.basePrice)+' <span class="priceBottom">원</span>';
					each.salePrice = util.currencyFormat(each.salePrice)+' <span class="priceBottom">원</span>';
					each.discountPrice = util.currencyFormat(each.discountPrice)+' <span class="priceBottom">원</span>';
					break;
				case 'DP_CARD_TYPE_07':
					each.cardClass = 'cardType07 cardSize02';
					each.detailUrl = "/manager/detail.html?expertNumber="+each.expertNum;
					each.background = 'background-color:#c6b19e; background-image:url("'+each.bigImageUrl+'")';
					each.hoverImage = 'background-image:url("'+each.portfolios[0]+'")';
					break;
			}

			switch(each.saleStateCode) {
				case 'PD_SALE_STATE_02':
					each.basePrice = each.salePrice = each.discountPrice = 'Sold out';
					break;
				case 'PD_SALE_STATE_03':
					each.basePrice = each.salePrice = each.discountPrice = 'Stop sale';
					break;
			}
		});

		var data = {
			cards: cardListArray
		}

		var source = $('#index-card-templates').html();
		var template = window.Handlebars.compile(source);
		var tags = template(data);

		html(tags);
	};

	function removeAllData() {
		if (!fixedFlag) {
			while (wrap.data('isotope').items.length) {
				wrap.isotope('remove', wrap.data('isotope').items[0].element);
			}
		} else {
			wrap.empty();
		}
		$(callerObj).trigger('cardRemoveAll');
	};

	function html(tags) {
		var insertElements = $(tags);

		if (!fixedFlag) {
			wrap.append(insertElements)
			.isotope('appended', insertElements)
			.isotope('layout');
		} else {
			wrap.append(insertElements);
		}
		
		initOverEffect();
		initCardRadio();

		// 카트에 바로담기 버튼. 시공상품은 옵션 없는 케이스가 없으므로 배송상품 카트에서만 핸들링되는 case가 존재함.
		$('.cardAddCartButton').click(function(e) {
			e.preventDefault();
			orderData = [{
				"productNumber": $(this).data().productNumber,
				"orderOptionNumber": 0,
				"quantity": 1
			}];
			orderController.addMyCartList(orderData, false, 'card');
		});

		bindEffects();
		eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
	};

	function bindEffects() {
		eventManager.off(ISOTOPE_EVENT.REFRESH, refresh)
					.off(ISOTOPE_EVENT.DESTROY, destory);

		eventManager.on(ISOTOPE_EVENT.REFRESH, refresh)
					.on(ISOTOPE_EVENT.DESTROY, destory);
	};

	function initOverEffect(e) {
		cleanOverEffect(e);

		$(_wrapId+' > li').each(function(){ // main card mouseover
			$(this).on('mouseover', onCardConOver)
			$(this).on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
	};

	function cleanOverEffect(e) {
		$(_wrapId+' > li').each(function(){ // main card mouseover
			$(this).off('mouseover', onCardConOver)
			$(this).off('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').off('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').off('mouseleave', onCardDetailLeave);
		});
	};

	function onCardConOver(e) {
		if (!$(this).hasClass('cHover')) $(this).addClass('cHover');
	};

	function onCardConLeave(e) {
		$(this).removeClass('cHover');
	};

	function onCardDetailOver(e) {
		if (!$(this).hasClass('sHover')) $(this).addClass('sHover');
	};

	function onCardDetailLeave(e) {
		$(this).removeClass('sHover');
	};
	
	function addCartHandler(e, status, result, elements) {
		if (elements == 'card') {
			e.stopImmediatePropagation();
			if (status == 200) {
				if (confirm('선택하신 상품을 마이카트에 담았습니다.\n바로 확인 하시겠습니까?')) {
					location.href = '/myPage/myCartShop.html';
					return;
				}
			} else {
				alert('error '+status);
			}
		}
	};

	/**
	 * 개인화 수집 카드
	 */
	function initCardRadio() {	
		$('.cardCollect label').click(function(){
			if ($(this).siblings('input').val() != ':checked'){			
				$(this).parent().addClass('on');
				$(this).parent().siblings().removeClass('on');
			}
		});
	};
}