/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var util = require('../../utils/Util.js');

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
		
		$('#messageField').html(decodeURI(util.getUrlVar().message));
		$('#moveButton').attr('href', decodeURI(util.getUrlVar().targetUrl));
	}
};