/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyServiceDetail.js';

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

		var graph = $('.js-graph'),
		opts = graph.data('graph-opt'),
		diff = util.diffDay({
			startDate : (opts.startDate === 'today' ? new Date() : opts.startDate),
			endDate : opts.endDate
		});

		debug.log(fileName, 'init > graph-opt', opts);

		if (diff.diffDay && diff.diffDay > 0) {
			graph.find('.js-graph-progress').text('시공진행중');
			graph.find('.js-graph-dday').text('D-' + diff.diffDay);
		} else {
			graph.find('.js-graph-progress').text('----- 문구 ----');
			if (diff.diffDay === 0) {
				graph.find('.js-graph-dday').text('D-Day');
			} else {
				graph.find('.js-graph-dday').text(diff.diffDay);
			}			
		}

		debug.log(fileName, 'diffDay', diff.diffDay);
	}
};