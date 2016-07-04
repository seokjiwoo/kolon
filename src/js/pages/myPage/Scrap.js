/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Scrap.js';

	var MyPageClass = require('./Index.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/ScrapController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	SCRAP_EVENT = events.SCRAP,
	COLORBOX_EVENT = events.COLOR_BOX,
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util, controller);

		eventManager.on(COLORBOX_EVENT.WILD_CARD, function(e) {
			debug.log(fileName, 'COLORBOX_EVENT.WILD_CARD', e.type);
		});

		self = callerObj;

		setBindEvents();
		activePageMenu();
		// controller.scrapList();

		// controller Method
		// scrapList(attr) - 스크랩 카드 목록
		// scrapImageList(folderNumber) - 스크랩 이미지 목록
		// addScrap(folderNumber, targetCode, targetNumber) - 스크랩 등록
		// editScrap(scrapNumber, folderNumber) - 스크랩 수정
		// deleteScrap(scrapNumber) - 스크랩 삭제
		// addScrapFolder(folderName) - 스크랩 폴더 등록
		// editScrapFolder(folderNumber, folderName) - 스크랩 폴더 수정
		// deleteScrapFolder(folderNumber) - 스크랩 폴더 삭제
	}

	function activePageMenu() {
		var category = util.getHashVar('category', win.location.href);

		debug.log(fileName, 'activePageMenu', category);

		if (category) {
			$('.tabType01 a[href=\'/myPage/scrap.html#category=' + util.getHashVar('category', win.location.href) + '\']').trigger('click');
		} else {
			$('.tabType01 a[href=\'/myPage/scrap.html#category=all\']').trigger('click');
		}
	}

	function setBindEvents() {
		$(controller).on(SCRAP_EVENT.WILD_CARD, onScrapControllerListener);

		$('.tabType01 a').on('click', function(e) {
			var target = $(e.currentTarget),
			parent = target.closest('li'),
			href = target.attr('href'),
			category = util.getHashVar('category', href);

			if (href && category) {
				parent.addClass('on')
						.siblings('li').removeClass('on');

				debug.log(fileName, 'tab menu click', category);
				controller.scrapList();
			}
		});
		// $('.tabType01 a').on('click', funciton(e) {
		// 	var target = $(e.target);
		// });
	}

	function onScrapControllerListener(e, res) {
		var eventType = e.type,
		status = res[0],
		result = res[1];

		var dummyData = {};

		switch(eventType) {
			case SCRAP_EVENT.LIST:
				dummyData = {
					"folders": [
						{
							"folderName": "string",
							"folderNumber": 0,
							"scrapCount": 0,
							"scrapImages": [
								"string"
							]
						}
					],
					"scraps": [
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"magazine": {
								"createDate": "string",
								"subTitle": "string",
								"title": "string"
							}
						},
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"product": {
								"price": 0,
								"productDesc": "string",
								"productName": "string"
							}
						},
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"seller": {
								"companyName": "string",
								"sellerImageUrl": "string",
								"sellerName": "string"
							},
						}
					]
				};

				if (!result) {
					result = dummyData;
				}

				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				win.vinylX.demoScrapFolders.init($('body'), { dummyData : result });
				eventManager.trigger(COLORBOX_EVENT.REFRESH);
				break;
			case SCRAP_EVENT.IMAGE_LIST:
				dummyData = {
					"folders": [
						{
							"folderName": "string",
							"folderNumber": 0,
							"scrapCount": 0,
							"scrapImages": [
								"string"
							]
						}
					],
					"scraps": [
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"magazine": {
								"createDate": "string",
								"subTitle": "string",
								"title": "string"
							}
						},
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"product": {
								"price": 0,
								"productDesc": "string",
								"productName": "string"
							}
						},
						{
							"category": "string",
							"imageUrl": "string",
							"scrapCount": 0,
							"scrapNumber": 0,
							"tags": [
								"string"
							],
							"seller": {
								"companyName": "string",
								"sellerImageUrl": "string",
								"sellerName": "string"
							},
						}
					]
				};

				if (!result) {
					result = dummyData;
				}

				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.ADD_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.EDIT_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.DELETE_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				204	No Content
				401	Unauthorized
				403	Forbidden
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.ADD_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.EDIT_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
			case SCRAP_EVENT.DELETE_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				204	No Content
				401	Unauthorized
				403	Forbidden
				 */
				debug.log(fileName, 'onScrapControllerListener', eventType, res, status, result);
				break;
		}
	}
};