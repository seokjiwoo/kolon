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

		win.Handlebars.registerHelper("ifvalue", function(conditional, options) {
			if (conditional == options.hash.equals) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		});

		var cardWrap = $('#cardWrap'),
		chart = $(doughnutChart);

		$('.js-doughnut-btn').on('click', function() {
			var source = $('#index-card-templates').html(),
			template = win.Handlebars.compile(source),
			data, html, insertElements;

			data = {
				cards : [
					{
						type : 'cardType01 cardSize03',
						title : '<b>인더스트리얼</b> 욕실',
						description : '<p>김현주고객님, <br>목표달성까지 남은 금액은 <br>500,000 원 입니다.</p>',
						background : 'background-image: url(\'/images/temp24.jpg\')'
					},
					{
						type : 'cardType08 cardSize02',
						title : '목표 수익 금액 <br>달성률',
						description : '<p>김현주고객님, <br>목표달성까지 남은 금액은 <br>500,000 원 입니다.</p>',
						background : 'background-color:#f17992;',
						percent : 10,
						onScreen : true
					},
					{
						type : 'cardType01 cardSize03',
						title : '<b>인더스트리얼</b> 욕실',
						description : '<p>홍길동고객님, <br>목표달성까지 남은 금액은 <br>500,000 원 입니다.</p>',
						background : 'background-image: url(\'/images/temp24.jpg\')'
					},
					{
						type : 'cardType08 cardSize02',
						title : '목표 수익 금액 <br>달성률',
						description : '<p>홍길동고객님, <br>목표달성까지 남은 금액은 <br>523,400 원 입니다.</p>',
						background : 'background-color:#f17992;',
						percent : 90,
						onScreen : false
					},
				]
			}; 

			html = template(data);

			insertElements = $(html);
			cardWrap.append(insertElements)
							.isotope('appended', insertElements)
							.isotope('layout');


			chart.trigger(doughnutChart.EVENT.APPEND, {
				container : cardWrap,
				insertElements: insertElements
			});
		});
	}
};