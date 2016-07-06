/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'member/AccountReuse.js';
	
	var controller = require('../../controller/LoginController');
	$(controller).on('reuseAccountResult', reuseResultHandler);

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
			$('#userId').val(Cookies.get('accountReuse'));

			$('#reuseAuth').click(function(e){
				controller.reuseAccount();
			});
		} else {
			alert('잘못된 접근입니다');
			location.href = '/';
		}
	}

	function reuseResultHandler(e, status, result) {
		switch (status) {
			case 200:
				//
				break;
			default:
				Super.Super.alertPopup('휴면 계정 활성화', result.message, '확인');
				break;
		}
	}
};