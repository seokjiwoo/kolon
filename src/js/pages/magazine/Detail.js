/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'magazine/Detail.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var controller = require('../../controller/MagazineController');
	$(controller).on('magazineInfoResult', getDetailHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		var articleNumber = util.getUrlVar().articleNumber;
		controller.info(articleNumber);
	};

	function getDetailHandler(e, status, result) {
		console.log(result);
	};
};