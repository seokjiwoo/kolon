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

	$('#floatingToggle').click(function(e){
		e.preventDefault();
		if($(this).hasClass('opened')){
			$(this).removeClass('opened');
			$('.floating04').animate({'top':'0'}, {
				duration: 300, 
				easing: 'easeInBack', 
			});
			$('.floating03').animate({'top':'0'}, {
				duration: 400, 
				easing: 'easeInBack', 
			});
			$('.floating02').animate({'top':'0'}, {
				duration: 500, 
				easing: 'easeInBack', 
			});
			$('.floating01').animate({'top':'0'}, {
				duration: 600, 
				easing: 'easeInBack', 
			});
		} else {
			$(this).addClass('opened');
			$('.floating04').animate({'top':'-65px'}, {
				duration: 300, 
				easing: 'easeOutBack', 
			});
			$('.floating03').animate({'top':'-125px'}, {
				duration: 400, 
				easing: 'easeOutBack', 
			});
			$('.floating02').animate({'top':'-185px'}, {
				duration: 500, 
				easing: 'easeOutBack', 
			});
			$('.floating01').animate({'top':'-245px'}, {
				duration: 600, 
				easing: 'easeOutBack', 
			});
		}
		
	});
});
