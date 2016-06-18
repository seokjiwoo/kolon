/* global $ */

module.exports = function() {
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
		
		$('#popularList').html('loading...');
		controller.getListPopular();
	};

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
}