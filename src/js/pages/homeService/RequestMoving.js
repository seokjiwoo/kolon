/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'homeService/RequestMoving.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass();
	
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
	
		setDatePicker();
	}

	function setDatePicker() {
		var datePicker = $('.js-picker');
		DatePicker.init({
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
		});
	}
};