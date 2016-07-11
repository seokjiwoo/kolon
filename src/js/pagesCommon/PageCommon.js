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
	var device;

	var loginController = require('../controller/LoginController');
	var loginDataModel = require('../model/LoginModel');
	var loginData = loginDataModel.loginData();

	var popupOpenHandlerFunction;
	var popupCallbackFunction;


	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ISOTOPE_EVENT = events.ISOTOPE,
	ALERTPOPUP_EVENT = events.ALERT_POPUP,
	CHECKBOX_EVENT = events.CHECK_BOX,
	OPTIONNUM_EVENT = events.OPTION_NUM;

	
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
	
	function init(_pageId, _device) {
		pageId = _pageId;
		device = _device;
		winH = $(window).height();

		Mailcheck.run({
			domains: ['gmail.com', 'naver.com', 'nate.com', 'daum.net', 'hanmail.net', 'hotmail.com', 'yahoo.co.kr', 'dreamwiz.com', 'lycos.co.kr', 'paran.com', 'freechal.com', 'hitel.net', 'hanmir.com', 'korea.com', 'empal.com'],
			topLevelDomains: ["com", "net", "org", "go", "kr", "co", "co.kr", "or.kr", "go.kr", "ac.kr"]
		});

		if (loginData != null) loginController.refreshMyInfo();
		
		initTab();
		initTabContentLayout();

		$('.radioBox label').on('click', radioButtonHandler); 		// radio button
		$('.checkbox label').on('click', checkBoxHandler);			// checkbox
		$('.btnPop').on('click', htmlPopupLinkHandler);				// basic Popup
		$('.optionNum a.btnMinus, .optionNum a.btnPlus').on('click', optionNumHandler);	// option num
		
		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		// isotope event
		eventManager.on(ISOTOPE_EVENT.REFRESH, onIsotopeRefreshListener)
					.on(ISOTOPE_EVENT.DESTROY, onIsotopeDestoryListener);

		// alertPopup event
		eventManager.on(ALERTPOPUP_EVENT.OPEN, onAlertPopupOpenListener);

		$(window).resize(function(e) { winH = $(window).height(); });
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
		var target = $(this),
		hasChkGroup = target.data('chk-group'),
		isAllChk = (target.data('chk-role') === 'chkAll'),
		chkAll, chkGroup, chked;

		// 전체선택기능
		if (hasChkGroup) {
			chkGroup = $('[data-chk-group=\'' + hasChkGroup + '\'');
			chkAll = chkGroup.filter('[data-chk-role=\'chkAll\']');

			// 전체선택 버튼
			if (isAllChk) {
				chkAll.toggleClass('on');
				if (chkAll.hasClass('on')) {
					chkGroup.addClass('on');
				} else {
					chkGroup.removeClass('on');
				}
				chkGroup.siblings('input').prop('checked', chkAll.hasClass('on'));
			} else {
			// 전체선택기능 - 그룹 체크
				chkGroup = chkGroup.not(chkAll);

				target.toggleClass('on');
				target.siblings('input').prop('checked', target.hasClass('on'));

				if (chkGroup.filter('.on').size() >= chkGroup.size()) {
					chkAll.addClass('on');
					chkGroup.siblings('input').prop('checked', true);
				} else {
					chkAll.removeClass('on');
					chkGroup.siblings('input').prop('checked', false);
				}
			}
		} else {
		// 단일 체크 형태
			target.toggleClass('on');
			target.siblings('input').prop('checked', target.hasClass('on'));
		}

		chkGroup = $('[data-chk-group=\'' + hasChkGroup + '\'').not('[data-chk-role=\'chkAll\']');
		chked = chkGroup.filter('.on');

		target.trigger(CHECKBOX_EVENT.CHANGE, [chkGroup, chked]);
		eventManager.trigger(CHECKBOX_EVENT.CHANGE, [target, chkGroup, chked]);
	};

	/**
	 * initalize option num
	 */
	function optionNumHandler(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		wrap = target.closest('.optionNum'),
		opts = wrap.data('optionnum-opts'),
		isPlus = target.hasClass('btnPlus'),
		num = wrap.find('.num'),
		value = parseInt(num.html(), 10);

		if (isPlus) {
			value += 1;
		} else {
			value -= 1;
		}

		if (opts && (opts.max || opts.max === 0)) {
			value = Math.min(opts.max, value);
		}

		if (opts && (opts.min || opts.min === 0)) {
			value = Math.max(opts.min, value);
		}

		num.html(value);

		wrap.val(value).trigger(OPTIONNUM_EVENT.CHANGE, [value]);
		eventManager.trigger(OPTIONNUM_EVENT.CHANGE, [wrap, value]);
	}
	
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

			// tab toggle 시 cardWrap isotope 설정체크
			if (!$(tabCon).find('#cardWrap').size()) {
				return;
			}

			// ie9 isotope bugfix
			eventManager.triggerHandler(ISOTOPE_EVENT.REFRESH);
		});
	};

	/**
	 * init current tab layout
	 */
	function initTabContentLayout() {
		if ($('ul').hasClass('infoSlider')) initTabSlider();
		$('.except').dotdotdot({watch:'window'});
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
		//console.log(typeof(callback));
		
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

		openPopup(inline, (device=='pc' ? 280 : 250), 'hexAlert');
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
			height: (device=="pc" ? false : "100%"),
			maxHeight: (device=="pc" ? false : winH+'px'),
			fixed: (device=="pc" ? fixed : true),
			className: "lyPop "+(device=="pc" ? "lyPop-pc " : "lyPop-m ")+userClass,
			transition: "none",
			speed: 0,
			fadeOut: 0,
			opacity: 0.5,
			initialWidth: (device=="pc" ? false : "100%"),
			initialHeight: (device=="pc" ? false : "100%"),
			scrolling: false,
			onComplete: function() {
				$('.popClose').click(function(e) {
					e.preventDefault();
					$.colorbox.close();
				});
				$('.popCallback').click(function(e) {
					e.preventDefault();
					popupCallbackFunction.call();
				});
				switch(device) {
					case 'pc':
						$('.popScroll').css('height', winH-490+'px');
						if (popupOpenHandlerFunction != null) popupOpenHandlerFunction.call();
						$.colorbox.resize();
						break;
					case 'm':
						var contentHeight = winH-$('popTop').height()-50;
						if ($('.fixwrap').length > 0) contentHeight -= $('.fixwrap').height();
						$('.popCon').css('height', contentHeight+'px');
						if (popupOpenHandlerFunction != null) popupOpenHandlerFunction.call();
						$(window).resize(function(e){ $.colorbox.close(); });
						break;
				}
			}
		});
	};


	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxRefreshListener(e) {
		$('.radioBox label').off('click', radioButtonHandler)
							.on('click', radioButtonHandler);

		$('.checkbox label').off('click', checkBoxHandler)
							.on('click', checkBoxHandler);

		$('.btnPop').off('click', htmlPopupLinkHandler)
					.on('click', htmlPopupLinkHandler);

		$('.optionNum a.btnMinus, .optionNum a.btnPlus').off('click', optionNumHandler)
														.on('click', optionNumHandler);
	}

	// Colorbox Cleanup 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxDestoryListener(e) {
		$('.radioBox label').off('click', radioButtonHandler)
							.on('click', radioButtonHandler);

		$('.checkbox label').off('click', checkBoxHandler)
							.on('click', checkBoxHandler);

		$('.btnPop').off('click', htmlPopupLinkHandler)
					.on('click', htmlPopupLinkHandler);

		$('.optionNum a.btnMinus, .optionNum a.btnPlus').off('click', optionNumHandler)
														.on('click', optionNumHandler);
	}

	// isotope refresh 시점
	function onIsotopeRefreshListener(e) {
		if ($('#cardWrap').data('isotope')) {
			$('#cardWrap').isotope('destroy');
		}
		initTabContentLayout();
	}

	// isotope destory 시점
	function onIsotopeDestoryListener(e) {
		if ($('#cardWrap').data('isotope')) {
			$('#cardWrap').isotope('destroy');
		}
	}

	// alertPopup open 시점
	// @example
	// 	eventManager.trigger(ALERTPOPUP_EVENT.OPEN, ['ID 혹은 소속을 입력하세요.', '', '확인']);
	function onAlertPopupOpenListener(e, title, description, buttonCaption, callback) {
		alertPopup(title, description, buttonCaption, callback);
	}
}