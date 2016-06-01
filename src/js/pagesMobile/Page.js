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
	}
}