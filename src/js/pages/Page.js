/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var lnbScroller;

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
	
	function init() {
		Super.init();
		
		// common
		initMenu();
		initFloating();
		opinionToggle();
		initCardRadio();
		btnDel();
		tableHeight()
		conFirm();
		bannerClose();
		
		$('#sortToggle').on('click', function(e) {//category search drop-down
			e.preventDefault();
			$(this).toggleClass('opened');
			$('.catSort .sortCont, .btnSort').slideToggle(300);
		});

		$('#expertList').bxSlider({ //expert top slide
			minSlides: 5,
			maxSlides: 5,
			pager:false,
			slideWidth: 200,
			slideMargin:20
		});

		$('#mainSlider').bxSlider({ //main slide
			minSlides: 5,
			maxSlides: 5
		});
			
		// tab width depend on number of li
		var countMenu = $('.tabType01 li').length ;
		$('.tabType01 li').css('width',100/countMenu+'%');
	};
	
	function initMenu() {
		if (Super.loginData == null) {
			// 로그인 상태가 아닐 때
			$('#topMemberInfo').remove();	

			// $('#profileImage').attr('src', '/images/profile.png');
			// $('#profileName').html('<span>로그인 해주세요</span>');
			$('#myMenuButtonList').addClass('log');
			//$('#btnJoinMyPage').attr('href', '/member/login.html').addClass('btnMypage').text('로그인 / 회원가입');
			$('#menuToggle').hide();
			//$('#buttonLogInOut').attr('href', '/member/login.html').text('로그인');
		} else {
			// 로그인 상태일 때
			$('#buttonLogInTop').remove();
			// #topMemberInfoAlarm - ?
			if (Super.loginData.imageUrl != null) $('#topMemberInfoPic').attr('href', '/myPage/').attr('src', '');
			$('#topMemberInfoName').attr('href', '/myPage/').text(Super.loginData.nickName+' 님');

			if (Super.loginData.imageUrl != null) $('#profileImage').attr('href', '/myPage/').attr('src', '');
			$('#profileName').html('<span>'+Super.loginData.nickName+' 님</span><br>'+Super.loginData.email);
			$('#myMenuButtonList').removeClass('log');
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').text('나의 커먼');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');
		}

		lnbScroller = new IScroll('#lnbWrapper', {
			click: true, 
			mouseWheel: true,
			scrollbars: true,
			fadeScrollbars: true,
			bounce: false
		});

		$('#btnLnb').on('click', function(e) {//lnb open
			e.preventDefault();
			$('#lnbWrapper').animate({'left':'0'}, 500);
		});
		$('#profileClose').on('click', function(e) {//lnb close
			e.preventDefault();
			$('#lnbWrapper').animate({'left':'-285px'}, 500);
		});
		$('.depth01').on('click', function(e) {//lnb menu drop-down
			e.preventDefault();
			$(this).siblings().slideToggle(400, function() {
				console.log(';;;');
				lnbScroller.refresh();
			});
		});
		$('#menuToggle').on('click', function(e) {//lnb profile drop-down
			e.preventDefault();
			$(this).toggleClass('opened');
			$('#myMenu').slideToggle(400, function() {
				console.log(';;;');
				lnbScroller.refresh();
			});
		});
		$('#searchOpen').on('click', function(e) {// search drop-down
			e.preventDefault();
			var searchBtn = $(this).parent().parent().hasClass('bannerHide');
			if (searchBtn){
				if($(this).hasClass('opened')){
					$(this).removeClass('opened');
					$('#searchWrap').animate({'top':'-177px'},250);
				} else {
					$(this).addClass('opened')
					$('#searchWrap').animate({'top':'60px'},250);
				}
			}else {
				if($(this).hasClass('opened')){
					$(this).removeClass('opened');
					$('#searchWrap').animate({'top':'-177px'},250);
				} else {
					$(this).addClass('opened')
					$('#searchWrap').animate({'top':'177px'},250);
					$('.bannerClose').on('click', function(){
						$('#searchOpen').removeClass('opened');
						$('#searchWrap').animate({'top':'-177px'},250);
					})
				}
			}
		});
		$(window).scroll(function () { // topMenu scroll bg
			if ($(document).scrollTop() > 60){
				$('.topMenu').css('background','#fff');
			}else{
				$('.topMenu').css('background','none');
			}
		});
	};
	
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
				$('#floatingMenu a').removeClass('on');
				$('.flPop').animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack'
				});
				$('#dim').stop().fadeOut(100);
				$('.pointer').hide().css('right','84px');
			} else {
				$(this).addClass('opened');
				$('.floating04').queue('fx',[]).stop().animate({'top':'-65px'}, {
					duration: 300, 
					easing: 'easeOutBack',
					complete: function(){
						$(this).find('.menuTit').animate({'right':'60px'},50)
					}
				});
				$('.floating03').queue('fx',[]).stop().animate({'top':'-125px'}, { 
					duration: 400, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).stop().find('.menuTit').animate({'right':'60px'},50)
					}
				});
				$('.floating02').queue('fx',[]).stop().animate({'top':'-185px'}, {
					duration: 500, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).find('.menuTit').animate({'right':'60px'},50)
					}
				});
				$('.floating01').queue('fx',[]).stop().animate({'top':'-245px'}, {
					duration: 600, 
					easing: 'easeOutBack', 
					complete: function(){
						$(this).find('.menuTit').animate({'right':'60px'},50)
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
				$(floatingBtn).siblings('.pointer').hide().css('right','84px');
			} else {
				$('#floatingMenu a.on').siblings('.pointer').hide().css('right','84px');
				$('#floatingMenu a.on').removeClass('on')
				$(this).addClass('on');
				$(floatingLy).siblings().queue('fx',[]).animate({'bottom':'-100%'},{
					duration: 500, 
					easing: 'easeInBack'
				});
				$(floatingLy).animate({'bottom':'70px'},{
					duration: 700, 
					easing: 'easeOutBack',
					complete: function(){
						$(floatingBtn).siblings('.pointer').show().animate({'right':'66px'},200);
					}
				});
				$('#floatingMenu').find('.menuTit').animate({'right':'3px'},50);
				$('#dim').stop().fadeIn(100);
			}
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
	
	function initCardRadio(){	
		$('.cardCollect label').click(function(){// 개인화 수집 카드
			if ($(this).siblings('input').val() != ':checked'){			
				$(this).parent().addClass('on');
				$(this).parent().siblings().removeClass('on');
			}
		});
	};

	// 11의견묻기_02의견묻기작성 (작성하기영역 열기,닫기)
	function opinionToggle(){
		var selecter = null,
			 opinion = null;
		function init(){
			selecter =".opinionwrite > .toggleBtn",
			opinion = ".opinionInput";
			initEvent();
		}
		function initEvent(){
			$(selecter).on("click", function(e){
				e.preventDefault();
				showContent( $(this) )
			});
		};
		function showContent(tg){
			if( !tg.hasClass("active") ){
				tg.addClass("active").find("span").text("의견 작성하기 접기");
				$(opinion).stop().slideDown();
			}else{
				tg.removeClass("active").find("span").text("의견 작성하기");
				$(opinion).stop().slideUp();
			}
		};
		init();
	};

	// 마이페이지-일대일 메시지-모든메시지 삭제버튼 클릭시 실행
	function conFirm(){
		$("#conFirm").on("click", function(){
			confirm("메시지내용을모두삭제하시겠습니까?\n삭제하실경우메시지내용이모두삭제되며1:1메시지목록에서도삭제됩니다.");
		});
	}

	function btnDel(){
		$('.optList').each(function(){ // 'myPage/cartGoods.html (배송형 상품)' option 삭제 버튼
			$(this).find('.btnDel').click(function(){
				$(this).parent().hide();
			})
			$(this).find('.option').eq(0).find('.btnDel').click(function(){
				$(this).parent().next().css('border-top','0');
			})
		});
	}

	function tableHeight(){ // '/order/orderGoods.html, /order/orderService.html'주문결재 결재방법 테이블 높이
		$('.pay').each(function(){
			var tbHC = $(this).height() - 115;
			$(this).find('.tbHV table').css('height',tbHC);
		})
	}

	function bannerClose(){ // main banner 닫기
		$('.bannerClose').click(function(){
			$(this).parent().parent().addClass('bannerHide');
			$('.main .container').css('padding-top','0')
		});
	}
}