jQuery(function($) {
	cardLayout();
	$('#btnLnb').on('click', function(e) {//lnb open
		e.preventDefault();
		$('#lnb').animate({'left':'0'}, 500);
	});
	$('#profileClose').on('click', function(e) {//lnb close
		e.preventDefault();
		$('#lnb').animate({'left':'-285px'}, 500);
	});
	$('.depth01').on('click', function(e) {//lnb menu drop-down
		e.preventDefault();
		$(this).siblings().slideToggle();
	});
	$('#menuToggle').on('click', function(e) {//lnb profile drop-down
		e.preventDefault();
		$(this).toggleClass('opened');
		$('#myMenu').slideToggle();
	});
	$('.cardCollect label').click(function(){// 개인화 수집 카드
		if ($(this).siblings('input').val() != ':checked'){			
			$(this).parent().addClass('on');
			$(this).parent().siblings().removeClass('on');
		}
	});
	$('#searchOpen').on('click', function(e) {// search drop-down
		e.preventDefault();
		if($(this).hasClass('opened')){
			$(this).removeClass('opened');
			$('#searchWrap').animate({'top':'-60px'},250);
		} else {
			$(this).addClass('opened')
			$('#searchWrap').animate({'top':'60px'},250);
		}		
	});

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
			$('.lyPop').animate({'bottom':'-100%'},{
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
			$(floatingLy).animate({'bottom':'140px'},{
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
	$('#slideHomesin').bxSlider({ //floating 의견묻기
		minSlides: 2,
		maxSlides: 2,
		controls:false,
		slideWidth: 100,
	});
	$('#expertList').bxSlider({ //expert top slide
		minSlides: 5,
		maxSlides: 5,
		pager:false,
		slideWidth: 200,
		slideMargin:20
	});
	$('#infoSlider').bxSlider({ //expert top slide
		pager:false
	});
	$('#sortToggle').on('click', function(e) {//category search drop-down
		e.preventDefault();
		$(this).toggleClass('opened');
		$('.catSort ul').slideToggle(300);
	});
	$('.topTab a').on('click', function(e) {// floating menu laypopup
		var tabBtn = $(this);
		var tabCon = $(this).attr('href');
		e.preventDefault();
		$(tabBtn).parent().addClass('on').siblings().removeClass('on');
		$(tabCon).show().siblings().hide();
		if ($('ul').hasClass('cardWrap')){
			cardLayout();
		}
		
	});

});
function cardLayout(){	
	$('#cardWrap').isotope({//card layout
		itemSelector: '#cardWrap > li',
		masonry: {
			columnWidth: 100,
			gutter: 1
		}
	});
}
