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
		controller.pointsHistory(moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'), moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'), 'BM_POINT_STMT_SECTION');
		
		$('#typeSelect').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			historyCode = data.values[0];
		});
		$('#searchButton').click(function(e) {
			e.preventDefault();
			if (historyCode == '') {
				alert('적립/사용내역 중 하나를 선택해 주세요');
			} else {
				controller.pointsHistory(moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'), moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'), historyCode);
			}
		});
	};

	function myPointsResultHandler(e, status, result) {
		var dummyData = {
			"status": "200",
			"message": "ok",
			"data": {
				"point": {
					"savingPoint": "0",
					"savingPointIn30": "0"
				}
			}
		}

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
	};

	function pointsHistoryResultHandler(e, status, result) {
		var dummyData = {
			"history": [
				{
					"cancelPoint": "1",
					"memberNumber": "1",
					"pointTypeCd": "BM_POINT_TYPE_01",
					"pointTypeNm": "유형이름",
					"reason": "포인트 제공 사유",
					"remainDays": "1",
					"remainPoint": "1000",
					"savingDate": "2016.07.05",
					"savingPoint": "1",
					"useDate": "2016.07.11",
					"usePoint": "1000",
					"validDate": "2016.07.05"
				}
			]
		}

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
		
	};

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
			$('.js-picker-to').datepicker('option', 'minDate', moment($('.js-alt-from').val()).format('YYYY-MM-DD'));
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
	};
};