/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Point.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	DatePickerClass = require('../../components/DatePicker.js'),
	DropDownMenu = require('../../components/DropDownMenu.js'),
	DatePicker = DatePickerClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};

	var historyCode = '';

	var controller = require('../../controller/MyPageController.js');
	$(controller).on('myPointsResult', myPointsResultHandler);
	$(controller).on('pointsHistoryResult', pointsHistoryResultHandler);
	
	return callerObj;
	
	function init() {
		MyPage.init();

		initRangePicker();

		controller.myPoints();
		controller.pointsHistory(
			win.moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'),
			win.moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'),
			'BM_POINT_STMT_SECTION'
		);
		
		$('#typeSelect').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			historyCode = data.values[0];
		});
		$('#searchButton').click(function(e) {
			e.preventDefault();
			if (historyCode === '') {
				win.alert('적립/사용내역 중 하나를 선택해 주세요');
			} else {
				controller.pointsHistory(
					win.moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'),
					win.moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'),
					historyCode
				);
			}
		});
	}

	function myPointsResultHandler(e, status, result) {
		switch(status) {
			case 200:
				break;
			default:
				break;
		}

		result.point.savingPointDesc = util.currencyFormat(parseInt(result.point.savingPoint, 10));
		result.point.savingPointIn30Desc = util.currencyFormat(parseInt(result.point.savingPointIn30, 10));

		debug.log(fileName, 'myPointsResultHandler', result);

		displaySummaryData(result.point);
	}

	function pointsHistoryResultHandler(e, status, result) {
		switch(status) {
			case 200:
				break;
			default:
				break;
		}

		$.each(result.history, function(index, point) {
			point.usePointDesc = util.currencyFormat(parseInt(point.usePoint,10));
		});

		debug.log(fileName, 'pointsHistoryResultHandler', result);

		displayHistoryData(result.history);
		
	}

	// Handlebars 마크업 템플릿 구성
	function displayHistoryData(data) {
		var source = $('#point-list-templates').html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		$('.wrap').addClass('is-loading');
		$('.js-point-wrap').empty()
							.append(insertElements);
		$('.wrap').removeClass('is-loading');
	}

	function displaySummaryData(data) {
		var source = $('#point-summury-templates').html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		$('.js-point-summury').empty()
						.append(insertElements);
	}

	function initRangePicker() {
		setRangePicker();

		$('.js-picker-from').datepicker('setDate', win.moment().subtract(7, 'days').format('YYYY-MM-DD'));
		$('.sortTerm li a').click(function(e) {
			e.preventDefault();
			$(this).addClass('on').parent().siblings('li').find('a').removeClass('on');
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
		});
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