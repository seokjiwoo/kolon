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
		var totalWidth = 0;
		$('.tabType01 li').each(function(index) {
			totalWidth += parseInt($(this).width(), 10);
		});
		$('.tabType01 ul').css('width',totalWidth);
		$('.except').dotdotdot();
	}
}