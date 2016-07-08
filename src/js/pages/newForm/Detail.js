/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'newForm/Detail.js';

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

		$('.socialBtnOpen').click(function(e){
			e.preventDefault();
			if ($(this).parent('.socialBtn').hasClass('active')) {
				$(this).parent('.socialBtn').removeClass('active');
			} else {
				$(this).parent('.socialBtn').removeClass('active').addClass('active');
			}
		});
		$('.socialBtnClose').click(function(e){
			e.preventDefault();
			$(this).parent('.socialBtn').removeClass('active');
		});

	}

	// function socialBtn() {
	// 	$('.socialBtn').on('click', function() {
	// 		if ($('.socialBtn').hasClass('active')) {
	// 			$(this).removeClass('active');
	// 		} else {
	// 			$(this).removeClass('active').addClass('active');
	// 		}
	// 	};
	// 	$('.socialBtn06 ').on('click', function() {
	// 		$(this).parents('.socialBtn').removeClass('active');
	// 	}
	// }
};