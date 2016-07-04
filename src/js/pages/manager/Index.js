/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/Index.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);
		var slider = $('#managerSlider').bxSlider({
			pager:false,
			nextSelector: '#sliderNext',
  			prevSelector: '#sliderPrev',
			onSlideAfter: function (currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {
				switch(currentSlideHtmlObject) {
					case 0:
						$('.bx-prev').css('background-position','0 0');
						$('.bx-next').css('background-position','-174px 0');
						break;
					case 1:
						$('.bx-prev').css('background-position','-174px 0');
						$('.bx-next').css('background-position','-348px 0');
						break;
					case 2:
						$('.bx-prev').css('background-position','-348px 0');
						$('.bx-next').css('background-position','0 0');
						break;
				}
			}
		});
	}
}