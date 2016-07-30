/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyServiceDetail.js';

	var controller = require('../../controller/OrderController.js');
	$(controller).on('myConstDetailResult', dataHandler);

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
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

		self.orderNumber = util.getUrlVar().orderNumber;

		if (!self.orderNumber) {
			win.alert('유효하지 않은 접근입니다.');
			location.href = '/';
			return;
		}

		controller.orderNewFormDetail(util.getUrlVar().orderNumber);
	}

	function dataHandler(e, status, result) {
		var info = result.constOrderStateDetail;
		
		info.orderDate = moment(info.orderDateTime).format('YYYY.MM.DD');
		switch(info.orderStateCode) {
			case 'SL_CONST_STATE_01':
				info.stepNumber = '0';
				break;
			case 'SL_CONST_STATE_02':
				info.stepNumber = '1';
				info.stepClass1 = 'on';
				break;
			case 'SL_CONST_STATE_03':
			case 'SL_CONST_STATE_04':
				info.stepNumber = '2';
				info.stepClass2 = 'on';
				break;
			case 'SL_CONST_STATE_05':
				info.stepNumber = '3';
				info.stepClass3 = 'on';
				break;
			case 'SL_CONST_STATE_06':
				info.stepNumber = '4';
				info.stepClass4 = 'on';
				break;
			case 'SL_CONST_STATE_07':
				info.stepNumber = '5';
				info.stepClass5 = 'on';
				break;
			case 'SL_CONST_STATE_08':
				info.stepNumber = '6';
				info.stepClass6 = 'on';
				break;
			case 'SL_CONST_STATE_09':
				info.stepNumber = '7';
				info.stepClass7 = 'on';
				break;
			case 'SL_CONST_STATE_10':
				info.stepNumber = '8';
				info.stepClass8 = 'on';
				break;
			case 'SL_CONST_STATE_11':
			case 'SL_CONST_STATE_16':
				info.stepNumber = '9';
				info.stepClass9 = 'on';
				break;

			case 'SL_CONST_STATE_12':
			case 'SL_CONST_STATE_13':
			case 'SL_CONST_STATE_14':
			case 'SL_CONST_STATE_15':
				info.stepNumber = '0';
				$('.myMenu ul li').removeClass('on');
				$('.myMenu ul li:eq(1)').addClass('on');
				break;
		}

		renderData(info, '#service-detail-templates', '#serviceDetail', true);


		var graph = $('.js-diffdate'),
		opts = graph.data('diffdate-opts'),
		diff = util.diffDay({
			startDate : (opts.startDate === 'today' ? new Date() : opts.startDate),
			endDate : opts.endDate
		});

		debug.log(fileName, 'init > graph-opt', opts);

		if (diff.diffDay && diff.diffDay > 0) {
			graph.find('.js-diffdate-progress').text('시공진행중');
			graph.find('.js-diffdate-dday').text('D-' + diff.diffDay);
		} else {
			graph.find('.js-diffdate-progress').text('----- 문구 ----');
			if (diff.diffDay === 0) {
				graph.find('.js-diffdate-dday').text('D-Day');
			} else {
				graph.find('.js-diffdate-dday').text(diff.diffDay);
			}			
		}

		debug.log(fileName, 'diffDay', diff.diffDay);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};