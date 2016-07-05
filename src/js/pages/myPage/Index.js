/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/MyPageController.js');
	$(controller).on('myTimeLineResult', myTimeLineHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		controller.myTimeLine();
	}

	function myTimeLineHandler(e, status, result) {
		var myCommons = result.data.myCommons,
		diff, diffHour, diffMin, diffSec;

		win.console.log('myCommons', myCommons);
		$.map(myCommons, function(value) {
			diff = util.diffDay({
				startDate : new Date(value.registerDateTime),
				endDate : new Date()
			});

			diffHour = parseInt(diff.diffTime/(1000 * 60 * 60), 10);
			diffMin = parseInt(diff.diffTime/(1000 * 60), 10);
			diffSec = parseInt(diff.diffTime/(1000), 10);

			if (diff.diffDay) {
				win.console.log(diff.diffDay + '일전')
			} else if (diffHour > 0) {
				win.console.log(diffHour + '시간전');
			} else if (diffMin > 0) {
				win.console.log(diffMin + '분전');
			} else if (diffSec > 0) {
				win.console.log(diffSec + '초전');
			}
		});
	}
};