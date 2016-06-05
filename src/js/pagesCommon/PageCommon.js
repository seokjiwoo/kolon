/* global $ */

module.exports = function() {
	var winH;
	
	var callerObj = {
		/**
		 * PC/모바일 공통 UI요소 초기화
		 */
		init: init,
		/**
		 * 메시지 팝업 오픈
		 */
		messagePopup: messagePopup,
		/**
		 * HTML 팝업 오픈
		 */
		htmlPopup: htmlPopup
	};
	
	return callerObj;
	
	function init() {
		winH = $(window).height();
		
		initTab();
		initPopupLink();
		
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
	};
	
	/**
	 * initalize page tab
	 */
	function initTab() {
		$('.tabWrap a').on('click', function(e) {// common tab
			e.preventDefault();
			var tabBtn = $(this);
			var tabCon = $(this).attr('href');
			
			$(tabBtn).parent().addClass('on').siblings().removeClass('on');
			$(tabCon).show().siblings().hide();
			
			if ($('ul').hasClass('cardWrap')) initCardLayout();
			if ($('ul').hasClass('infoSlider')) initTabSlider();
			if ($('p').hasClass('except')) $('.except').dotdotdot();
		});
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
	};
	
	/**
	 * initalize basic Popup
	 */
	function initPopupLink() {
		$('.btnPop').on('click', function(e) {
			e.preventDefault();
			var userClass = $(this).data('userClass') == undefined ? '' : $(this).data('userClass');
			var popupFile = $(this).attr('href').substr(1);
			var width = '100%';
			
			if ($(this).hasClass('btnPopS')) {
				width = 540;
			} else if ($(this).hasClass('btnPopM')) {
				width = 895;
			}
			
			htmlPopup('../_popup/'+popupFile+'.html', width, userClass);
		});
	};
	
	function messagePopup(title, subTitle, popupContent, width) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		var inline = '<h4 class="popTit">'+title+'</h4><p class="subTit">'+subTitle+'</p><div class="popScroll">'+popupContent+'</div>';
		openPopup(inline, width, '');
	};
	
	function htmlPopup(src, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		openPopup(src, width, userClass);
	};
	
	function openPopup(content, width, userClass) {
		var popupFile = false;
		var popupContent = false;
		var fixed = (userClass.indexOf('absolutePosition') != -1);
		
		if (content.substr(-4, 4) == 'html') {
			popupFile = content;
		} else {
			popupContent = content;
		}
		
		$.colorbox({
			href: popupFile,
			html: popupContent,
			width: width,
			fixed: fixed,
			className: "lyPop "+userClass,
			transition: "none",
			speed: 0,
			opacity: 0.2,
			initialWidth: "0",
			initialHeight: "0",
			onComplete: function() {
				$('.popScroll').css('height', winH-490+'px');
				$.colorbox.resize();
			}
		});
	};
}