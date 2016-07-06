/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'member/AccountReuse.js';

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
		debug.log(fileName, $, util);

		if (Cookies.get('accountReuse') != undefined) {
			//

			$('#reuseAuth').click(function(e){
				//
			});
		} else {
			alert('잘못된 접근입니다');
			location.href = '/';
		}
	}
};