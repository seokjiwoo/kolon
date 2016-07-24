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
		},
		search : {
			wrap : '.js-order-search',
			inp : '.js-inp',
			submit : '.js-submit',
		},
		dateFormat : 'YYYYMMDD',
		orderFilter : '.js-order-filter .js-filter'
	},
	self;
	
	return callerObj;
	
	function init() {
		MyPage.init();

		self = callerObj;
		self.opts = opts;

		setElements();
		initRangePicker();
		setBindEvents();

		refreshListCritica();
	}

	function setElements() {
		self.colorbox = $(opts.colorbox.target);

		self.search = $(self.opts.search.wrap);
		self.searchInp = self.search.find(self.opts.search.inp);
		self.searchSubmit = self.search.find(self.opts.search.submit);
	}

	function initRangePicker() {
		setRangePicker();

		$('.js-picker-from').datepicker('setDate', moment().subtract(7, 'days').format('YYYY-MM-DD'));

		$('.js-sort-date li').click(function(e) {
			e.preventDefault();
			$(this).addClass('acitve').siblings('li').removeClass('acitve');
			switch($(this).text()) {
				case '1주일':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(7, 'days').format('YYYY-MM-DD'));
					break;
				case '2주일':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(14, 'days').format('YYYY-MM-DD'));
					break;
				case '1개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(1, 'months').format('YYYY-MM-DD'));
					break;
				case '3개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(3, 'months').format('YYYY-MM-DD'));
					break;
				case '6개월':
					$('.js-picker-from').datepicker('setDate', win.moment().subtract(6, 'months').format('YYYY-MM-DD'));
					break;
			}
			$('.js-picker-to').datepicker('setDate', win.moment().format('YYYY-MM-DD'));
			$('.js-picker-to').datepicker('option', 'minDate', win.moment($('.js-alt-from').val()).format('YYYY-MM-DD'));
			e.stopPropagation();

			refreshListCritica();
		});

		$('.js-sort-date li.js-default').trigger('click');
	};

	function refreshListCritica(e) {
		if (e != undefined) e.preventDefault();
		var fromDate = moment($('.js-picker-from').datepicker('getDate')).format('YYYY-MM-DD');
		var toDate = moment($('.js-picker-to').datepicker('getDate')).format('YYYY-MM-DD');
		controller.homeServiceCancelList(self.searchInp.val(), fromDate, toDate);
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
	};

	function setBindEvents() {
		$('#searchButton').click(refreshListCritica);
		self.search.on('submit', function(e) {
			e.preventDefault();
		});

		self.searchSubmit.on('click', onSearch);
		self.searchInp.on('keydown', onSearch);

		$(self.opts.orderFilter).on('click', onFilterChange);
	}

	function onFilterChange(e) {
		e.preventDefault();
		
		var target = $(e.currentTarget),
		values = target.data('filter');

		self.activeFilterIdx = target.closest('li').index() + 1;

		debug.log(fileName, 'onFilterChange', values);
		refreshListCritica();
	}

	function onSearch(e) {
		if (e.type === 'keydown') {
			if (e.which !== $.ui.keyCode.ENTER) {
				return;
			}
		}

		e.preventDefault();

		if (!self.searchInp.val() || self.searchInp.val() === ' ') {
			win.alert('검색어를 입력하세요.');
			self.searchInp.val('').focus();
			return;
		}

		refreshListCritica();
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

		$(self.opts.orderFilter).off('click', onFilterChange);
		$(self.opts.orderFilter).on('click', onFilterChange);
	};
};