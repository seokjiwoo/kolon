/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var loginController = require('../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	$(loginController).on('confirmPasswordResult', confirmPasswordResultHandler);
	
	var lnbScroller;
	var pageId;

	var topBannerShowFlag;

	var callerObj = {
		/**
		 * SuperClass 연결
		 */
		Super: Super,
		/**
		 * 초기화
		 */
		init: init
	};

	// 공통차트 컴포넌트 - @see html/_js/chart.html
	var doughnutChart = require('../components/DoughnutChart.js'),
	horizonBarChart = require('../components/HorizonBarChart.js'),
	dropDownMenu =  require('../components/DropDownMenu.js'),
	eventManager = require('../events/EventManager'),
	cardList = require('../components/CardList.js'),
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	MEMBERINFO_EVENT = events.MEMBER_INFO,
	INFOSLIDER_EVENT = events.INFO_SLIDER;
	
	var FloatMenu = require('../components/FloatingMenu.js'),
	floatMenu = FloatMenu();

	return callerObj;
	
	function init(_pageId) {
		pageId = _pageId;
		if (pageId == undefined) pageId = $('body').data('pageId');
		Super.init(pageId, 'pc');
		
		// 전 페이지 공용 요소 초기화
		initMenu();			// GNB/LNB
		floatMenu.init();		// 플로팅버튼

		// Handlebars setting
		initHandlebars();

		// 일부 페이지 공용 요소 초기화
		initTopBanner();	// 상단 배너 (index만 사용, 공용요소 LNB때문에 이쪽에 위치)
		initChart();	// 차트 컴포넌트
		dropDownMenu.init();	// 드롭다운 메뉴
		initAddressPopupButton();	// 주소록 팝업버튼
		initOrderTable();	// 주문결재 페이지 테이블 높이 설정
		initInfoSlider();	// #infoSlider bxSlider

		$('#sortToggle').on('click', function(e) {//category search drop-down
			e.preventDefault();
			$(this).toggleClass('opened');
			$('.catSort .sortCont, .btnSort').slideToggle(300);
		});

		// tab width depend on number of li
		var countMenu = $('.tabSplit li').length ;
		$('.tabSplit li').css('width',100/countMenu+'%');

		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, cardlistEventRefreshHandler)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		// MeberInfo event Listener
		eventManager.on(MEMBERINFO_EVENT.WILD_CARD, onMemberInfoHandler);

		// info slider event Listener
		eventManager.on(INFOSLIDER_EVENT.REFRESH, infoSliderRefreshHandler)
					.on(INFOSLIDER_EVENT.DESTROY, infoSliderDestoryhHandler);


		fullSlideImg(); // slide Full img 중앙정렬 

	};

	function initInfoSlider() {
		if (!$('#infoSlider').data('bxSlider')) {
			$('#infoSlider').bxSlider({
				pager:false
			});
		}
	}

	/**
	 * 내 정보 갱신 반영
	 */
	function myInfoResultHandler(e) {
		if (Super.loginData != null) {
			var email = Super.loginData.email == null ? '' : Super.loginData.email;

			// 로그인 상태일 때
			$('body').addClass('login');
			$('#buttonLogInTop').remove();
			// #topMemberInfoAlarm - ?
			if (Super.loginData.imageUrl != null) {
				$('#topMemberInfoPic').attr('src', Super.loginData.imageUrl);
			} else {
				$('#topMemberInfoPic').attr('src', '/images/profile.png');
			}
			$('#topMemberInfoName').attr('href', '/myPage/').text(Super.loginData.memberName+' 님');

			if (Super.loginData.imageUrl != null) {
				$('#profileImage').attr('href', '/myPage/').attr('src', Super.loginData.imageUrl);
			} else {
				$('#profileImage').attr('href', '/myPage/').attr('src', '/images/profile.png');
			}
			$('#profileName').html('<span>'+Super.loginData.memberName+' 님</span><br>'+email);
			$('#myMenuButtonList').removeClass('log');
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').text('나의 커먼');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');

			$('#menuCountOrderGoods').text(Super.loginData.myMenu.orderCount);
			$('#menuCountCancelGoods').text(Super.loginData.myMenu.claimCount);
			$('#menuCountRecentViewItem').text(Super.loginData.myMenu.recentCount);
			$('#menuCountOrderNewform').text(Super.loginData.myMenu.contractorCount);
			if (Super.loginData.myActivity.cartCount == 0) {
				$('#menuCountCart').hide();
			} else {
				$('#menuCountCart').text(Super.loginData.myActivity.cartCount);
			}

			$('.profileEditButton').click(function(e){
				e.preventDefault();
				closeLnbHandler();
				if (Super.loginData.joinSectionCode == "BM_JOIN_SECTION_02") {
					confirmPasswordResultHandler(null, 200);
				} else {
					Super.htmlPopup('../../_popup/popCheckPw.html', 590, 'popEdge', {
						onOpen: function() {
							$('#checkPwForm').submit(function(e){
								e.preventDefault();
								loginController.confirmPassword($('#checkPw').val());
							});
						},
						onSubmit: function() {
							loginController.confirmPassword($('#checkPw').val());
						}
					});
				}
			});
		}
	};

	function confirmPasswordResultHandler(e, status, result) {
		switch(status) {
			case 200:
				Cookies.set('profileEditAuth', 'auth', { expires: 1/1440 });	// 1 minutes
				location.href = '/myPage/profileEdit.html';
				break;
			case 400:
				alert(result.message);
				break;
		}
	}
	
	/**
	 * GNB/LNB 초기화
	 */
	function initMenu() {
		if (Super.loginData == null) {
			// 로그인 상태가 아닐 때
			$('#topMemberInfo').remove();
			$('#settingButton').remove();
			$('#myMenuButtonList li a').attr('href', '#').css('pointer-events', 'none');

			$('#menuCountCart').hide();
			
			// $('#profileImage').attr('src', '/images/profile.png');
			// $('#profileName').html('<span>로그인 해주세요</span>');
			$('#myMenuButtonList').addClass('log');
			//$('#btnJoinMyPage').attr('href', '/member/login.html').addClass('btnMypage').text('로그인 / 회원가입');
			$('#menuToggle').hide();
			//$('#buttonLogInOut').attr('href', '/member/login.html').text('로그인');
		}

		lnbScroller = new IScroll('#lnbWrapper', {
			click: true, 
			mouseWheel: true,
			scrollbars: true,
			fadeScrollbars: true,
			bounce: false
		});

		$('#btnLnb').on('click', openLnbHandler);
		$('#profileClose').on('click', closeLnbHandler);
		$('#dim').on('click', closeLnbHandler);

		$('.depth01.toggle').on('click', function(e) {//lnb menu drop-down
			e.preventDefault();
			$(this).siblings().slideToggle(400, function() {
				lnbScroller.refresh();
			});
		});
		$('#menuToggle').on('click', function(e) {//lnb profile drop-down
			e.preventDefault();
			$(this).toggleClass('opened');
			$('#myMenu').slideToggle(400, function() {
				lnbScroller.refresh();
			});
		});

		$('#searchOpen').on('click', function(e) {// search drop-down
			e.preventDefault();
			var searchBtn = $(this).parent().parent().hasClass('bannerHide');
			if (searchBtn){
				if($(this).hasClass('opened')){
					$(this).removeClass('opened');
					$('#searchWrap').animate({'top':'-167px'},250);
				} else {
					$(this).addClass('opened')
					$('#searchWrap').animate({'top':'60px'},250);
				}
			} else {
				if($(this).hasClass('opened')){
					$(this).removeClass('opened');
					$('#searchWrap').animate({'top':'-167px'},250);
				} else {
					$(this).addClass('opened')
					$('#searchWrap').animate({'top':(topBannerShowFlag ? 167 : 60)+'px'},250);
					$('.bannerClose').on('click', function(){
						$('#searchOpen').removeClass('opened');
						$('#searchWrap').animate({'top':'-167px'},250);
					})
				}
			}
			e.stopPropagation();
		});

		$(window).scroll(function () { // topMenu scroll bg
			if ($(document).scrollTop() > 60){
				$('.topMenu').css('background','#fff');
			}else{
				$('.topMenu').css('background','none');
			}
			if ($(document).scrollLeft() > 0){
				$('.topMenu, .search .subTop').css('margin-left','-' + $(document).scrollLeft() + 'px');
			}
		});
	
		$(window).resize(function(){
			if ($(window).width() > 1239){
				$('.topMenu, .search .subTop').css('margin-left','0');
			}
			$('#lnbWrapper').css('height', $(window).height()-(topBannerShowFlag?113:0)+'px');
			lnbScroller.refresh();
		});

		cardList().initOverEffect();
	};

	function openLnbHandler(e) {
		e.preventDefault();
		$('#lnbWrapper').animate({'left':'0'}, 500);
		$('#dim').show().css('z-index','4');
	};

	function closeLnbHandler(e) {
		if (e != undefined) e.preventDefault();
		if (!$('#floatingToggle').hasClass('opened')) {
			$('#lnbWrapper').animate({'left':'-285px'}, 500);
			$('#dim').hide().css('z-index','3');
		}
	};

	/**
	 * 상단 배너영역 초기화
	 */
	function initTopBanner() {
		var showBannerFlag = (pageId == 'index'); 	// 임시 조건. 나중에 바꿔야 함. 쿠키라던가...

		if (showBannerFlag) {
			topBannerShowFlag = true;
			$('#topBanner').show();
			$('#closeTopBannerButton').click(hideTopBanner);
			lnbScroller.refresh();
		} else {
			hideTopBanner();
		}
	};

	/**
	 * 상단 배너영역 숨기기
	 */
	function hideTopBanner(e) {
		topBannerShowFlag = false;

		$('#topBanner').hide();
		$('.main .container').css('padding-top','0');
		$('#lnbWrapper').css({
			"top": 0,
			"height": "100%"
		});
	};

	/**
	 * 공통차트 컴포넌트 초기화
	 */
	function initChart() {
		doughnutChart.init();
		horizonBarChart.init();
	}

	/**
	 * 주소록 시스템팝업 버튼 초기화
	 */
	function initAddressPopupButton() {
		$('.openAddressPopup').click(function(e) {
			e.preventDefault();
			window.open($(this).attr('href'), 'addressPopup', 'width=770,height=730,menubar=no,status=no,toolbar=no,resizable=no,fullscreen=no');
			e.stopPropagation();
		});
	}

	/**
	 * 주문결재 페이지 테이블 높이 설정
	 */
	function initOrderTable() {
		$('.pay').each(function(){
			var tbHC = parseInt($(this).height())
			$(this).find('.tbHV table').css('height',tbHC);
		})
	};


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
	}

	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function cardlistEventRefreshHandler(e) {
		cardList().initOverEffect();
	}

	// Colorbox Cleanup 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxDestoryListener(e) {
		cardList().cleanOverEffect();
	}

	// MeberInfo event Listener
	// @see Events.js#Events.MEMBER_INFO
	// @example
	// 	var isLogin = eventManager.triggerHandler(MEMBERINFO_EVENT.IS_LOGIN);
	function onMemberInfoHandler(e) {
		var type = e.type;

		switch(type) {
			// 로그인 유무 체크
			case MEMBERINFO_EVENT.IS_LOGIN:
				return (Super.loginData) ? true : false;
				break;
		}
	}

	function infoSliderRefreshHandler(e) {
		if ($('#infoSlider').data('bxSlider')) {
			$('#infoSlider').data('bxSlider').reloadSlider();
		} else {
			initInfoSlider();
		}
	}

	function infoSliderDestoryhHandler(e) {
		if ($('#infoSlider').data('bxSlider')) {
			$('#infoSlider').data('bxSlider').destroySlider();
		}
	}
	
	/**
	 * full slide img 중앙정렬
	 */
	function fullSlideImg() {
		var winW = $(window).width();
		if (winW > 1220){
			$('.fullSlideImg').css('margin-left',-(1920-winW)/2);
		}
		$(window).resize(function() {
			var winW = $(window).width();
			if (winW > 1220){
				$('.fullSlideImg').css('margin-left',-(1920-winW)/2);
			}
		});
	}
}