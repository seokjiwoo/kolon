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
	
	var dropDownMenu =  require('../../components/DropDownMenu.js');

	var ApiController = require('../../controller/APIController');
	var apiController = ApiController();
	
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

		controller.personalCard();
	}

	function personalCardResultHandler(e, status, result) {
		$.map(result, function(each) {
			console.log(each);

			if (each.questionContents == undefined) each.questionContents = each.cardName;
			switch(each.registerTypeCode) {
				case "DP_CARD_REGISTER_TYPE_03":
					//
					break;
				case "DP_CARD_REGISTER_TYPE_04":
					//
					break;
			}
		});

		var template = window.Handlebars.compile($('#personal-info-card-template').html());
		var elements = $(template(result));
		$('#myInfo').empty().append(elements);

		$('#myInfo .card.cardType09').each(function(idx){
			var cardObj = $(this);
			if (cardObj.data().apiUrl != '') apiController.callApi(cardObj.data().apiUrl, 'GET', {}, function(status, result) {
				console.log(cardObj.attr('id'), result.data);
			}, true);
		});

		dropDownMenu.init();
	}

	

	/* {
		"personalAnswer": {
			"answerSequences": [
				0
			],
			"questionNumber": 0
		},
		"personalDwelling": {
			"dwellingFormCode": "string",
			"dwellingPyeongCode": "string"
		},
		"personalRegion": {
			"dong": "string",
			"sido": "string",
			"sigungu": "string"
		}
	} */
};