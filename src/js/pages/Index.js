/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	cardList = require('../components/CardList.js'),
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

		if (Super.Super.loginData == null) {
			// 비로그인
			initMainSlider();
		} else {
			// 로그인
			initHeaderCardlist();
		}

		cardList.init('#cardWrap');	// 카드 리스트


		setDemoDoughnut();
	}

	/**
	 * 상단 슬라이더 초기화. 비로그인시에만 보임.
	 */
	function initMainSlider() {
		$('#headerCardList').remove();

		$('#mainSlider').show();
		$('#mainSlider').bxSlider();
	}

	/**
	 * 상단 카드리스트 초기화. 로그인시에만 보임.
	 */
	function initHeaderCardlist() {
		$('#mainSlider').remove();

		$('#headerCardList').show();
	}



	function setDemoDoughnut() {
		var cardWrap = $('#cardWrap'),
		chart = $(doughnutChart);

		$('.js-doughnut-btn').on('click', function() {
			var source = $('#index-card-templates').html(),
			template = win.Handlebars.compile(source),
			data, html, insertElements;

			data = {
				cards : [
					{
						cardTypeCode : 'GRAPH',
						cardClass: 'cardType08 cardSize02',
						title : '목표 수익 금액 <br>달성률',
						description : '<p>김현주고객님, <br>목표달성까지 남은 금액은 <br>500,000 원 입니다.</p>',
						background : 'background-color:#f17992;',
						percent : 10,
						onScreen : true
					},
					{
						cardTypeCode : 'GRAPH',
						cardClass: 'cardType08 cardSize02',
						title : '목표 수익 금액 <br>달성률',
						description : '<p>홍길동고객님, <br>목표달성까지 남은 금액은 <br>523,400 원 입니다.</p>',
						background : 'background-color:#f17992;',
						percent : 90,
						onScreen : false
					},
				]
			}; // cardClass는 cardTypeCode 참조해서 이쪽이 만들어야 함. 더미니까 일단 두는 걸로.

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