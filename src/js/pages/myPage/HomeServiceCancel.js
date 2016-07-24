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
	DatePicker = DatePickerClass();
	
	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('homeServiceOrderListResult', listHandler);

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();

		self = callerObj;

		initRangePicker();
		setBindEvents();

		refreshListCritica();
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
			
			refreshListCritica();
			e.stopPropagation();
		});
	};

	function refreshListCritica(e) {
		if (e != undefined) e.preventDefault();
		var fromDate = moment($('.js-picker-from').datepicker('getDate')).format('YYYY-MM-DD');
		var toDate = moment($('.js-picker-to').datepicker('getDate')).format('YYYY-MM-DD');
		controller.homeServiceCancelList($('#recordInput').val(), fromDate, toDate);
		if (e != undefined) e.stopPropagation();
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

		$('.js-picker-from').on('onSelect', function() {
			refreshListCritica();
		});
		$('.js-picker-to').on('onSelect', function() {
			refreshListCritica();
		});
	};

	function setBindEvents() {
		$('#searchButton').click(refreshListCritica);
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

	function listHandler(e, status, result) {
		$.map(result.livingRequestHistoryList, function(each) {
			each.createDate = moment(each.createDateTime).format('YYYY. MM. DD');
		});
		
		renderData(result, '#homeservice-list-templates', '#homeservice-wrap', true);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};