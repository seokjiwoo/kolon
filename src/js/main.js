jQuery(function($) {
	$('.cardWrap').isotope({
		itemSelector: '.cardWrap > li',
		masonry: {
			columnWidth: 100,
			gutter: 1
		}
	});
	$('#btnLnb').click(function(e){
		e.preventDefault();
		$('#lnb').animate({'left':'0'}, 500);
	});
	$('#profileClose').click(function(e){
		e.preventDefault();
		$('#lnb').animate({'left':'-285px'}, 500);
	});
	$('.depth01').click(function(e){
		e.preventDefault();
		$(this).siblings().slideToggle();
	});
	$('#menuToggle').click(function(e){
		e.preventDefault();
		$('#myMenu').slideToggle();
	});
	$('.cardCollect label').click(function(){
		if ($(this).siblings('input').val() != ':checked'){			
			$(this).parent().addClass('on');
			$(this).parent().siblings().removeClass('on');
		}
	})
	$('a.cardCon').hover(function(){
    	$(this).parent().stop().animate({'background-size':'110%'}, 300);
    	$(this).find('.hoverCon').stop().slideDown(400);
    	$(this).find('.hoverOff').stop().slideUp(100);
    }, function(){
    	$(this).parent().stop().animate({'background-size':'100%'}, 300);
    	$(this).find('.hoverCon').stop().slideUp(100)
    	$(this).find('.hoverOff').stop().slideDown(400);
	});

});