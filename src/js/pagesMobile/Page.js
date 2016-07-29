/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var util = require('../utils/Util.js');	
	var loginController = require('../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	$(loginController).on('confirmPasswordResult', confirmPasswordResultHandler);

	var loginDataModel = require('../model/LoginModel');
	var loginData;
	
	var pageId;

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	snsShare = require('../components/SnsShare.js'),
	scrollMenu = require('../components/ScrollMenu'),
	cardList = require('../components/CardList.js'),
	COLORBOX_EVENT = events.COLOR_BOX,
	MEMBERINFO_EVENT = events.MEMBER_INFO,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	WINDOWOPENER_EVENT = events.WINDOW_OPENER,
	CARD_LIST_EVENT = events.CARD_LIST;

	var memberInfoController = require('../controller/MemberInfoController');
	$(memberInfoController).on('verifyMemberResult', verifyMemberResultHandler);

	$(document).on('verifyMember', requestVerifyMember);
	
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
	
	return callerObj;

	
	function init(_pageId) {
		pageId = _pageId;
		if (pageId == undefined) pageId = $('body').data('pageId');
		Super.init(_pageId, 'm');

		// Mobile 터치 딜레이를 없애기 위함.
		if (window.FastClick) {
			window.FastClick.attach(document.body);
		}

		initGnb();

		initHorizontalScroll();	//horizontal scroll wrap width

		scrollMenu.init();			// scroll에 따른 메뉴 활성화
		snsShare.init();			// snsshare 메뉴
		initInfoSlider();			// #infoSlider bxSlider
		keyboardAction();			// input 포커스 시 하단 고정 버튼 클래스 추가

		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		// WindowOpener eventManager 연결
		eventManager.on(WINDOWOPENER_EVENT.REFRESH, onWinOpenerRefreshListener)
					.on(WINDOWOPENER_EVENT.DESTROY, onWinOpenerDestoryListener);

		// MeberInfo event Listener
		eventManager.on(MEMBERINFO_EVENT.WILD_CARD, onMemberInfoHandler);


		// info slider event Listener
		eventManager.on(INFOSLIDER_EVENT.REFRESH, infoSliderRefreshHandler)
					.on(INFOSLIDER_EVENT.DESTROY, infoSliderDestoryhHandler);

		// info slider event Listener
		eventManager.on(INFOSLIDER_EVENT.REFRESH, onWinOpenerRefreshListener)
					.on(INFOSLIDER_EVENT.DESTROY, onWinOpenerDestoryListener);

		eventManager.on(CARD_LIST_EVENT.APPENDED, cardAppendedHandler);


		initAddressPopupButton();	// 주소록 팝업버튼

		cardList().initOverEffect();

		$('.btnToggle').on('click', function(e) { // common slideToggle
			var btn = $(this);
			e.preventDefault();
			$(this).toggleClass('open');
			$(this).siblings('.slideCon').slideToggle();
			$(this).siblings('.slideCon').find('.btnClose').on('click', function(e) {
				e.preventDefault();
				$(this).closest('.slideCon').slideUp();
				$(btn).removeClass('open')
			})
		});


		// 임시 이벤트 디텍팅 처리
		$.each(['show', 'hide'], function (i, ev) {
			var el = $.fn[ev];
			$.fn[ev] = function () {
				this.trigger(ev);
				return el.apply(this, arguments);
			};
		});

		$('.header .menuhWrap').on('show hide', function(e) {
			var type = e.type;
			switch(type) {
				case 'show':
					$(document).on('touchmove', function(e) {
						var target = $(e.target);
						if (target.hasClass('menuhWrap') || target.closest('.menuhWrap').size()) {
						} else {
							e.preventDefault();
						}
					});
					break;
				default:
					$(document).off('touchmove');
					break;
			}
		});

		$('nav.gnb').on('show hide', function(e) {
			var type = e.type;
			switch(type) {
				case 'show':
					$(document).on('touchmove', function(e) {
						var target = $(e.target);
						if (target.hasClass('.gnb') || target.closest('.gnb').size()) {
						} else {
							e.preventDefault();
						}
					});
					break;
				default:
					$(document).off('touchmove');
					break;
			}
		});

		$('.searchToggle').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('searchOpen');
			$(this).siblings('.searchCon').slideToggle();
		});

		$('.btnMore').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('opened');
			$(this).parent().parent().find('.slideMore').slideToggle();
		});

		$('#mobileScrap li').each(function() { // scrap fadeToggle
			$(this).find('.scrapMore').on('click', function() {
				$(this).toggleClass('opened');
				$(this).parent().find('.scrapMoreList, .dim').fadeToggle();
			})
		});

		$(".periodSearch > a").on('click', function(e) { //mypage order
			e.preventDefault();
			var tg = $(this);
			if( !$(".searchArea").is(":visible") ) {
				$(".searchArea").css("display","block");
				tg.find("> em").addClass("up")
			}else{
				$(".searchArea").css("display","none");
				tg.find("> em").removeClass("up")
			}
		});

		$('.optList > li').each(function() { // 상품 list option 삭제 버튼
			$(this).find('.btnDel').click(function() {
				$(this).parent().parent().hide();
			})
			$(this).find('.option').eq(0).find('.btnDel').click(function() {
				$(this).parent().parent().next().css('border-top','0');
			})
		});

		var widthSlider = $(".portfolioArea > ul").bxSlider({ // 전문가 상세 이미지 인덱스 체크
			pager : false,
			onSliderLoad  : function() {
				var max = $(this).find('li').filter(':not(.bx-clone)').size();
				$(".portfolioArea .count").find("em").text( max );
				$(".portfolioArea .count").find("i").text( (max-max) + 1 );
			},
			onSlideAfter : function($slideElement, oldIndex, newIndex){
				$(".portfolioArea .count").find("i").text( newIndex + 1 );
			}
		});

		$('.tabWrap a').click(function(){
			if (widthSlider && widthSlider.size()) {
				widthSlider.reloadSlider(); 
			}
		}) 

		$(".optList > li").each(function(){ // 마이페이지-주문상세
			$(this).find(".hiddenArea").parent("li").next().css({
				border:0,
				paddingTop : 0
			})
		});

		$.fn.showArea = function(){ // 마이페이지-주문상세
			return this.each(function(){
				var tg = $(this);
				tg.on("click", function(e){
					e.preventDefault();
					if( !tg.hasClass("active") ){
						tg.addClass("active").text("접기");
						tg.next().stop().slideDown();
					}else{
						tg.removeClass("active").text("더보기")
						tg.next().stop().slideUp();
					}
				})
			})
		}
		$(".hiddenArea > a").showArea();

		$(".helpList li").on("click", function(){ //  도움말 상세
			var tg = $(this)
			 if( !tg.find(".con").is(":visible") ){
			 	$(".helpList li").removeClass("active");
			 	tg.addClass("active");
			 	$(".helpList li").find(".con").stop().slideUp();
			 	tg.find(".con").stop().slideDown();
			 }else{
			 	$(".helpList li").removeClass("active");
			 	tg.find(".con").stop().slideUp();
			 }
		});
		$(".helpList li").find(".con").on("click", function(e){
			e.stopPropagation();
		})

		$('.mSlide').bxSlider({ //magazine slide
			controls:false
		});

		$('.spSlide').bxSlider({ //magazine slide
			controls:true
		});
	}

	function initInfoSlider() {
		if (!$('#infoSlider').data('bxSlider')) {
			$('#infoSlider').bxSlider({
				pager:false
			});
		}
	}

	function initHorizontalScroll() {
		$('.scrollWrap').each(function() {//horizontal scroll wrap width
			var totalWidth = 0,
			margin = 0,
			setWidth = 0;
			$(this).find('li').each(function(index) {
				totalWidth += parseInt($(this).outerWidth(), 10);
				margin += parseInt($(this).css('margin-right'), 10);
			});
			setWidth = totalWidth + margin + 1;
			$(this).find('ul').css('width', setWidth);

			if ($(window).outerWidth() > setWidth) {
				$(this).find('ul').css({ 'margin-left' : ($(window).outerWidth() - setWidth) / 2 });
			} else {
				if (!$(this).find('li.on').size()) return;
				if ($(this).find('li.on').offset().left < $(window).outerWidth()) return;
				$(this).stop().animate({scrollLeft: $(this).find('li.on').offset().left}, 1000);
			}
		})
	}

	/**
	 * 휴대폰 수정(=실명인증) 진행
	 */
	function requestVerifyMember(e, authType) {
		e.preventDefault();

		Super.htmlPopup('../_popup/popCheckId.html', '100%', 'popEdge', {
			onOpen:function() {
				$('#requestVerifyMemberForm').submit(function(e){
					e.preventDefault();
					var id = $('#verifyPhoneNumber').val();
					if (util.checkValidMobileNumber(id)) {
						memberInfoController.verifyMemberByPhone(id, authType);
					} else {
						alert('휴대폰 번호를 정확하게 입력해주세요.');
					}
					e.stopPropagation();
				});
			}
		});
		
		e.stopPropagation();
	};

	/**
	 * 휴대폰 실명인증 결과 핸들링
	 */
	function verifyMemberResultHandler(e, status, authData) {
		switch(Number(status)) {
			case 200:
				Super.alertPopup('본인확인이 완료되었습니다.', authData.message, '확인', function(){
					location.reload(true);
				});
				memberInfoController.getMyInfo();
				break;
			default:
				Super.alertPopup('본인확인에 실패하였습니다.', authData.message, '확인');
				break;
		}
	};
	

	/**
	 * 내 정보 갱신 반영
	 */
	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();

		if (loginData != null) {
			var email = loginData.email == null ? '' : loginData.email;

			// 로그인 상태일 때
			$('body').addClass('login');
			$('#buttonLogInTop').remove();
			// #topMemberInfoAlarm - ?
			$('#topMemberInfo').show();
			$('#settingButton').show();

			if (loginData.imageUrl != null) {
				$('#topMemberInfoPic').attr('src', loginData.imageUrl);
			} else {
				$('#topMemberInfoPic').attr('src', '/images/profile.png');
			}
			$('#topMemberInfoName').attr('href', '/myPage/').text(loginData.memberName+' 님');

			if (loginData.imageUrl != null) {
				$('#profileImage').attr('href', '/myPage/').attr('src', loginData.imageUrl);
			} else {
				$('#profileImage').attr('href', '/myPage/').attr('src', '/images/profile.png');
			}
			$('#profileName').html('<span>'+loginData.memberName+' 님</span><br>'+email);
			$('#myMenuButtonList').removeClass('log');
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').find('span').text('마이커먼');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');

			$('#menuCountOrderGoods').text(loginData.myMenu.orderCount || 0);
			$('#menuCountCancelGoods').text(loginData.myMenu.claimCount || 0);
			$('#menuCountRecentViewItem').text(loginData.myMenu.recentCount || 0);
			$('#menuCountOrderNewform').text(loginData.myMenu.contractorCount || 0);
			if (loginData.myActivity.cartCount == 0) {
				$('#menuCountCart').hide();
			} else {
				$('#menuCountCart').text(loginData.myActivity.cartCount);
			}

			$('.profileEditButton').click(function(e){
				e.preventDefault();
				closeSideMenu();
				if (loginData.joinSectionCode == "BM_JOIN_SECTION_02") {
					confirmPasswordResultHandler(null, 200);
				} else {
					Super.htmlPopup('../../_popup/popCheckPw.html', '100%', 'popEdge', {
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
		} else {
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
	};

	function confirmPasswordResultHandler(e, status, result) {
		switch(status) {
			case 200:
				Cookies.set('profileEditAuth', 'auth', { expires: 1/1440 });	// 1 minutes
				// location.href = '/myPage/profileEdit.html';
				location.href = '/myPage/profilePreview.html';
				break;
			case 400:
				alert(result.message);
				break;
		}
	}

	/**
	 * GNB 초기화
	 */
	function initGnb() {
		$('#searchOpen').on('click', function(e) {
			e.preventDefault();
		});

		$("#gnbBtn").on("click", function(e) {
			e.preventDefault();
			openSideMenu();
		});

		$("#closeGnbBtn").on("click", function(e) {
			e.preventDefault();
			closeSideMenu();
		});

		$("body").on("click", ".dimBg", function() {
			closeSideMenu();
		});

		$("#menuToggle").on("click", function(e) {
			e.preventDefault();
			if( !$(".hiddenMenu").is( ":visible" ) ) {
				$(".hiddenMenu").addClass("active");
				// $(".gnb").css({
				// 	minHeight : $(window).height() + 480
				// });
			} else {
				$(".hiddenMenu").removeClass("active");
				// $(".gnb").css({
				// 	minHeight : $(".gnb").height() - 330
				// });
			}
		});
	};

	/**
	 * 주소록 시스템팝업 버튼 초기화
	 * 시스텝 팝업 설정
	 */
	function initAddressPopupButton() {
		onWinOpenerDestoryListener();
		$('.openAddressPopup, .openWindowPopup').on('click', onWindowPopupHandler);
		eventManager.on(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
	}

	/**
	 * onWindowPopupHandler
	 * @example
	 <a href="/popup/popMessage.html" class="btnSizeM btnColor03 openWindowPopup"
		data-winpop-opts='{
		"name" : "messagePopup",
		"height" : 900
		}'>1:1 메세지</a>
	 */
	function onWindowPopupHandler(e, href, opts) {
		e.preventDefault();

		if (opts == undefined) opts = {};
		if (opts.name !== 'snsshare' && loginData == null) {
			$(document).trigger('needLogin');
			return;
		}

		var opts = {
			name : 'addressPopup',
			left : null,
			top : null,
			width : 770,
			height : 730,
			menubar : 'no',
			status : 'no',
			resizable : 'no',
			fullscreen : 'no'
		},
		target = $(e.currentTarget),
		href = href || target.attr('href'),
		optStr = '',
		winPopup;
		
		if (target.data('winpop-opts') != undefined) opts = $.extend({}, opts, target.data('winpop-opts'));

		opts.left 	= opts.left || (window.screen.width/2 - opts.width/2) || 0;
		opts.top 	= opts.top || (window.screen.height/2 - opts.height/2) || 0;

		$.map(opts, function(value, key) {
			if ((key === 'width' || key === 'height') && value === '100%') {
				if (key === 'width') {
					value = $(window).width();
				} else {
					value = $(window).height();
				}
			}
			optStr += key + '=' + value + ',';
		});

		winPopup = window.open(href, opts.name, optStr);
		// window.open($(this).attr('href'), 'addressPopup', 'width=770,height=730,menubar=no,status=no,toolbar=no,resizable=no,fullscreen=no');

		if (!winPopup) {
			window.alert('팝업 차단기능 혹은 팝업차단 프로그램이 동작중입니다.\n팝업 차단 기능을 해제한 후 다시 시도하세요.');
			return;
		}

		e.stopPropagation();
	}

	/**
	 * GNB open
	 */
	function openSideMenu() {//.css({minHeight: $(window).height() + 150 })
		$(".gnb").addClass("acitve").stop().animate({right:0}, 400, function() {
			$(".container").addClass("fix");
			$(".header").addClass("fix");
		});
		if( $(".hiddenMenu").hasClass( "active" ) ){
			// $(".gnb").css({
			// 	minHeight : $(window).height() + 480
			// });
		}
		$("body").append("<div class='dimBg'><div>");
	};

	/**
	 * GNB close
	 */
	function closeSideMenu() {
		$(".gnb").stop().animate({right:-300}, 400, function() {
			$(this).removeClass("acitve");
			$(".container").removeClass("fix");
			$(".header").removeClass("fix");
		});
		$(".dimBg").remove();
		$(document).off('touchmove');
	};

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


	function cardAppendedHandler(e) {
		initAddressPopupButton();
	};

	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxRefreshListener(e) {
		cardList().initOverEffect();
		snsShare.refresh();
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
				return (loginDataModel.loginData()) ? true : false;
				break;
		}
	}


	function onWinOpenerRefreshListener(e) {
		onWinOpenerDestoryListener();
		initAddressPopupButton();
	}

	function onWinOpenerDestoryListener(e) {
		$('.openAddressPopup, .openWindowPopup').off('click', onWindowPopupHandler);
		eventManager.off(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
	}
	function keyboardAction(){		
		var is_keyboard = false;
		var is_landscape = false;
		var initial_screen_size = window.innerHeight;

		/* Android */
		window.addEventListener("resize", function() {
			is_keyboard = (window.innerHeight < initial_screen_size);
			is_landscape = (screen.height < screen.width);
			
			updateViews();
		}, false);

		/* iOS 
		$('input').bind('focus blur',function() {
			$(window).scrollTop(10);
			is_keyboard = $(window).scrollTop() > 0;
			$(window).scrollTop(0);
			updateViews();
		});*/

		function updateViews() {
			if (is_keyboard) {
				$('.js-btmFix-btn').addClass('keyUp');
			} else {
				$('.js-btmFix-btn').removeClass('keyUp');
			}
		}
	}
}