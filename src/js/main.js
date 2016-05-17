jQuery(function($) {
	$('.cardWrap').isotope({
		itemSelector: '.cardWrap > li',
		masonry: {
			columnWidth: 100,
			gutter: 1
		}
	});
	$('#btnLnb').on('click', function(e) {
		e.preventDefault();
		$('#lnb').animate({'left':'0'}, 500);
	});
	$('#profileClose').on('click', function(e) {
		e.preventDefault();
		$('#lnb').animate({'left':'-285px'}, 500);
	});
	$('.depth01').on('click', function(e) {
		e.preventDefault();
		$(this).siblings().slideToggle();
	});
	$('#menuToggle').on('click', function(e) {
		e.preventDefault();
		$('#myMenu').slideToggle();
	});
	$('.cardCollect label').click(function(){
		if ($(this).siblings('input').val() != ':checked'){			
			$(this).parent().addClass('on');
			$(this).parent().siblings().removeClass('on');
		}
	});
	$('#searchOpen').on('click', function(e) {
		e.preventDefault();
		if($(this).hasClass('opened')){
			$(this).removeClass('opened');
			$('#searchWrap').animate({'top':'-60px'},250);
		} else {
			$(this).addClass('opened')
			$('#searchWrap').animate({'top':'60px'},250);
		}		
	});

	$('#floatingToggle').on('click', function(e) {
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
	
	$('#floatingMenu a').on('click', function(e) {
		e.preventDefault();
		if($(this).hasClass('on')){
			$(this).removeClass('on').siblings('.lyPop').queue('fx',[]).animate({'bottom':'-100%'},{
				duration: 500, 
				easing: 'easeInBack',
				complete: function(){
					$('#floatingMenu').find('.menuTit').animate({'right':'60px'},50);
				}
			});
			$('#dim').stop().fadeOut(100);
			$(this).siblings('.pointer').hide().css('right','84px');
		} else {				
			$('#floatingMenu a.on').siblings('.lyPop').queue('fx',[]).animate({'bottom':'-100%'},{
				duration: 500, 
				easing: 'easeInBack'
			});
			$('#floatingMenu a.on').siblings('.pointer').hide().css('right','84px');
			$(this).addClass('on').siblings('.lyPop').animate({'bottom':'140px'},{
				duration: 700, 
				easing: 'easeOutBack',
				complete: function(){
					$(this).siblings('.pointer').show().animate({'right':'66px'},200);
				}
			});
			$('#floatingMenu').find('.menuTit').animate({'right':'3px'},50);
			$('#dim').stop().fadeIn(100);
		}
	});
	
	$('#goTop').on('click', function(e) {
		e.preventDefault();
		$('body, html').animate({ scrollTop:0}, 400);
	});
});
