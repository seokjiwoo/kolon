/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var util = require('../../utils/Util.js');
	
	var SuperClass = require('../Page.js'),
	Super = SuperClass();

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};

	return callerObj;
	
	function init() {
		Super.init();
		
		if (util.getUrlVar().message == undefined) {
			$('#messageField').hide();
		} else {
			$('#messageField').text(decodeURI(util.getUrlVar().message));
		}
	}
};