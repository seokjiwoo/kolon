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
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX;
	
	return callerObj;
	
	function init(_pageId) {
		pageId = _pageId;
		if (pageId == undefined) pageId = $('body').data('pageId');
		Super.init(pageId, 'pc');
		
		// 전 페이지 공용 요소 초기화
		initMenu();			// GNB/LNB
		initFloating();		// 플로팅버튼
		initTopBanner();	// 상단 배너 (index만으로 빠질 수 있음)

		// 일부 페이지 공용 요소 초기화
		initChart();	// 차트 컴포넌트
		dropDownMenu.init();	// 드롭다운 메뉴
		initAddressPopupButton();	// 주소록 팝업버튼
		initCardRadio();	// 개인화 수집 카드
		initOrderTable();	// 주문결재 페이지 테이블 높이 설정

		// Handlebars setting
		initHandlebars();
		
		$('#sortToggle').on('click', function(e) {//category search drop-down
			e.preventDefault();
			$(this).toggleClass('opened');
			$('.catSort .sortCont, .btnSort').slideToggle(300);
		});

		$('#mainSlider').bxSlider();

		// tab width depend on number of li
		var countMenu = $('.tabSplit li').length ;
		$('.tabSplit li').css('width',100/countMenu+'%');


		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		fullSlideImg () // slide Full img 중앙정렬 
	};

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
			if (Super.loginData.imageUrl != null) $('#topMemberInfoPic').attr('src', Super.loginData.imageUrl);
			$('#topMemberInfoName').attr('href', '/myPage/').text(Super.loginData.memberName+' 님');

			if (Super.loginData.imageUrl != null) $('#profileImage').attr('href', '/myPage/').attr('src', Super.loginData.imageUrl);
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

		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').on('mouseover', onCardConOver)
			$(this).find('.cardCon').on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
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

	// main card event Listener
	function onCardConOver(e) {
		if (!$(this).hasClass('cHover')) {
			$(this).addClass('cHover');
			$(this).find('.cardBg01').queue('fx',[]).stop().css('opacity', 1).delay(300).animate({
				"opacity": 0
			}, {
				"duration": 2000,
				"easing": "easeOutBack"
			});
			$(this).find('.cardBg02').queue('fx',[]).stop().css('opacity', 1).delay(200).animate({
				"opacity": 0
			}, {
				"duration": 2000,
				"easing": "easeOutBack"
			});
			$(this).find('.cardBg03').queue('fx',[]).stop().css('opacity', 1).delay(100).animate({
				"opacity": 0
			}, {
				"duration": 2000,
				"easing": "easeOutBack"
			});
		}
	}

	function onCardConLeave(e) {
		$(this).removeClass('cHover');
	}

	function onCardDetailOver(e) {
		$(this).addClass('sHover');
	}

	function onCardDetailLeave(e) {
		$(this).removeClass('sHover');
	}
	// main card event Listener

	/**
	 * 상단 배너영역 초기화
	 */
	function initTopBanner() {
		var showBannerFlag = (pageId == 'index'); 	// 임시 조건. 나중에 바꿔야 함.

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
			
			window.open($(this).attr('href'), 'addressPopup', 'width=770,height=730,menubar=no,status=no,toolbar=no,resizable=no,fullscreen=no')

			e.stopPropagation();
		});
	}

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
	 * 우측하단 플로팅버튼 메뉴 초기화
	 */
	function initFloating(){
		$('#floatingToggle').on('click', function(e) {// floating menu drop-down
			e.preventDefault();
			if($(this).hasClass('opened')){
				$(this).removeClass('opened');
				$('#floatingMenu').find('.menuTit').animate({'right':'3px'},50,
				function(){
					$('.floating04').animate({'top':'0'}, {
						duration: 300, 
						easing: 'easeInBack'
					});
					$('.floating03').animate({'top':'0'}, {
						duration: 400, 
						easing: 'easeInBack'
					});
					$('.floating02').animate({'top':'0'}, {
						duration: 500, 
						easing: 'easeInBack'
					});
					$('.floating01').animate({'top':'0'}, {
						duration: 600, 
						easing: 'easeInBack'
					});
				});
				$('#floatingMenu a').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);;
				$('.flPop').animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack'
				});
				$('#dim').stop().fadeOut(100);
			} else {
				$(this).addClass('opened');
				$('.floating04').queue('fx',[]).stop().animate({'top':'-65px'}, {
					duration: 300, 
					easing: 'easeOutBack',
					complete: function(){
						$(this).hover(
							function(){
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
								} 
							}, function() {
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
								}
							}
						)
					}
				});
				$('.floating03').queue('fx',[]).stop().animate({'top':'-125px'}, { 
					duration: 400, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).hover(
							function(){
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
								} 
							}, function() {
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
								}
							}
						)
					}
				});
				$('.floating02').queue('fx',[]).stop().animate({'top':'-185px'}, {
					duration: 500, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).hover(
							function(){
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
								} 
							}, function() {
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
								}
							}
						)
					}
				});
				$('.floating01').queue('fx',[]).stop().animate({'top':'-245px'}, {
					duration: 600, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).hover(
							function(){
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
								} 
							}, function() {
								if(!$(this).find('a').hasClass('on')){
									$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
								}
							}
						)
					}
				});
			}
		});
		$('#floatingMenu a').on('click', function(e) {// floating menu laypopup
			var floatingBtn = $(this);
			var floatingLy = $(this).attr('href');
			e.preventDefault();
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				$(floatingLy).queue('fx',[]).animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack',
					complete: function(){
						$('#floatingMenu').find('.menuTit').animate({'right':'60px'},50);
					}
				});
				$('#dim').stop().fadeOut(100);
			} else {
				$('#floatingMenu a.on').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);
				$(this).addClass('on');
				$(floatingLy).siblings().queue('fx',[]).animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack'
				});
				$(floatingLy).animate({'bottom':'70px'},{
					duration: 700, 
					easing: 'easeOutBack'
				});
				$('#floatingMenu').find('.menuTit').animate({'right':'3px'},50);
				$('#dim').stop().fadeIn(100);
			}			
			$('.floating .closePop').on('click', function(e) {
				e.preventDefault();
				$(floatingLy).queue('fx',[]).animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack',
					complete: function(){
						$('#floatingMenu').find('.menuTit').animate({'right':'60px'},50);
					}
				});
				$('#dim').stop().fadeOut(100);
				$('#floatingMenu a.on').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);
			});
		});
		$('#goTop').on('click', function(e) {// scroll top
			e.preventDefault();
			$('body, html').animate({ scrollTop:0}, 400);
		});
		$('#slideIn').bxSlider({ //floating 의견묻기
			minSlides: 2,
			maxSlides: 2,
			controls:false,
			slideWidth: 100,
		});
	};
	

	/**
	 * 개인화 수집 카드
	 */
	function initCardRadio(){	
		$('.cardCollect label').click(function(){
			if ($(this).siblings('input').val() != ':checked'){			
				$(this).parent().addClass('on');
				$(this).parent().siblings().removeClass('on');
			}
		});
	};

	/**
	 * 주문결재 페이지 테이블 높이 설정
	 */
	function initOrderTable() {
		$('.pay').each(function(){
			var tbHC = parseInt($(this).height())
			$(this).find('.tbHV table').css('height',tbHC);
		})
	};


	/**
	 * Handlebars setting
	 * @example
	 	{{#vxIF @index "<" 2}}
	 		~~~~~~~
	 	{{/vxIF}}
	 */
	function initHandlebars() {
		window.Handlebars.registerHelper("vxIF",function(v1,operator,v2,options) {
			switch (operator)
			{
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
	}

	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxRefreshListener(e) {
		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').off('mouseover', onCardConOver)
			$(this).find('.cardCon').off('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').off('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').off('mouseleave', onCardDetailLeave);
		});

		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').on('mouseover', onCardConOver)
			$(this).find('.cardCon').on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
	}

	// Colorbox Cleanup 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxDestoryListener(e) {
		$('#cardWrap > li').each(function(){ // main card mouseover
			$(this).find('.cardCon').on('mouseover', onCardConOver)
			$(this).find('.cardCon').on('mouseleave', onCardConLeave);
			$(this).find('.cardDetail').on('mouseover', onCardDetailOver)
			$(this).find('.cardDetail').on('mouseleave', onCardDetailLeave);
		});
	}
}
function fullSlideImg (){ // full slide img 중앙정렬
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