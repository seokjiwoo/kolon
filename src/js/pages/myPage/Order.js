/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	fileName = 'myPage/Order.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass(),
	dropDownMenu =  require('../../components/DropDownMenu.js'),
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

		setElements();
		setBindEvents();
		setRangePicker();
	}

	function setElements() {
	}

	function setBindEvents() {
		$('.drop').filter(':not(.dropChk)').on(dropDownMenu.EVENT.CHANGE, onDropMenuChange);
		$('.dropChk').on(dropDownMenu.EVENT.CHANGE, onDropCheckMenuChange);
	}

	function onDropMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropMenuChange', target, target.val(), data);
	}

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.val(), data);
	}

	function setRangePicker() {
		var rangePicker = $('.js-range-picker');
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-from'),
					altField : rangePicker.find('.js-alt-from'),
					button : rangePicker.find('.js-btn-from')
				},
				to : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-to'),
					altField : rangePicker.find('.js-alt-to'),
					button : rangePicker.find('.js-btn-to')
				}
			}
		});
	}
};