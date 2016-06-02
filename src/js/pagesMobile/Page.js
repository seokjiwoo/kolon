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
		console.log('mobile');
		var totalWidth = 0;
		$('.tabType01 li').each(function(index) {
			totalWidth += parseInt($(this).width(), 10);
		});
		$('.tabType01 ul').css('width',totalWidth);
	}
}