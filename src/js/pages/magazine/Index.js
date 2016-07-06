/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'magazine/Index.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var model = require('../../model/CardListModel.js');
	
	var controller = require('../../controller/MagazineController');
	$(controller).on('getListPopularResult', popularListHandler);

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		debug.log(fileName, $, util);
		
		// $('#popularList').html('loading...');
		// controller.getListPopular();
		bestKeySlide()
	}

	function popularListHandler(e, status) {
		var classOrder = new Array('magazineL', 'magazineR', 'magazineC', 'magazineC');
		var listData = model.topFixedList();

		var tags = '';
		for (var key in listData) {
			var eachData = listData[key];
			tags += '<li class="'+classOrder[key]+'" style="background:#eeeeee url(\''+eachData.imageUrl+'\')">';
			tags += '<a href=""><div class="magazineCon">';	// eachData.magazineNumber
			tags += '<h3 class="cardTit">'+eachData.title+'</h3>';
			tags += '<p class="cardIntro">'+eachData.description+'</p>';
			tags += '</div></a>';
			tags += '<ul class="cardInfo">';
			tags += '<li class="like">'+'?'+'</li>';
			tags += '<li class="comment">'+'?'+'</li>';
			tags += '<li class="scrap">'+eachData.scrapCount+'</li>';
			tags += '</ul></li>';
		}

		$('#popularList').html(tags);
	}
	function bestKeySlide(){
		$('#bestKeySlide').bxSlider({
			mode: 'vertical',
			minSlides: 5,
			controls:false,
			infiniteLoop:false
		});
	}

};