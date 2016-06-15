/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	DEBUG = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	FILE_NAME = 'MpMyServiceDetail.js';

	var SuperClass = require('./Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		DEBUG.log(FILE_NAME, 'init');
		
		var diff = util.diffDay({ startDate : '2016.04.15', endDate : '2016.04.30'});

		DEBUG.log(FILE_NAME, 'diffDay', diff.diffDay);
	}
};