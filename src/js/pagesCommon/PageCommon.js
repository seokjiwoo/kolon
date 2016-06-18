/* global $ */

module.exports = function() {
	var popupSize = {
		"530": 530,
		"540": 540,
		"590": 590,
		"650": 650,
		"835": 835,
		"895": 895,
		"1200": 1200
	};
	var winH;
	var pageId;

	var loginDataModel = require('../model/LoginModel');
	var loginData = loginDataModel.loginData();
	
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
		htmlPopup: htmlPopup,
		/**
		 * 육각형 Alert 팝업 오픈
		 */
		alertPopup: alertPopup,
		/**
		 * 로그인 상태 정보
		 */
		loginData: loginData
	};
	
	return callerObj;
	
	function init(_pageId) {
		pageId = _pageId;
		winH = $(window).height();

		Mailcheck.run({
			domains: ['gmail.com', 'naver.com', 'hanmail.net'],
			secondLevelDomains: ['domain', 'yetanotherdomain'],
			topLevelDomains: ["com", "net", "org", "co.kr"]
		});
		
		initTab();
		initTabContentLayout();

		$('.radioBox label').click(radioButtonHandler);	// radio button
		$('.checkbox label').click(checkBoxHandler);	// checkbox
		$('.btnPop').click(htmlPopupLinkHandler);		// basic Popup
	};
	
	/**
	 * initalize radio button
	 */
	function radioButtonHandler(e) {
		$(this).addClass('on').siblings('label').removeClass('on');
	};
	
	/**
	 * initalize checkbox
	 */
	function checkBoxHandler(e) {
		if ($(this).siblings('input').val() != ':checked'){			
			$(this).toggleClass('on');
		}
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
			
			initTabContentLayout();
		});
	};

	/**
	 * init current tab layout
	 */
	function initTabContentLayout() {
		if ($('ul').hasClass('cardWrap')) initCardLayout();
		if ($('ul').hasClass('infoSlider')) initTabSlider();
		if ($('p').hasClass('except')) $('.except').dotdotdot({watch:'window'});
		if ($('p').hasClass('except02')) {
			$('.except02').dotdotdot({
				after: 'a.readmore',
				watch:'window',
				callback:function(){
					$('.readmore').on('click', function(e) { // more slideDown
						e.preventDefault();
						$(this).parent('p').siblings('.slideCon').slideDown();
						$(this).parent('.except02').trigger('destroy').css('max-height','none').find('a').remove();
					});
				}
			});
		}
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
	
	function htmlPopupLinkHandler(e) {
		e.preventDefault();
		var popupFile = $(this).attr('href');
		if (popupFile != '#') {
			var userClass = $(this).data('userClass') == undefined ? '' : $(this).data('userClass');
			var width = '100%';
			
			for (var key in popupSize) {
				if ($(this).hasClass('btnPop'+key)) width = popupSize[key];
			};
			
			htmlPopup(popupFile, width, userClass);
		}
	};
	
	function messagePopup(title, subTitle, popupContent, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		var inline = '<div class="popTop"><h4 class="popTit">'+title+'</h4></div><div class="popCon"><p class="subTit">'+subTitle+'</p><div class="popScroll">'+popupContent+'</div></div>';
		openPopup(inline, width, userClass);
	};
	
	function htmlPopup(src, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		openPopup(src, width, userClass);
	};

	function alertPopup(title, description, buttonCaption) {
		var inline = '<div class="popHex cardSize01"><div class="hexagon"><div class="hexTop"><span></span></div><div class="hexBottom"><span></span></div></div>';
		inline += '<div class="cardCon"><h4 class="popTit">'+title+'</h4>';
		inline += '<p class="popSub">'+description+'</p>';
		inline += '<p class="btnWrap"><a href="#" class="btnSizeM btnColor02">'+buttonCaption+'</a></p>';
		inline += '</div></div>';

		openPopup(inline, 280, 'hexAlert');
	};
	
	function openPopup(content, width, userClass) {
		var popupFile = false;
		var popupContent = false;
		var fixed = (userClass.indexOf('absolutePosition') != -1);
		
		if (content.indexOf('.html') != -1) {
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
			opacity: 0.5,
			initialWidth: "0",
			initialHeight: "0",
			onComplete: function() {
				$('.popScroll').css('height', winH-490+'px');
				$.colorbox.resize();
			}
		});
	};
}