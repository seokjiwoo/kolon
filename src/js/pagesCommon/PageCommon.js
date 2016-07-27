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
	
	var debug = require('../utils/Console.js');
	var util = require('../utils/Util.js');

	var loginController = require('../controller/LoginController');
	$(loginController).on('refreshMyInfo', loginDataHandler);
	var loginDataModel = require('../model/LoginModel');
	var loginData;
	
	var popupOpenHandlerFunction;
	var popupCallbackFunction;

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ISOTOPE_EVENT = events.ISOTOPE,
	ALERTPOPUP_EVENT = events.ALERT_POPUP,
	HTMLPOPUP_EVENT = events.HTML_POPUP,
	CHECKBOX_EVENT = events.CHECK_BOX,
	OPTIONNUM_EVENT = events.OPTION_NUM,
	CARD_LIST_EVENT = events.CARD_LIST;

	$(document).on('needLogin', needLoginHandler);
	
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

		loginController.refreshMyInfo();
		
		initTab();
		initTabContentLayout();

		// Handlebars setting
		initHandlebars();

		// Mobile FastClick 예외 요소 - needsclick 적용
		setFastClickIgnore();

		$('.radioBox label').on('click', radioButtonHandler); 		// radio button
		$('.checkbox label').on('click touch', checkBoxHandler);			// checkbox
		$('.btnPop').on('click', htmlPopupLinkHandler);				// basic Popup
		$('.optionNum a.btnMinus, .optionNum a.btnPlus').on('click', optionNumHandler);	// option num
		
		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		// alertPopup event
		eventManager.on(ALERTPOPUP_EVENT.OPEN, onAlertPopupOpenListener);

		// htmlPopup event
		eventManager.on(HTMLPOPUP_EVENT.OPEN, onHtmlPopupOpenListener);
		
		eventManager.on(CARD_LIST_EVENT.APPENDED, cardAppendedHandler);

		$(window).resize(function(e) { winH = $(window).height(); });
	};

	// Mobile FastClick 예외 요소 - needsclick 적용
	function setFastClickIgnore() {
		if (util.isMobile()) {
			$('.radioBox >').addClass('needsclick');
			$('.checkbox >').addClass('needsclick');
		};
	}

	function loginDataHandler(e, status, result) {
		loginData = loginDataModel.loginData();
	};

	function cardAppendedHandler(e) {
		$('.btnPop').on('click', htmlPopupLinkHandler);
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
		isDropDown = target.closest('.drop, .dropChk').size(),
		chkAll, chkGroup, chked;

		if (isDropDown) {
			return;
		}

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
				if (chkAll.hasClass('on')) {
					chkGroup.siblings('input').prop('checked', 'checked');
				} else {
					chkGroup.siblings('input').removeProp('checked');
				}
			} else {
			// 전체선택기능 - 그룹 체크
				chkGroup = chkGroup.not(chkAll);

				target.toggleClass('on');
				target.siblings('input').prop('checked', target.hasClass('on'));

				if (chkGroup.filter('.on').size() >= chkGroup.size()) {
					chkAll.addClass('on');
					chkGroup.siblings('input').prop('checked', 'checked');
				} else {
					chkAll.removeClass('on');
					chkGroup.siblings('input').removeProp('checked');
				}
			}
		} else {
		// 단일 체크 형태
			if (!target.siblings('input').attr('disabled')) target.toggleClass('on');
			if (target.hasClass('on')) {
				target.siblings('input').prop('checked', 'checked');
			} else {
				target.siblings('input').removeProp('checked');
			}
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

			var tabBtn = $(this),
			href = $(this).attr('href'),
			tabCon;

			$(tabBtn).parent().addClass('on').siblings().removeClass('on');

			if (href.substr(0, 1) !== '#') return;
			if (!$(href).size())  return;

			tabCon = $(href);
			tabCon.show().siblings().hide();

			// tab toggle 시 cardWrap isotope 설정체크
			if (!tabCon.find('#cardWrap').size()) return;

			// ie9 isotope bugfix
			eventManager.triggerHandler(ISOTOPE_EVENT.REFRESH);
		});
	};

	/**
	 * init current tab layout
	 */
	function initTabContentLayout() {
		if ($('ul').hasClass('infoSlider')) initTabSlider();
		
		initTabDotdotdot();
	};

	function initTabDotdotdot() {
		if ($('.except').data('dotdotdot')) {
			$('.except').dotdotdot('destroy');
		}
		
		$('.except').dotdotdot({watch:'window'});

		/*if ($('p').hasClass('except02')) {
			if ($('.except02').data('dotdotdot')) {
				$('.except02').dotdotdot('destroy');
			}
			
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

		}*/
	}
	
	/**
	 * slide in detail page
	 */
	function initTabSlider() { 
		$('#infoSlider').bxSlider({
			pager:false
		});
	};
	
	function needLoginHandler(e) {
		alert('로그인이 필요합니다');
		location.href = '/member/login.html';
	}

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
	
	function messagePopup(title, popupContent, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		popupOpenHandlerFunction = null;
		popupCallbackFunction = null;

		var inline = '<div class="popTop"><h4 class="popTit">'+title+'</h4></div><div class="popCon"><div class="popScroll">'+popupContent+'</div></div>';
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
		//debug.log(typeof(callback));
		
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
		var isPC = (device === 'pc');
		
		if (content.indexOf('.html') != -1) {
			popupFile = content;
		} else {
			popupContent = content;
		}
		
		$.colorbox({
			href: popupFile,
			html: popupContent,
			width: width,
			height: (isPC ? false : "100%"),
			maxHeight: (isPC ? false : winH+'px'),
			fixed: (isPC ? fixed : true),
			className: "lyPop " + (isPC ? "lyPop-pc " : "lyPop-m ") + userClass,
			transition: "none",
			speed: 0,
			fadeOut: 0,
			opacity: 0.5,
			initialWidth: (isPC ? false : '100%'),
			initialHeight: (isPC ? false : '100%'),
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
						var contentHeight = winH - $('.popTop').outerHeight();
						var marginTop = 0;
						var offsetTop = 0;

						// if ($('#colorbox').hasClass('popEdge')) {
						// 	if ($('.popCon').css('margin-top')) {
						// 		marginTop = parseInt($('.popCon').css('margin-top').split('px'), 10);
						// 	}
						// 	if ($('.popScroll').size() && $('.popScroll').offset().top) {
						// 		offsetTop = $('.popScroll').offset().top - $(window).scrollTop();
						// 	}
						// }

						if ($('.fixwrap').length > 0) contentHeight -= $('.fixwrap').height();
						$('.popScroll').css('height', (contentHeight - offsetTop - marginTop)+'px');
						if (popupOpenHandlerFunction != null) popupOpenHandlerFunction.call();

						// 화면 높이보다 사이즈가 작은 팝업의 경우 - resize 처리
						if (winH > $('#colorbox .popCon').outerHeight()) {
							$.colorbox.resize();
						}

						$(window).on('orientationchange', function() {
							$.colorbox.close();
						});

						// $(window).resize(function(e){ $.colorbox.close(); });
						break;
				}
			}
		});
	};


	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxRefreshListener(e) {
		// Mobile FastClick 예외 요소 - needsclick 적용
		setFastClickIgnore();

		$('.radioBox label').off('click', radioButtonHandler)
							.on('click', radioButtonHandler);

		$('.checkbox label').off('click', checkBoxHandler)
							.on('click', checkBoxHandler);

		$('.btnPop').off('click', htmlPopupLinkHandler)
					.on('click', htmlPopupLinkHandler);

		$('.optionNum a.btnMinus, .optionNum a.btnPlus').off('click', optionNumHandler)
														.on('click', optionNumHandler);

		initTabDotdotdot();
	}

	// Colorbox Cleanup 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxDestoryListener(e) {
		// Mobile FastClick 예외 요소 - needsclick 적용
		setFastClickIgnore();

		$('.radioBox label').off('click', radioButtonHandler)
							.on('click', radioButtonHandler);

		$('.checkbox label').off('click', checkBoxHandler)
							.on('click', checkBoxHandler);

		$('.btnPop').off('click', htmlPopupLinkHandler)
					.on('click', htmlPopupLinkHandler);

		$('.optionNum a.btnMinus, .optionNum a.btnPlus').off('click', optionNumHandler)
														.on('click', optionNumHandler);
	}

	// alertPopup open 시점
	// @example
	// 	eventManager.trigger(ALERTPOPUP_EVENT.OPEN, ['ID 혹은 소속을 입력하세요.', '', '확인']);
	function onAlertPopupOpenListener(e, title, description, buttonCaption, callback) {
		alertPopup(title, description, buttonCaption, callback);
	}

	// htmlPopup open 시점
	/* @example
		eventManager.trigger(HTMLPOPUP_EVENT.OPEN, [
			'../../_popup/popOrderCancelRequest.html',
			590,
			'popEdge',
			{
				onOpen: function() {
					window.debug.log('onOpen');
				},
				onSubmit: function() {
					window.debug.log('onSubmit, popCallback');
					eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);
				}
			}
		]);
	*/
	function onHtmlPopupOpenListener(e, src, width, userClass, handlerObject) {
		htmlPopup(src, width, userClass, handlerObject);
	}

	function initHandlebars() {
		/**
		 * Handlebars setting
		 * @example
		 	{{#vxIF @index "<" 2}}
		 		~~~~~~~
		 	{{/vxIF}}
		 */
		window.Handlebars.registerHelper("vxIF", function(v1,operator,v2,options) {
			switch (operator) {
				case "==":
					return (v1==v2)?options.fn(this):options.inverse(this);

				case "!=":
					return (v1!=v2)?options.fn(this):options.inverse(this);

				case "===":
					return (v1===v2)?options.fn(this):options.inverse(this);

				case "!==":
					return (v1!==v2)?options.fn(this):options.inverse(this);

				case "&&":
					return (v1&&v2)?options.fn(this):options.inverse(this);

				case "||":
					return (v1||v2)?options.fn(this):options.inverse(this);

				case "<":
					return (v1<v2)?options.fn(this):options.inverse(this);

				case "<=":
					return (v1<=v2)?options.fn(this):options.inverse(this);

				case ">":
					return (v1>v2)?options.fn(this):options.inverse(this);

				case ">=":
					return (v1>=v2)?options.fn(this):options.inverse(this);

				default:
					return eval(""+v1+operator+v2)?options.fn(this):options.inverse(this);
			}
		});

		window.Handlebars.registerHelper('each_reverse',function (context, options) {
			var fn = options.fn, inverse = options.inverse;
			var length = 0, ret = "", data;

			if (Handlebars.Utils.isFunction(context)) context = context.call(this);
			if (options.data) data = Handlebars.createFrame(options.data);

			if (context && typeof context === 'object') {
				if (Handlebars.Utils.isArray(context)) {
					length = context.length;
					for (var j = context.length-1; j >= 0; j--) {
						//no i18n
						if (data) {
							data.index = j;
							data.first = (j === 0);
							data.last  = (j === (context.length-1));
						}
						ret = ret + fn(context[j], { data: data });
					}
				} else {
					var keys = Object.keys(context);
					length = keys.length;
					for (j=length; j>=0; j--) {
						var key = keys[j-1];
						if (context.hasOwnProperty(key)) {
							if (data) { 
								data.key = key; 
								data.value = context[key];
								data.index = j;
								data.first = (j === 0);
							}
							ret += fn(context[key], {data: data});
						}
					}
				}
			}

			if (length === 0) {
				ret = inverse(this);
			}

			return ret;
		});

		/**
		 * Handlebars setting
		 * @example
	 		{{#vxModuloIF @index 3}}
	 		~~~~~~~
		 	{{/vxModuloIF}}
		 */
		window.Handlebars.registerHelper("vxModuloIF", function(index_count,mod,block) {
			if (parseInt(index_count)%(mod) === 0) {
				return block.fn(this);
			}
		});


		//@see https://github.com/wycats/handlebars.js/issues/927
		window.Handlebars.registerHelper("vxSwitch", function(value, options) {
			this._switch_value_ = value;
			var html = options.fn(this);
			delete this._switch_value_;
			return html;
		});

		//@see https://github.com/wycats/handlebars.js/issues/927
		window.Handlebars.registerHelper("vxCase", function(value, options) {
			var args = Array.prototype.slice.call(arguments);
			var options    = args.pop();
			var caseValues = args;

			if (this._switch_break_ || caseValues.indexOf(this._switch_value_) === -1) {
				return '';
			} else {
				if (options.hash.break === true) {
				this._switch_break_ = true;
			}
				return options.fn(this);
			}
		});

		//@see https://github.com/wycats/handlebars.js/issues/927
		window.Handlebars.registerHelper("vxDefault", function(options) {
			if (!this._switch_break_) {
				return options.fn(this);
			}
		});

		//@see http://jsfiddle.net/mpetrovich/wMmHS/
		//@example {{vxMath @index "+" 1}}
		window.Handlebars.registerHelper("vxMath", function(lvalue, operator, rvalue, options) {
			lvalue = parseFloat(lvalue);
			rvalue = parseFloat(rvalue);

			return {
			"+": lvalue + rvalue,
			"-": lvalue - rvalue,
			"*": lvalue * rvalue,
			"/": lvalue / rvalue,
			"%": lvalue % rvalue
			}[operator];
		});


		//@see http://stackoverflow.com/questions/10138518/handlebars-substring
		//@example {{vxSubString value 0 300}}
		window.Handlebars.registerHelper('vxSubString', function(passedString, startstring, endstring) {
			var theString = passedString.substring(startstring, endstring);
			return new Handlebars.SafeString(theString)
		});

		//@example {{vxMoment value "YYYY.MM.DD"}}
		window.Handlebars.registerHelper('vxMoment', function(dateStr, dateFormat) {
			return new window.moment(dateStr).format(dateFormat);
		});

		//@example {{vxMobileNumberFormat value}}
		window.Handlebars.registerHelper('vxMobileNumberFormat', function(phoneNumber) {
			return util.mobileNumberFormat(phoneNumber);
		});

		//@example {{vxCurrencyFormat value}}
		window.Handlebars.registerHelper('vxCurrencyFormat', function(value) {
			return util.currencyFormat(value);
		});

		//@see http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js#answer-11924998
		// @exampe 
		// {{#vxSelect 1 100 1 quantity}}
		// 	{{#if this.selected}}
		// 		<option value="{{this}}" selected="selected">{{this}}</option>
		// 	{{else}}
		// 		<option value="{{this}}">{{this}}</option>
		// 	{{/if}}
		// {{/vxSelect}}
		window.Handlebars.registerHelper('vxSelect', function(from, to, incr, select, block) {
			var accum = '';
			for(var i = from; i < to; i += incr) {
				if (i === select) {
					accum += block.fn({index : i, selected : true});
				} else {
					accum += block.fn({index : i, selected : false});
				}
			}
			return accum;
		});
		// window.Handlebars.registerHelper('vxFor', function(from, to, incr, block, active) {
		// 	var accum = '';
		// 	for(var i = from; i < to; i += incr) {
		// 		accum += block.fn(i);
		// 	}
		// 	console.log('accum', accum);
		// 	return accum;
		// });
	}
}