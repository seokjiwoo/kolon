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
	});
	$('#searchOpen').click(function(e){
		e.preventDefault();
		if($(this).hasClass('opened')){
			$(this).removeClass('opened');
			$('#searchWrap').animate({'top':'-60px'},250);
		} else {
			$(this).addClass('opened')
			$('#searchWrap').animate({'top':'60px'},250);
		}
		
	});

});
