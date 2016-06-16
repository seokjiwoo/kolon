/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	DEBUG = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	FILE_NAME = 'MpMyServiceDetail.js';

	var SuperClass = require('./Page.js'),
	Super = SuperClass(),
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

		var graph = $('.js-graph'),
		opts = graph.data('graph-opt'),
		diff = util.diffDay({
			startDate : (opts.startDate === 'today' ? new Date() : opts.startDate),
			endDate : opts.endDate
		});

		DEBUG.log(FILE_NAME, 'init > graph-opt', opts);

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

		DEBUG.log(FILE_NAME, 'diffDay', diff.diffDay);
	}
};