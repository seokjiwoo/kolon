/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Profile.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var controller = require('../../controller/PersonalCardController');
	$(controller).on('personalCardResult', personalCardResultHandler);
	$(controller).on('addressItemsResult', addressItemsResultHandler);
	$(controller).on('dwellingItemsResult', dwellingItemsResultHandler);
	$(controller).on('answerResult', answerResultHandler); 
	

	var ApiController = require('../../controller/APIController');
	var apiController = ApiController();

	var DropDownMenu = require('../../components/DropDownMenu.js');
	var CardList = require('../../components/CardList.js');
	var cardList = CardList();

	var selectedItems = new Array();
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();

		cardList.init('#cardWrap');	// 카드 리스트

		controller.personalCard();
	}

	function personalCardResultHandler(e, status, result) {
		$.map(result, function(each) {
			//console.log(each);

			if (each.questionContents == undefined) each.questionContents = each.cardName;
			switch(each.registerTypeCode) {
				case "DP_CARD_REGISTER_TYPE_03":
					switch(each.apiUrl.split('/').pop()) {
						case 'region':
							each.cardClass = 'addressCard';
							if (each.memberAnswerYn == 'Y') selectedItems[each.cardNumber] = each.myPersonalRegionMemberAnswer;
							break;
						case 'dwelling':
							each.cardClass = 'dwellingCard';
							if (each.memberAnswerYn == 'Y') selectedItems[each.cardNumber] = each.myPersonalDwellingMemberAnswer;
							break;
					}
					
					break;
				case "DP_CARD_REGISTER_TYPE_04":
					each.cardClass = 'selectCard';
					break;
			}
		});

		var template = window.Handlebars.compile($('#personal-info-card-template').html());
		cardList.html(template(result));

		DropDownMenu.init();
		initAddressCard();
		initDwellingCard();

		$('.cardCollect > li').click(function(e){
			e.preventDefault();
			console.log( $(this).data().answerContent );
			e.stopPropagation();
		});
	};

	function initDwellingCard() {
		$('.dwellingCard').each(function(idx){
			var selectedItem = selectedItems[$(this).attr('id').substr(12)];
			if (selectedItem != undefined) {
				$(this).find('.dwellingFormDrop').html('<ul class="drop" data-prevent="true"><li><a href="#">'+selectedItem.dwellingFormCodeName+'</a></li></ul>');
				$(this).find('.dwellingPyeongDrop').html('<ul class="drop" data-prevent="true"><li><a href="#">'+selectedItem.dwellingPyeongCodeName+'</a></li></ul>');
			}
			controller.getDwellingItem($(this));
		});

		$('.dwellingCard .alignBox').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			var dataKey = String($(this).data().dataKey);
			
			if (selectedItems[cardId] == undefined) selectedItems[cardId] = {};
			switch(dataKey) {
				case 'dwellingForm': selectedItems[cardId].dwellingFormCode = data.values[0]; break;
				case 'dwellingPyeong': selectedItems[cardId].dwellingPyeongCode = data.values[0]; break;
			}

			if (selectedItems[cardId].dwellingFormCode != undefined && selectedItems[cardId].dwellingPyeongCode != undefined) {
				controller.answer(cardId, 'BM_PERSONAL_TYPE_02', {
					"personalAnswer": {
						"answerSequences": [0],
						"questionNumber": cardId,
					},
					"personalDwelling": selectedItems[cardId]
				});
			}
		});
	};

	function dwellingItemsResultHandler(e, status, result, target) {
		for (var key in result) {
			var targetBox = target.find('.'+key+'Drop');
			var selectedItem = selectedItems[target.attr('id').substr(12)];
			
			var label = '선택해주세요';
			if (selectedItem != undefined) label = selectedItem[key+'CodeName'];
			
			var eachDrop = result[key];
			var tags = '<ul class="drop" data-prevent="true"><li><a href="#">'+label+'</a></li>';
			for (var valueKey in eachDrop) {
				var eachItem = eachDrop[valueKey];
				tags += '<li><a href="#" data-value="'+eachItem.code+'">'+eachItem.codeDesc+'</a></li>';
			}
			tags += '</ul>';

			targetBox.html(tags);
			targetBox.data().dataKey = key;
		}
		
		DropDownMenu.refresh();
	};

	function initAddressCard() {
		$('.addressCard').each(function(idx){
			var selectedItem = selectedItems[$(this).attr('id').substr(12)];
			if (selectedItem != undefined) {
				$(this).find('.addressDrop1').html('<ul class="drop" data-prevent="true"><li><a href="#">'+selectedItem.sido+'</a></li></ul>');
				$(this).find('.addressDrop2').html('<ul class="drop" data-prevent="true"><li><a href="#">'+selectedItem.sigungu+'</a></li></ul>');
				$(this).find('.addressDrop3').html('<ul class="drop" data-prevent="true"><li><a href="#">'+selectedItem.dong+'</a></li></ul>');
			}
			controller.getAddressItems($(this));
		});

		$('.addressDrop1').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId] = {};
			selectedItems[cardId].sido = data.values[0];

			cardTarget.find('.addressDrop3').html('<ul class="drop" data-prevent="true"><li><a href="#">읍면동</a></li></ul>');
			controller.getAddressItems(cardTarget, selectedItems[cardId].sido);
		});

		$('.addressDrop2').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId].sigungu = data.values[0];

			controller.getAddressItems(cardTarget, selectedItems[cardId].sido, selectedItems[cardId].sigungu);
		});

		$('.addressDrop3').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId].dong = data.values[0];

			// BM_PERSONAL_TYPE_02: 주거, BM_PERSONAL_TYPE_03: 나머지 응답
			controller.answer(cardId, 'BM_PERSONAL_TYPE_01', {
				"personalAnswer": {
					"answerSequences": [0],
					"questionNumber": cardId,
				},
				"personalRegion": selectedItems[cardId]
			});
		});
	};

	function addressItemsResultHandler(e, status, result, target) {
		var targetBox, label, key, each;
		var tags = '<ul class="drop" data-prevent="true">';

		if (result.regionList[0].sido != result.regionList[1].sido) {
			var selectedItem = selectedItems[target.attr('id').substr(12)];
			label = (selectedItem == undefined ? '시/도' : selectedItem.sido);
			targetBox = target.find('.addressDrop1');

			tags += '<li><a href="#">'+label+'</a></li>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<li><a href="#" data-value="'+each.sido+'">'+each.sido+'</a></li>';
			}
		} else if (result.regionList[0].sigungu != result.regionList[1].sigungu) {
			label = '시군구';
			targetBox = target.find('.addressDrop2');

			tags += '<li><a href="#">'+label+'</a></li>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<li><a href="#" data-value="'+each.sigungu+'">'+each.sigungu+'</a></li>';
			}
		} else {
			label = '읍면동';
			targetBox = target.find('.addressDrop3');

			tags += '<li><a href="#">'+label+'</a></li>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<li><a href="#" data-value="'+each.dong+'">'+each.dong+'</a></li>';
			}
		}
		tags += '</ul>';

		targetBox.html(tags);
		DropDownMenu.refresh();
	};

	function answerResultHandler(e, status, result) {
		if (status == 200) {
			alert('답변이 등록되었습니다');
			location.reload(true);
		}
	};
};