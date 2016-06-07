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
		$('.btnToggle').on('click', function(e) {
			e.preventDefault();
			var slideCon = $(this).attr('href');
			$(this).toggleClass('open');
			$(slideCon).slideToggle();
		});
	}
}