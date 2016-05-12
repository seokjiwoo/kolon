jQuery(function($) {
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
	$('.cardWrap').isotope({
		itemSelector: '.cardWrap li',
		masonry: {
			columnWidth: 100,
			gutter: 1
		}
	});

});