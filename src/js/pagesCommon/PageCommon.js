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

	var popupOpenHandlerFunction;
	var popupCallbackFunction;
	
	var callerObj = {
		/**
		 * PC/모바일 공통 UI요소 초기화
		 */
		init: init,
		/**
		 * 메시지 팝업 오픈
		 * @param {string} title 팝업 타이틀
		 * @param {string} subTitle 팝업 서브타이틀
		 * @param {string} popupContent 팝업 내용
		 * @param {number|string} width 폭
		 * @param {string} userClass 추가 클래스
		 */
		messagePopup: messagePopup,
		/**
		 * HTML 팝업 오픈 (src, width, userClass)
		 * @param {string} src 팝업 내용 HTML URL
		 * @param {number|string} width 폭
		 * @param {string} userClass 추가 클래스
		 */
		htmlPopup: htmlPopup,
		/**
		 * 육각형 Alert 팝업 오픈  title, description, buttonCaption, callback
		 * @param {string} title 팝업 타이틀
		 * @param {string} description 팝업 본문
		 * @param {string} buttonCaption 버튼 캡션
		 * @param {string|function} callback 버튼 눌렀을 때 실행할 함수 or 넘길 링크 주소
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
		
		// colorbox event listener 설정
		$(document).on('cbox_complete', onCboxEventListener)
					.on('cbox_cleanup', onCboxEventListener)
					.on('cbox_closed', onCboxEventListener);
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
		
		popupOpenHandlerFunction = null;
		popupCallbackFunction = null;

		var inline = '<div class="popTop"><h4 class="popTit">'+title+'</h4></div><div class="popCon"><p class="subTit">'+subTitle+'</p><div class="popScroll">'+popupContent+'</div></div>';
		openPopup(inline, width, userClass);
	};
	
	function htmlPopup(src, width, userClass, handlerObject) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";

		popupOpenHandlerFunction = null;
		popupCallbackFunction = null;

		if (handlerObject != undefined) {
			if (handlerObject.onOpen != undefined) popupOpenHandlerFunction = handlerObject.onOpen;
			if (handlerObject.onSubmit != undefined) popupCallbackFunction = handlerObject.onSubmit;
		}
		
		openPopup(src, width, userClass);
	};

	function alertPopup(title, description, buttonCaption, callback) {
		console.log(typeof(callback));
		
		var linkUrl;
		var customClass;
		popupOpenHandlerFunction = null;
		popupCallbackFunction = null;

		switch(typeof(callback)) {
			case 'undefined':
				linkUrl = '#';
				customClass = 'popClose';
				break;
			case 'string':
				linkUrl = callback;
				customClass = '';
				break;
			case 'function':
				linkUrl = '';
				customClass = 'popCallback';
				popupCallbackFunction = callback;
				break;
		}
		var inline = '<div class="popHex cardSize01"><div class="hexagon"><div class="hexTop"><span></span></div><div class="hexBottom"><span></span></div></div>';
		inline += '<div class="cardCon"><h4 class="popTit">'+title+'</h4>';
		inline += '<p class="popSub">'+description+'</p>';
		inline += '<p class="btnWrap"><a href="'+linkUrl+'" class="btnSizeM btnColor02 '+customClass+'">'+buttonCaption+'</a></p>';
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
				$('.popClose').click(function(e) {
					e.preventDefault();
					$.colorbox.close();
				});
				$('.popCallback').click(function(e) {
					e.preventDefault();
					popupCallbackFunction.call();
				});
				$('.popScroll').css('height', winH-490+'px');
				
				if (popupOpenHandlerFunction != null) popupOpenHandlerFunction.call();
				$.colorbox.resize();
			}
		});
	};

	// colorbox listener - colorbox 내에 공통 버튼 이벤트 설정
	function onCboxEventListener(e) {
		switch(e.type) {
			case 'cbox_complete':
				$('.radioBox label').off('click', radioButtonHandler);
				$('.checkbox label').off('click', checkBoxHandler);

				$('.radioBox label').on('click', radioButtonHandler);
				$('.checkbox label').on('click', checkBoxHandler);
				break;
			case 'cbox_cleanup':
				$('.radioBox label').off('click', radioButtonHandler);
				$('.checkbox label').off('click', checkBoxHandler);

				$('.radioBox label').on('click', radioButtonHandler);
				$('.checkbox label').on('click', checkBoxHandler);
				break;
			case 'cbox_closed':
				break;
		}
	}
}