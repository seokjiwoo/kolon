/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
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
		
		console.log('mobile');

		$('.scrollWrap').each(function(){//horizontal scroll wrap width
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

		$('#mobileScrap li').each(function(){ // scrap fadeToggle
			$(this).find('.scrapMore').on('click', function(){
				$(this).toggleClass('opened');
				$(this).parent().find('.scrapMoreList, .dim').fadeToggle();
			})
		});

		$(".periodSearch > a").on('click', function(e){ //mypage order
			e.preventDefault();
			var tg = $(this);
			if( !$(".searchArea").is(":visible") ){
				$(".searchArea").css("display","block");
				tg.find("> em").addClass("up")
			}else{
				$(".searchArea").css("display","none");
				tg.find("> em").removeClass("up")
			}
		});

		$('.optList > li').each(function(){ // 상품 list option 삭제 버튼
			$(this).find('.btnDel').click(function(){
				$(this).parent().parent().hide();
			})
			$(this).find('.option').eq(0).find('.btnDel').click(function(){
				$(this).parent().parent().next().css('border-top','0');
			})
		});
	}
}