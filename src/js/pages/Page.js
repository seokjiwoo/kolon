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
	dropDownMenu = require('../components/DropDownMenu.js'),
	dropDownScroll = require('../components/DropDownScroll.js'),
	snsShare = require('../components/SnsShare.js'),
	eventManager = require('../events/EventManager'),
	cardList = require('../components/CardList.js'),
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	MEMBERINFO_EVENT = events.MEMBER_INFO,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	WINDOWOPENER_EVENT = events.WINDOW_OPENER,
	CARD_LIST_EVENT = events.CARD_LIST;

	var memberInfoController = require('../controller/MemberInfoController');
	$(memberInfoController).on('verifyMemberResult', verifyMemberResultHandler);
	
	var FloatMenu = require('../components/FloatingMenu.js'),
	floatMenu = FloatMenu();
	
	$(document).on('verifyMember', requestVerifyMember);

	return callerObj;
	
	function init(_pageId) {
		pageId = _pageId;
		if (pageId == undefined) pageId = $('body').data('pageId');
		Super.init(pageId, 'pc');
		
		// 전 페이지 공용 요소 초기화
		initMenu();			// GNB/LNB
		floatMenu.init();		// 플로팅버튼

		// 일부 페이지 공용 요소 초기화
		initChart();	// 차트 컴포넌트
		dropDownMenu.init();	// 드롭다운 메뉴
		dropDownScroll.init();		// 드롭다운스크롤 메뉴
		snsShare.init();			// snsshare 메뉴
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
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);

		// MeberInfo event Listener
		eventManager.on(MEMBERINFO_EVENT.WILD_CARD, onMemberInfoHandler);

		// info slider event Listener
		eventManager.on(INFOSLIDER_EVENT.REFRESH, infoSliderRefreshHandler)
					.on(INFOSLIDER_EVENT.DESTROY, infoSliderDestoryhHandler);

		// info slider event Listener
		eventManager.on(INFOSLIDER_EVENT.REFRESH, onWindowPopupRefresh)
					.on(INFOSLIDER_EVENT.DESTROY, onWindowPopupDestory);

		eventManager.on(CARD_LIST_EVENT.APPENDED, cardAppendedHandler);

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
				$('#topMemberInfoPic').attr('src', '/images/profile40.jpg');
			}
			$('#topMemberInfoName').attr('href', '/myPage/').text(loginData.memberName);

			if (loginData.imageUrl != null) {
				$('#profileImage').attr('href', '/myPage/').attr('src', loginData.imageUrl);
			} else {
				$('#profileImage').attr('href', '/myPage/').attr('src', '/images/profile100.jpg');
			}
			$('#profileName').html('<span>'+loginData.memberName+' 님</span><br>'+email);
			$('#myMenuButtonList').removeClass('log');
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').text('마이커먼');
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

			initTopBanner();
			
			$('.profileEditButton').click(function(e){
				e.preventDefault();
				closeLnbHandler();
				if (loginData.joinSectionCode == "BM_JOIN_SECTION_02") {
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
				e.stopPropagation();
			});

			$('.resendAuthMail').click(function(e){
				e.preventDefault();
				if (loginData.emailAuthYn != 'Y') {
					loginController.resendAuthMail(loginData.email);
				}
				e.stopPropagation();
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

	/**
	 * 상단 배너영역 초기화
	 */
	function initTopBanner() {
		console.log(loginData.stateCode, loginData.joinSectionCode, loginData.emailAuthYn);

		if (loginData == null || loginData.stateCode == "BM_MEM_STATE_02" || Cookies.get('topBannerHide') == 'hide') {
			// 푸로모션 배너영역
			hideTopBanner();
		} else if (loginData.joinSectionCode == 'BM_JOIN_SECTION_01' && loginData.emailAuthYn != 'Y') {
			topBannerShowFlag = true;
			$('#topBannerCheckArea').remove();
			
			$('#topBannerImage').attr('src', '/images/banner_email.jpg');
			$('#topBanner').css('background', '#ff849d').show();
			$('#topBannerLink').addClass('resendAuthMail'); 
			$('.container').css('padding-top','113px');
			$('#closeTopBannerButton').click(hideTopBanner);
			lnbScroller.refresh();
		} else if (loginData.stateCode == "BM_MEM_STATE_01") {
			topBannerShowFlag = true;

			$('#topBannerImage').attr('src', '/images/banner_phone.jpg');
			$('#topBanner').css('background', '#d3b295').show();
			$('#topBannerLink').addClass('profileEditButton'); 
			$('.container').css('padding-top','113px');
			$('#closeTopBannerButton').click(hideTopBanner);
			lnbScroller.refresh();
		} else {
			hideTopBanner();
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
	};
	
	/**
	 * GNB/LNB 초기화
	 */
	function initMenu() {
		// 로그인 상태가 아닐 때
		$('#topMemberInfo').hide();
		$('#settingButton').hide();
		$('#menuToggle').hide();

		lnbScroller = new IScroll('#lnbWrapper', {
			click: true, 
			mouseWheel: true,
			scrollbars: true,
			fadeScrollbars: true,
			bounce: false
		});

		$('#lnbWrapper').on('mousewheel DOMMouseScroll', function(e){ return false; });
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
	
		$(window).resize(setLnbSize);

		cardList().initOverEffect();
	};

	function openLnbHandler(e) {
		e.preventDefault();
		setLnbSize();
		if ($('#floatingToggle').hasClass('opened')) floatMenu.toggleFloatMenu();
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

	function setLnbSize(e) {
		if ($(window).width() > 1239){
			$('.topMenu, .search .subTop').css('margin-left','0');
		}
		$('#lnbWrapper').css('height', $(window).height()-(topBannerShowFlag?113:0)+'px');
		lnbScroller.refresh();
	};

	function cardAppendedHandler(e) {
		initAddressPopupButton();
	};

	/**
	 * 상단 배너영역 숨기기
	 */
	function hideTopBanner(e) {
		topBannerShowFlag = false;
		if ($('#topBannerCheckArea label').hasClass('on')) Cookies.set('topBannerHide', 'hide', { expires: 365 });

		$('#topBanner').hide();
		$('.container').css('padding-top','0');
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
	 * 시스텝 팝업 설정
	 */
	function initAddressPopupButton() {
		$('.openAddressPopup, .openWindowPopup').on('click', onWindowPopupHandler);
		eventManager.on(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
	}

	/**
	 * onWindowPopupHandler
	 * 1:1메시지 팝업과 주소록 팝업에서 사용중. 둘 다 로그인시에만 보이는 것들이라 로그인 여부 체크중. 차후에 뭔가 변경되면 코드 갱신 필요.
	 * @example
	 <a href="/popup/popMessage.html" class="btnSizeM btnColor03 openWindowPopup"
		data-winpop-opts='{
		"name" : "messagePopup",
		"height" : 900
		}'>1:1 메세지</a>
	 */
	function onWindowPopupHandler(e, href, opts) {
		e.preventDefault();

		if (loginData == null) {
			alert('로그인이 필요합니다.');
			location.href = '/member/login.html';
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

		opts.left 	= opts.left || (window.screen.width/2 - opts.width/2);
		opts.top 	= opts.top || (window.screen.height/2 - opts.height/2);

		$.map(opts, function(value, key) {
			optStr += key + '=' + value + ',';
		});

		winPopup = window.open(href, opts.name, optStr);

		if (!winPopup) {
			window.alert('팝업 차단기능 혹은 팝업차단 프로그램이 동작중입니다.\n팝업 차단 기능을 해제한 후 다시 시도하세요.');
			return;
		}

		e.stopPropagation();
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
	
	/**
	 * 휴대폰 수정(=실명인증) 진행
	 * 
	 */
	function requestVerifyMember(e, authType) {
		e.preventDefault();

		Super.htmlPopup('../_popup/popCheckId.html', 650, 'popEdge', {
			onOpen:function() {
				$('#requestVerifyMemberForm').submit(function(e){
					e.preventDefault();
					var id = $('#verifyPhoneNumber').val();
					if (util.checkValidMobileNumber(id)) {
						memberInfoController.verifyMemberByPhone(id, authType);
					} else {
						alert('휴대폰 번호를 정확하게 입력해주세요.');
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
				Super.alertPopup('본인확인이 완료되었습니다.', authData.message, '확인');
				memberInfoController.getMyInfo();
				break;
			default:
				Super.alertPopup('본인확인에 실패하였습니다.', authData.message, '확인');
				break;
		}
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

	function onWindowPopupRefresh(e) {
		onWindowPopupDestory();
		$('.openAddressPopup, .openWindowPopup').on('click', onWindowPopupHandler);
		eventManager.on(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
	}

	function onWindowPopupDestory(e) {
		$('.openAddressPopup, .openWindowPopup').off('click', onWindowPopupHandler);
		eventManager.off(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
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