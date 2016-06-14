/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	DEBUG = require('../utils/Console.js'),
	FILE_NAME = 'OdOrderService.js';

	var SuperClass = require('./Page.js'),
	Super = SuperClass(),
	DatePickerClass = require('../components/DatePicker.js'),
	ConsultPicker = DatePickerClass(),
	BuildPicker = DatePickerClass(),
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

		setCunsultPicker();
		setBuildPicker();
	}

	// 희망 상담 영역 - datePicker 설정
	function setCunsultPicker() {
		DEBUG.log(FILE_NAME, 'setCunsultPicker > 희망 상담 영역 - datePicker 설정');

		var consultWrap = $('.js-picker');
		ConsultPicker.init({
			type : 'default',
			default : {
				wrap : consultWrap,
				picker : consultWrap.find('.js-picker'),
				altField : consultWrap.find('.js-alt'),
				button : consultWrap.find('.js-btn')
			}
		});
	}

	// 희망 시공 기간 영역 - datePicker 설정
	function setBuildPicker() {
		DEBUG.log(FILE_NAME, 'setBuildPicker > 희망 시공 기간 영역 - datePicker 설정');

		var buildWrap = $('.js-range-picker');
		BuildPicker.init({
			type : 'range',
			range : {
				from : {
					wrap : buildWrap,
					picker : buildWrap.find('.js-picker-from'),
					altField : buildWrap.find('.js-alt-from'),
					button : buildWrap.find('.js-btn-from')
				},
				to : {
					wrap : buildWrap,
					picker : buildWrap.find('.js-picker-to'),
					altField : buildWrap.find('.js-alt-to'),
					button : buildWrap.find('.js-btn-to')
				}
			}
		});
	}

};