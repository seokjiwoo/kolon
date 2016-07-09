/* global $ */

module.exports = function() {
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		$('#floatingToggle').on('click', toggleFloatMenu);
		$('#floatingMenu a').on('click', floatPopup);

		$('#goTop').on('click', function(e) {// scroll top
			e.preventDefault();
			$('body, html').animate({ scrollTop:0}, 400);
		});

		$('#slideIn').bxSlider({ //floating 의견묻기
			minSlides: 2,
			maxSlides: 2,
			controls: false,
			slideWidth: 100,
		});
	}

	/**
	 * floating menu drop-down
	 */
	function toggleFloatMenu(e) {
		e.preventDefault();
		if ($(this).hasClass('opened')) {
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
			$('#floatingMenu a').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);;
			$('.flPop').animate({'bottom':'-100%'},{
				duration: 500, 
				easing: 'easeInBack'
			});
			$('#dim').stop().fadeOut(100);
		} else {
			$(this).addClass('opened');
			$('.floating04').queue('fx',[]).stop().animate({'top':'-65px'}, {
				duration: 300, 
				easing: 'easeOutBack',
				complete: function(){
					$(this).hover(
						function(){
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
							} 
						}, function() {
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
							}
						}
					)
				}
			});
			$('.floating03').queue('fx',[]).stop().animate({'top':'-125px'}, { 
				duration: 400, 
				easing: 'easeOutBack', 
				complete: function(){
					$(this).hover(
						function(){
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
							} 
						}, function() {
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
							}
						}
					)
				}
			});
			$('.floating02').queue('fx',[]).stop().animate({'top':'-185px'}, {
				duration: 500, 
				easing: 'easeOutBack', 
				complete: function(){
					$(this).hover(
						function(){
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
							} 
						}, function() {
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
							}
						}
					)
				}
			});
			$('.floating01').queue('fx',[]).stop().animate({'top':'-245px'}, {
				duration: 600, 
				easing: 'easeOutBack', 
				complete: function(){
					$(this).hover(
						function(){
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'120px'},200).find('.menuTit').stop().animate({'opacity':'1'},50);
							} 
						}, function() {
							if(!$(this).find('a').hasClass('on')){
								$(this).stop().animate({'width':'50px'},100).find('.menuTit').stop().animate({'opacity':'0'},50);
							}
						}
					)
				}
			});
		}
	};

	/**
	 * floating menu laypopup
	 */
	function floatPopup(e) {
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
		} else {
			$('#floatingMenu a.on').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);
			$(this).addClass('on');
			$(floatingLy).siblings().queue('fx',[]).animate({'bottom':'-100%'},{
				duration: 500, 
				easing: 'easeInBack'
			});
			$(floatingLy).animate({'bottom':'70px'},{
				duration: 700, 
				easing: 'easeOutBack'
			});
			$('#floatingMenu').find('.menuTit').animate({'right':'3px'},50);
			$('#dim').stop().fadeIn(100);
		}			
		$('.floating .closePop').on('click', function(e) {
			e.preventDefault();
			$(floatingLy).queue('fx',[]).animate({'bottom':'-100%'},{
				duration: 500, 
				easing: 'easeInBack',
				complete: function(){
					$('#floatingMenu').find('.menuTit').animate({'right':'60px'},50);
				}
			});
			$('#dim').stop().fadeOut(100);
			$('#floatingMenu a.on').removeClass('on').parent('li').animate({'width':'50px'},100).find('.menuTit').animate({'opacity':'0'},50);
		});
	};
}