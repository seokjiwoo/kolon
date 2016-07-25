/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'qna/Index.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	APIController = require('../../controller/APIController.js'),
	opinionsController = require('../../controller/OpinionsController.js'),
	expertsController = require('../../controller/ExpertsController.js'),
	imageUploader = require('../../components/ImageUploader.js'),
	loginController = require('../../controller/LoginController'),
	loginDataModel = require('../../model/LoginModel'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	LOGIN_EVENT = events.LOGIN,
	OPINIONS_EVENT = events.OPINIONS,
	EXPERTS_EVENT = events.EXPERTS,
	listOrder = 'newest',
	currentPage = 1,
	loginData;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate',
			popAttachPictures : 'popAttachPictures',
			popScrapAdd : 'popScrapAdd'
		},
		imageUploader : {
			api_url : APIController().API_URL + '/apis/opinions/images',
			flashOpts : {
				swf : '../images/swf/imagePreview.swf',
				id : 'imageUpoader',
				width : '100%',
				height : '100%',
				wmode : 'transparent',
				filterOpt : {
					filter : 'images (*.jpg, *.jpeg, *.png)',
					type : '*.jpg;*.jpeg;*.png'
				}
			}
		},
		carousel : {
			wrap : '.js-slider-wrap',
			area : '.js-slider-area',
			pager : '.js-slider-pager',
			bxSliderOpts : {
			},
			cssClass : {
				isCustomPager : 'is-custom-pager'
			}
		},
		templates : {
			carouselWrap : '.js-scrapCarousel-container',
			carousel : '#scrap-carousel-templates'
		}
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		debug.log(fileName, 'init');

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(loginController).on(LOGIN_EVENT.WILD_CARD, onControllerListener);
		$(opinionsController).on(OPINIONS_EVENT.WILD_CARD, onControllerListener);
		$(expertsController).on(EXPERTS_EVENT.WILD_CARD, onControllerListener);

		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function myInfoResultHandler() {
		loginData = loginDataModel.loginData();
		opinionsController.opinionsClass();
		if (loginData) {
			$('#myOpinion').show();
			$('#expertRank').css('margin-top', '20px');
		}
		opinionsController.opinionsExpertList();
		expertsController.list();
	}

	function opinionsListHandler(e, status, result) {
		win.console.log(status, result.pageInfo);
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			// 내 정보 갱신
			case LOGIN_EVENT.REFRESH_MY_INFO:
				debug.log(fileName, 'onControllerListener', eventType, status, response, loginDataModel);
				myInfoResultHandler();
				break;

			// 의견 주제 코드 리스트 
			case OPINIONS_EVENT.CLASS:
				// if (status == 200) {
				// 	var tags = '';
				// 	opinionsClassArray = new Array();
				// 	for (var key in result) {
				// 		var eachTheme = result[key];
				// 		tags += '<option value="'+eachTheme.opinionClassNumber+'">'+eachTheme.className+'</option>';
				// 		opinionsClassArray[eachTheme.opinionClassNumber] = eachTheme.className;
				// 	}
				// 	$('#opinionThemes').append(tags);
				// }
				
				// $('#alignDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
				// 	listOrder = data.values[0];
				// 	controller.opinionsList(listOrder, currentPage);
				// });
				
				opinionsController.opinionsList(listOrder, currentPage);

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;

			// 의견묻기 리스트 조회
			case OPINIONS_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				opinionsListHandler(e, status, result);
				break;

			// 의견묻기 전문가 리스트
			case OPINIONS_EVENT.EXPERTS_LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;


			// 전문가 전체 목록
			case EXPERTS_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;

			default:
				dummyData = [];

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
						result = dummyData;
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}
};