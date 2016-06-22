/* global $ */

module.exports = function() {
	'use strict';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();

	var defParams = {
		minWidth : 1240,
		navi : '#hmNav'
	};
	var opts;
	var navi;
	var naviMarginLeft;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		$('#fullpage').fullpage({
			anchors: ['intro', 'move', 'cleaning', 'washing'],
			menu: '#hmNavLi',
			css3: true,
			scrollBar: true,
			onLeave : function(index, nextIndex, direction){
				if(index != 2){
					//moving the nav
					$('#hmNav').find('ul').removeClass('moveCenter').addClass('moveCenter');
				} else if (index == 2 && direction == 'up') {
					$('#hmNav').find('ul').removeClass('moveCenter');
				} $('.textBox').hide();
			},
			afterLoad: function(anchorLink, index){
	            var loadedSection = $(this);
	           //using anchorLink
	            if(anchorLink != 'intro'){
	            	$('.textBox').delay(200).fadeIn();
	            } 
	        }
		});

		opts = $.extend(true, defParams, window.jQuery);
		navi = $('body').find(opts.navi);
		naviMarginLeft = parseInt(navi.css('margin-left').split('px')[0]);

		onScrollListener();
		$(window).on('scroll resize', $.proxy(onScrollListener, this));
	};

	function onScrollListener() {
		var winWidth = winSize().w,
		scrLeft = $(document).scrollLeft();

		if (winWidth <= opts.minWidth) {
			navi.css({
				'left': opts.minWidth/2,
				'margin-left': naviMarginLeft + (scrLeft*-1)
			});
		} else {
			navi.css({
				'left': '',
				'margin-left': ''
			});
		}
	};

	function winSize() {
		var win_wh = {
			w : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			h : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		};
		return win_wh;
	};
}