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
			//debug.log(each);

			if (each.questionContents == undefined) each.questionContents = each.cardName;
			//if (each.questionNumber == undefined) each.questionNumber = 0;
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
					if (each.memberAnswerYn == 'Y') selectedItems[each.cardNumber] = each.myPersonalServeyMemberAnswerList;
					break;
			}
		});

		var template = window.Handlebars.compile($('#personal-info-card-template').html());
		cardList.html(template(result));

		DropDownMenu.init();
		initSelectCard();
		initDwellingCard();
		initAddressCard();
	};

	function initSelectCard() {
		$('.selectCard').each(function(idx){
			var selectedItem = selectedItems[$(this).attr('id').substr(12)];
			if (selectedItem != undefined) {
				var question = $(this).find('.cardCollect').data().questionNumber
				var answer = selectedItem[0].answerSequence;

				debug.log('#answerCollect0'+question+'-'+answer);
				$('#answerCollect0'+question+'-'+answer).addClass('on');
			}
		});

		$('.cardCollect > li').click(function(e){
			e.preventDefault();

			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			var questionNumber = cardTarget.find('.cardCollect').data().questionNumber;

			controller.answer(cardId, 'BM_PERSONAL_TYPE_03', {
				"personalAnswer": {
					"answerSequences": [ $(this).data().answerContent ],
					"questionNumber": questionNumber
				},
				"personalDwelling": {
					"dwellingFormCode": "",
					"dwellingPyeongCode": ""
				},
				"personalRegion": {
					"dong": "",
					"sido": "",
					"sigungu": ""
				} 
			});
			e.stopPropagation();
		});
	}

	function initDwellingCard() {
		$('.dwellingCard').each(function(idx){
			var selectedItem = selectedItems[$(this).attr('id').substr(12)];
			if (selectedItem != undefined) {
				$(this).find('.dwellingFormDrop').html('<option>'+selectedItem.dwellingFormCodeName+'</option>');
				$(this).find('.dwellingPyeongDrop').html('<option>'+selectedItem.dwellingPyeongCodeName+'</option>');
			}
			controller.getDwellingItem($(this));
		});

		$('.dwellingCard .alignBox').on('change', function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			var dataKey = String($(this).data().dataKey);
			
			if (selectedItems[cardId] == undefined) selectedItems[cardId] = {};
			switch(dataKey) {
				case 'dwellingForm': selectedItems[cardId].dwellingFormCode = $(this).val(); break;
				case 'dwellingPyeong': selectedItems[cardId].dwellingPyeongCode = $(this).val(); break;
			}

			if (selectedItems[cardId].dwellingFormCode != undefined && selectedItems[cardId].dwellingPyeongCode != undefined) {
				controller.answer(cardId, 'BM_PERSONAL_TYPE_02', {
					"personalAnswer": {
						"answerSequences": [],
						"questionNumber": 0
					},
					"personalDwelling": selectedItems[cardId],
					"personalRegion": {
						"dong": "",
						"sido": "",
						"sigungu": ""
					} 
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
			var tags = '<option>'+label+'</option>';
			for (var valueKey in eachDrop) {
				var eachItem = eachDrop[valueKey];
				tags += '<option value="'+eachItem.code+'">'+eachItem.codeDesc+'</option>';
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
				$(this).find('.addressDrop1').html('<option>'+selectedItem.sido+'</option>');
				$(this).find('.addressDrop2').html('<option>'+selectedItem.sigungu+'</option>');
				$(this).find('.addressDrop3').html('<option>'+selectedItem.dong+'</option>');
			}
			controller.getAddressItems($(this));
		});

		$('.addressDrop1').on('change', function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId] = {};
			selectedItems[cardId].sido = $(this).val();

			cardTarget.find('.addressDrop3').html('<option>읍면동</option>');
			controller.getAddressItems(cardTarget, selectedItems[cardId].sido);
		});

		$('.addressDrop2').on('change', function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId].sigungu = $(this).val();

			controller.getAddressItems(cardTarget, selectedItems[cardId].sido, selectedItems[cardId].sigungu);
		});

		$('.addressDrop3').on('change', function(e, data) {
			var cardTarget = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			var cardId = cardTarget.attr('id').substr(12);
			selectedItems[cardId].dong = $(this).val();

			controller.answer(cardId, 'BM_PERSONAL_TYPE_01', {
				"personalAnswer": {
					"answerSequences": [],
					"questionNumber": 0
				},
				"personalDwelling": {
					"dwellingFormCode": "",
					"dwellingPyeongCode": ""
				},
				"personalRegion": selectedItems[cardId]
			});
		});
	};

	function addressItemsResultHandler(e, status, result, target) {
		var targetBox, label, key, each;
		var tags = '';

		if (result.regionList[0].sido != result.regionList[1].sido) {
			var selectedItem = selectedItems[target.attr('id').substr(12)];
			label = (selectedItem == undefined ? '시/도' : selectedItem.sido);
			targetBox = target.find('.addressDrop1');

			tags += '<option>'+label+'</option>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<option value="'+each.sido+'">'+each.sido+'</option>';
			}
		} else if (result.regionList[0].sigungu != result.regionList[1].sigungu) {
			label = '시군구';
			targetBox = target.find('.addressDrop2');

			tags += '<option>'+label+'</option>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<option value="'+each.sigungu+'">'+each.sigungu+'</option>';
			}
		} else {
			label = '읍면동';
			targetBox = target.find('.addressDrop3');

			tags += '<option>'+label+'</option>';
			for (key in result.regionList) {
				each = result.regionList[key];
				tags += '<option value="'+each.dong+'">'+each.dong+'</option>';
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
		} else {
			alert(status+': '+result.message);
		}
	};
};