/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/HomeServiceCancel.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();

		debug.log(fileName, 'init');

		initRangePicker();
	}

	function initRangePicker() {
		setRangePicker();

		$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));
		$('.sortTerm li a').click(function(e) {
			e.preventDefault();
			$(this).addClass('on').parent().siblings('li').find('a').removeClass('on');
			switch($(this).text()) {
				case '1주일':
					$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));
					break;
				case '2주일':
					$('.js-picker-from').datepicker('setDate', moment().subtract(14, 'days').format('YYYY-MM-DD'));
					break;
				case '1개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(1, 'months').format('YYYY-MM-DD'));
					break;
				case '3개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(3, 'months').format('YYYY-MM-DD'));
					break;
				case '6개월':
					$('.js-picker-from').datepicker('setDate', moment().subtract(6, 'months').format('YYYY-MM-DD'));
					break;
			}
			$('.js-picker-to').datepicker('setDate', moment().format('YYYY-MM-DD'));
			e.stopPropagation();
		});
	};

	function setRangePicker() {
		var rangePicker = $('.js-range-picker');
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-from'),
					altField : rangePicker.find('.js-alt-from'),
					button : rangePicker.find('.js-btn-from'),
					minDate : null
				},
				to : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-to'),
					altField : rangePicker.find('.js-alt-to'),
					button : rangePicker.find('.js-btn-to'),
					maxDate : 0
				}
			}
		});
	}
};