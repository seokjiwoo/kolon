/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	fileName = 'Index.js';

	var SuperClass = require('./Page.js');
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
	}
};