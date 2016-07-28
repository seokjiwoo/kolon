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

		var targetUrl = decodeURI(util.getUrlVar().targetUrl),
		hasProtocol = /^https?:\/\//i;

		if (!hasProtocol.test(targetUrl)) {
			targetUrl = window.location.protocol + '//' + targetUrl;
		}

		if (util.getUrlVar().targetUrl && util.getUrlVar().key) {
			$('#moveButton').attr('href', targetUrl + '?key=' + util.getUrlVar().key);
		} else {
			$('#moveButton').attr('href', targetUrl);
		}
	}
};