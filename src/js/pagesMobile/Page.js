/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var loginController = require('../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	
	var pageId;
	
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

		initGnb();
		
		$(".datePicker").datepicker();	// datepicker 초기화

		$('.scrollWrap').each(function() {//horizontal scroll wrap width
			var totalWidth = 0;
			var margin = 0;
			$(this).find('li').each(function(index) {
				totalWidth += parseInt($(this).width(), 10);
				margin += parseInt($(this).css('margin-right'), 10);
			});
			$(this).find('ul').css('width',totalWidth+margin);
		})
		$('.btnToggle').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('open');
			$(this).siblings('.slideCon').slideToggle();
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

		$(".portfolioArea > ul").bxSlider({ // 전문가 상세 이미지 인덱스 체크
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

	}

	/**
	 * 내 정보 갱신 반영
	 */
	function myInfoResultHandler(e) {
		if (Super.loginData != null) {
			// 로그인 상태일 때
			$('body').addClass('login');

			$('#myMenuButtonList').removeClass('log');

			if (Super.loginData.imageUrl != null) $('#profileImage').attr('href', '/myPage/').attr('src', Super.loginData.imageUrl);
			$('#profileName').html('<em>'+Super.loginData.memberName+'</em>');
			$('#profileMail').text(Super.loginData.email);
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').html('<span>나의 커먼</span>');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');

			/*
			"myActivity": {
				"noticeNewYn": "N",
				"noticeCount": 1,
				"scrapCount": 3,
				"followCount": 3,
				"cartCount": 5,
				"likeCount": 1
			}
			*/
			$('#menuCountOrderGoods').text(Super.loginData.myMenu.orderCount);
			$('#menuCountCancelGoods').text(Super.loginData.myMenu.claimCount);
			$('#menuCountRecentViewItem').text(Super.loginData.myMenu.recentCount);
			$('#menuCountOrderNewform').text(Super.loginData.myMenu.contractorCount);
		}
	};

	/**
	 * GNB 초기화
	 */
	function initGnb() {
		if (Super.loginData == null) {
			// 로그인 상태가 아닐 때

			$('#myMenuButtonList').addClass('log');
			$('#myMenuButtonList li a').attr('href', '#').css('pointer-events', 'none');

			// $('#profileImage').attr('src', '/images/profile.png');
			$('#profileName').css('top', '10px').html('<span>로그인 해주세요</span>');
			//$('#btnJoinMyPage').attr('href', '/member/login.html').addClass('btnMypage').text('로그인 / 회원가입');
			$('#buttonLogInOut').attr('href', '/member/login.html').text('로그인');
			$('#menuToggle').hide();
		}

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
				$(".gnb").css({
					minHeight : $(window).height() + 480
				});
			} else {
				$(".hiddenMenu").removeClass("active");
				$(".gnb").css({
					minHeight : $(".gnb").height() - 330
				});
			}
		});
	};

	/**
	 * GNB open
	 */
	function openSideMenu() {
		$(".gnb").addClass("acitve").css({minHeight: $(window).height() + 150 }).stop().animate({left:0}, 400, function() {
			$(".container").addClass("fix");
			$(".header").addClass("fix");
		});
		if( $(".hiddenMenu").hasClass( "active" ) ){
			$(".gnb").css({
				minHeight : $(window).height() + 480
			});
		}
		$("body").append("<div class='dimBg'><div>");
	};

	/**
	 * GNB close
	 */
	function closeSideMenu() {
		$(".gnb").stop().animate({left:-300}, 400, function() {
			$(this).removeClass("acitve");
			$(".container").removeClass("fix");
			$(".header").removeClass("fix");
		});
		$(".dimBg").remove();
	};
}