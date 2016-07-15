/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var loginController = require('../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../model/LoginModel');
	var loginData;
	
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

	}

	/**
	 * 내 정보 갱신 반영
	 */
	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();

		if (loginData != null) {
			// 로그인 상태일 때
			$('body').addClass('login');

			$('#myMenuButtonList').removeClass('log');

			if (loginData.imageUrl != null) $('#profileImage').attr('href', '/myPage/').attr('src', loginData.imageUrl);
			$('#profileName').html('<em>'+loginData.memberName+'</em>');
			$('#profileMail').text(loginData.email);
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').html('<span>마이커먼</span>');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');

			$('#menuCountOrderGoods').text(loginData.myMenu.orderCount);
			$('#menuCountCancelGoods').text(loginData.myMenu.claimCount);
			$('#menuCountRecentViewItem').text(loginData.myMenu.recentCount);
			$('#menuCountOrderNewform').text(loginData.myMenu.contractorCount);
		} else {
			// 로그인 상태가 아닐 때
			$('#myMenuButtonList').addClass('log');
			$('#myMenuButtonList li a').attr('href', '#').css('pointer-events', 'none');

			// $('#profileImage').attr('src', '/images/profile.png');
			$('#profileName').css('top', '10px').html('<span>로그인 해주세요</span>');
			//$('#btnJoinMyPage').attr('href', '/member/login.html').addClass('btnMypage').text('로그인 / 회원가입');
			$('#buttonLogInOut').attr('href', '/member/login.html').text('로그인');
			$('#menuToggle').hide();
		}
	};

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