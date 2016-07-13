/* global $ */

module.exports = function() {
	var util = require('../utils/Util.js');

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	ISOTOPE_EVENT = events.ISOTOPE;

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
	
	function init(wrapId) {
		_wrapId = wrapId || '#cardWrap';
		wrap = $(_wrapId);

		wrap.isotope({
			itemSelector : _wrapId + ' > li:not(.stamp)',
			stamp : _wrapId + ' > .stamp',
			layoutMode : 'packery',
			packery : {
				columnWidth : 285,
				gutter : 20
			}
		});

		// isotope event
		eventManager.off(ISOTOPE_EVENT.REFRESH, refresh)
					.off(ISOTOPE_EVENT.DESTROY, destory);

		eventManager.on(ISOTOPE_EVENT.REFRESH, refresh)
					.on(ISOTOPE_EVENT.DESTROY, destory);

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
	}

	function html(tags) {
		var insertElements = $(tags);

		wrap.append(insertElements)
			.isotope('appended', insertElements)
			.isotope('layout');
			
		initOverEffect();
		initCardRadio();

		$(callerObj).trigger('cardAppended');
	}

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
			each.background = each.cardImageUrl != undefined ? "background:#eeeeee" : "background:#eeeeee url('"+each.cardImageUrl+"')";

			switch(each.cardTypeCode) {
				case 'DP_CARD_TYPE_01':
					each.cardClass = 'cardType06 cardSize02';
					each.detailUrl = "/magazine/detail.html?articleNumber="+ each.cardNumber;
					break;
				case 'PROD':
					each.cardTypeCode = 'DP_CARD_TYPE_03';
				case 'DP_CARD_TYPE_03':
					each.cardClass = 'cardType02 cardSize02';
					each.detailUrl = "/shop/detail.html?productNumber="+ each.cardNumber;
					break;
			}

			if (each.basePrice != undefined) each.basePrice = util.currencyFormat(each.basePrice);
			if (each.salePrice != undefined) each.salePrice = util.currencyFormat(each.salePrice);
			if (each.discountPrice != undefined) each.discountPrice = util.currencyFormat(each.discountPrice);

			console.log(each);
		});

		var data = {
			cards: cardListArray
		}

		var source = $('#index-card-templates').html();
		var template = window.Handlebars.compile(source);
		var tags = template(data);

		html(tags);
	};

	function initOverEffect(e) {
		cleanOverEffect(e);

		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).on('mouseover', onCardConOver)
			$(this).on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
	};

	function cleanOverEffect(e) {
		$('#cardWrap > li').each(function(){ // main card mouseover
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