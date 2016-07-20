/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyActivity.js';


	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	myPageController = require('../../controller/MyPageController.js'),
	messageController = require('../../controller/MessageController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	MYPAGE_EVENT = events.MYPAGE,
	MESSAGE_EVENT = events.MESSAGE,
	COLORBOX_EVENT = events.COLOR_BOX;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			recent : {
				wrap : '.js-my-activity-recent-wrap',
				template : '#my-activity-recent-template'
			},
			message : {
				wrap : '.js-my-activity-message-wrap',
				template : '#my-activity-message-template',
			},
			opnions : {
				wrap : '.js-my-activity-opnions-wrap',
				template : '#my-activity-opnions-template'
			}
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, 'init');

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		// 최근 본 상품 목록
		myPageController.recentViewItems();

		// 1:1 메세지 리스트
		messageController.messageList();

		// 내 의견 묻기 목록
		myPageController.myOpinions();
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(myPageController).on(MYPAGE_EVENT.WILD_CARD, onControllerListener);
		$(messageController).on(MESSAGE_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, templates, templatesWrap) {
		var source = templates.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		templatesWrap.empty()
						.addClass(self.opts.cssClass.isLoading)
						.append(insertElements);

		templatesWrap.imagesLoaded()
						.always(function() {
							eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							templatesWrap.removeClass(self.opts.cssClass.isLoading);
						});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			// 최근 본 상품 목록
			case MYPAGE_EVENT.RECENT_VIEW_ITEMS:
				switch(status) {
					case 200:
						break;
					default:
						dummyData = {"data":{"cards":[{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp05.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스1"},{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp06.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스2"},{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp05.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스3"},{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp06.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스4"},{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp05.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스5"},{"apiUrl":"string","cardNumber":0,"cardRegisterTypeCd":"string","cardTypeCd":"string","cardTypeCdName":"string","category":"string","categoryUrl":"string","content":"string","createDate":"string","desc":"string","imageUrl":"/images/temp05.jpg","productDescName":"string","productSectionCdName":"string","pyeong":"string","scrapCount":0,"sellerCompanyName":"string","sellerImageUrl":"string","sellerName":"string","sellerNumber":0,"tags":["string"],"title":"다이닝 스페이스6"}]}};
						// result = dummyData;
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result.data, $(self.opts.templates.recent.template), $(self.opts.templates.recent.wrap));
				break;

			// 1:1 메세지 리스트
			case MESSAGE_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);

				if (result.inquiryMemberResponses) {
					$.each(result.inquiryMemberResponses, function(index, inquiryMember) {
						if (util.isLocal()) {
							inquiryMember.profileImageUrl = 'http://dev.koloncommon.com' + inquiryMember.profileImageUrl;
						}
					});
				}
				displayData(result, $(self.opts.templates.message.template), $(self.opts.templates.message.wrap));
				break;

			// 내 의견 묻기 목록
			case MYPAGE_EVENT.OPINIONS:
				switch(status) {
					case 200:
						break;
					default:
						dummyData = {"status":"200","message":"ok","data":{"myOpinions":[{"memberNumber":0,"opinionNumber":19,"opinionClassNumber":10,"opinionClassName":null,"category":"자재","title":"테스트","content":"테스트-\n테스트-\n테스트-\n테스트-\n테스트-","userName":"이윤범","createDate":"2016.07.15","answerCount":1,"registeredHelpYn":"Y","images":[],"answers":[{"answerNumber":34,"answererImageUrl":null,"answererNumber":237,"answererName":"Younbum Lee","serviceNames":null,"answererCompany":"","answererSectionCodeName":"구매회원","answererSectionCode":"CS_ANSWERER_SECTION_03","createDate":"2016.07.20 04:24","content":"의견없~다","helpCount":0},{"answerNumber":34,"answererImageUrl":null,"answererNumber":237,"answererName":"Younbum Lee","serviceNames":null,"answererCompany":"","answererSectionCodeName":"구매회원","answererSectionCode":"CS_ANSWERER_SECTION_03","createDate":"2016.07.20 04:24","content":"의견없~다1","helpCount":0},{"answerNumber":34,"answererImageUrl":null,"answererNumber":237,"answererName":"Younbum Lee","serviceNames":null,"answererCompany":"","answererSectionCodeName":"구매회원","answererSectionCode":"CS_ANSWERER_SECTION_03","createDate":"2016.07.20 04:24","content":"의견없~다2","helpCount":0}]},{"memberNumber":0,"opinionNumber":36,"opinionClassNumber":9,"opinionClassName":null,"category":"패키지","title":"얼마인가요?","content":"얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?얼마인가요?","userName":"이윤범","createDate":"2016.07.18","answerCount":0,"registeredHelpYn":null,"images":["/wasupload/opinion/20160718163755410.jpg"],"answers":[]},{"memberNumber":0,"opinionNumber":38,"opinionClassNumber":6,"opinionClassName":null,"category":"임대/운용","title":"최근의견","content":"최근의견최근의견최근의견","userName":"이윤범","createDate":"2016.07.18","answerCount":0,"registeredHelpYn":null,"images":["/wasupload/opinion/20160718181039330.jpg"],"answers":[]}]}};
						// result = dummyData.data.myOpinions;
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result, $(self.opts.templates.opnions.template), $(self.opts.templates.opnions.wrap));
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