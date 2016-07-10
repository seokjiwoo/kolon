/* global $ */

module.exports = function() {
	var util = require('../utils/Util.js');

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
		 * 카드 오버 이펙트 초기화
		 */
		initOverEffect: initOverEffect,
		/**
		 * 카드 오버 이펙트 삭제
		 */
		cleanOverEffect: cleanOverEffect,
	};
	
	return callerObj;

	var wrap;
	
	function init(wrapId) {
		wrap = $(wrapId);

		initOverEffect();
		initCardRadio();
	};

	function appendData(cardListArray) {
		$.map(cardListArray, function(each) {
			switch(each.cardTypeCode) {
				case 'PROD':
					each.cardClass = 'cardType02 cardSize02';
					each.background = each.cardImageUrl == undefined ? "background:#eeeeee" : "background-image:url('"+each.cardImageUrl+"')";
					
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
		var html = template(data);
		var insertElements = $(html);

		wrap.append(insertElements)
			.isotope('appended', insertElements)
			.isotope('layout');

		initOverEffect();
		initCardRadio();

		$(callerObj).trigger('cardAppended');
	};

	function initOverEffect(e) {
		cleanOverEffect(e);

		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').on('mouseover', onCardConOver)
			$(this).find('.cardCon').on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
	};

	function cleanOverEffect(e) {
		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').off('mouseover', onCardConOver)
			$(this).find('.cardCon').off('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').off('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').off('mouseleave', onCardDetailLeave);
		});
	};

	function onCardConOver(e) {
		if (!$(this).hasClass('cHover')) {
			$(this).addClass('cHover');
			$(this).find('.cardBgWrap').show();
			$(this).find('.cardBg03').queue('fx',[]).stop().css('opacity', 1).delay(100).animate({
				"opacity": 0
			}, {
				"duration": 1000,
				"easing": "easeOutBack"
			});
			$(this).find('.cardBg02').queue('fx',[]).stop().css('opacity', 1).delay(200).animate({
				"opacity": 0
			}, {
				"duration": 1000,
				"easing": "easeOutBack"
			});
			$(this).find('.cardBg01').queue('fx',[]).stop().css('opacity', 1).delay(300).animate({
				"opacity": 0
			}, {
				"duration": 1000,
				"easing": "easeOutBack",
				complete: function() {
					$(this).parents('.cardBgWrap').hide();
				}
			});
		}
	};

	function onCardConLeave(e) {
		$(this).removeClass('cHover');
	};

	function onCardDetailOver(e) {
		$(this).addClass('sHover');
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