/* global $ */

module.exports = function() {
	var callerObj = {
		/**
		 * PC/모바일 공통 UI요소 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		initTab();
		
		// radiobox
		$('.radioBox label').click(function(){
			$(this).addClass('on').siblings('label').removeClass('on');
		});
		
		// checkbox
		$('.checkbox label').click(function(){
			if ($(this).siblings('input').val() != ':checked'){			
				$(this).toggleClass('on');
			}
		});
		
		$('.except').dotdotdot();
	};
	
	function initTab(){
		$('.tabWrap a').on('click', function(e) {// common tab
			var tabBtn = $(this);
			var tabCon = $(this).attr('href');
			e.preventDefault();
			$(tabBtn).parent().addClass('on').siblings().removeClass('on');
			$(tabCon).show().siblings().hide();
			if ($('ul').hasClass('cardWrap')) initCardLayout();
			if ($('ul').hasClass('infoSlider')) initTabSlider();
		});
		// tab width depend on number of li
		var countMenu = $('.tabType01 li').length ;
		$('.tabType01 li').css('width',100/countMenu+'%');
	};
	
	/**
	 * slide in detail page
	 */
	function initTabSlider() { 
		$('#infoSlider').bxSlider({
			pager:false
		});
	};
	
	/**
	 * card layout
	 */
	function initCardLayout() {
		$('#cardWrap').isotope({
			itemSelector: '#cardWrap > li',
			masonry: {
				columnWidth: 100,
				gutter: 1
			}
		});
	}
}