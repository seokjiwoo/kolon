/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/HomeService.js';

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
	},
	opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			categoryPop : 'dateChangePop'
		}
	},
	self;
	
	return callerObj;
	
	function init() {
		MyPage.init();

		debug.log(fileName, 'init');

		self = callerObj;

		setElements();
		initRangePicker();
		setBindEvents();
	}

	function setElements() {
		self.colorbox = $(opts.colorbox.target);
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

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					setHomeServiceLayer();
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					destoryHomeServiceLayer();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}

	function setHomeServiceLayer() {
		debug.log(fileName, 'setHomeServiceLayer');

		var rangePicker = self.colorbox.find('.js-range-picker');
		DatePicker.init({
			type : 'range',
			range : {
				from : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-from'),
					altField : rangePicker.find('.js-alt-from'),
					button : rangePicker.find('.js-btn-from'),
					minDate : 0
				},
				to : {
					wrap : rangePicker,
					picker : rangePicker.find('.js-picker-to'),
					altField : rangePicker.find('.js-alt-to'),
					button : rangePicker.find('.js-btn-to'),
					defaultDate : +5
				}
			}
		});

		dropDownMenu.init({
			wrap : self.colorbox
		});
	}

	function destoryHomeServiceLayer() {
		debug.log(fileName, 'destoryHomeServiceLayer');
		
		self.colorbox.find('.js-picker .js-picker').datepicker('destroy');
		$(dropDownMenu).trigger(dropDownMenu.EVENT.DESTROY);
	}

};