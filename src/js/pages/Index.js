/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	doughnutChart = require('../components/DoughnutChart.js'),
	fileName = 'Index.js';

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

		debug.log(fileName, 'init', $, util);

		setDemoDoughnut();
	}

	function setDemoDoughnut() {
		win.console.log($('#js-last-pos'))
		if (!$('#js-last-pos').size()) {
			return;
		}

		var waypointOpt = {
			offset : '100%'
		};

		$('#js-last-pos').waypoint(function(direction) {
			if (direction === 'up') {
				return;
			}

			win.console.log(direction);
			// $('#js-last-pos').waypoint('destroy');
			// $('body').append($loading);
			// $.get($('.more a').attr('href'), function(data) {
			// var $data = $(data);
			// $('#container').append($data.find('.article'));
			// $loading.detach();
			// $('.more').replaceWith($data.find('.more'));
			// $footer.waypoint(opts);
			// });
		}, waypointOpt);

		// $('.js-doughnut-btn').on('click', function() {
		// 	var source = $('#index-card-templates').html(),
		// 	template = win.Handlebars.compile(source),
		// 	data, html;

		// 	data = {
		// 		cards : [
		// 			{ percent : 10, onScreen : false },
		// 			{ percent : 15, onScreen : false },
		// 			{ percent : 50, onScreen : true },
		// 			{ percent : 25, onScreen : true }
		// 		]
		// 	}; 

		// 	html = template(data);

		// 	var insertElements = $(html);
		// 	// win.console.log(insertElements[0], insertElements[0].toString());
		// 	//$('#cardWrap').isotope('addItems', insertElements[0]);
		// 	// $('#cardWrap').append(insertElements);
		// 	$('#cardWrap').append(insertElements)
		// 					.isotope('appended', insertElements)
		// 					.isotope('layout');


		// 	$(doughnutChart).trigger(doughnutChart.EVENT.APPEND, {
		// 		container : $('#cardWrap'),
		// 		insertElements: insertElements
		// 	});
		// });
	}
};