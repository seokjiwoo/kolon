/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/BrandIntro.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	followController = require('../../controller/FollowController.js'),
	expertsController = require('../../controller/ExpertsController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	messagePopup = require('../../components/MessagePopup.js'),
	dropDownMenu =  require('../../components/DropDownMenu.js'),
	COLORBOX_EVENT = events.COLOR_BOX,
	EXPERTS_EVENT = events.EXPERTS,
	FOLLOWING_EVENT = events.FOLLOWING,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;

	var CardList = require('../../components/CardList.js');
	var cardList;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-manager-brand-wrap',
			template : '#manager-brand-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		self.urlVar = util.getUrlVar();
		self.followTargetCode = self.urlVar.followTargetCode;
		self.followTargetNumber = self.urlVar.followTargetNumber;
		self.followTargetSectionCode = self.urlVar.followTargetSectionCode;
		self.expertNumber = self.urlVar.expertNumber;

		if (!self.expertNumber) {
			var expertNumber = win.prompt('queryString not Found!\n\nexpertNumber 를 Number 입력하세요', '');
			location.href += '?expertNumber=' + expertNumber;
			return;
		}
		
		setElements();
		setBindEvents();

		setBtnsEvents();

		cardList = CardList();
		cardList.init();	// 카드 리스트
		$(cardList).on('cardAppended', cardAppendedHandler);

		expertsController.brand(self.expertNumber);
		expertsController.brandProducts(self.expertNumber, 'PD_OPTION_SORT_01');
	}

	function cardAppendedHandler(e) {
		debug.log('카드 이벤트 설정?');
	};

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(expertsController).on(EXPERTS_EVENT.WILD_CARD, onControllerListener);
		$(followController).on(FOLLOWING_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function setBtnsEvents() {
		destroyBtnsEvents();
		$('#btnFollow').on('click', onFollowListener);
		$('#brandList .drop').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);
	}

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.val(), data);
		cardList.removeAllData();
		expertsController.brandProducts(self.expertNumber, target.val().join(''));
		// getOrderList(self.searchInp.val(), data.values.join(','));
	}

	function onFollowListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);

		if (target.hasClass('js-add-follow')) {
			followController.addFollows(self.brandNumber, 'BM_FOLLOW_TYPE_02');
		} else if (target.hasClass('js-delete-follow')) {
			followController.deleteFollows(self.followTargetNumber);
		}
	}

	function destroyBtnsEvents() {
	}
	

	// Handlebars 마크업 템플릿 구성
	function displayData(data, template, templatesWrap) {
		data.expertNum = self.expertNumber;
		template = template || self.template;
		templatesWrap = templatesWrap || self.templatesWrap;

		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		templatesWrap.imagesLoaded()
							.always(function() {
								templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(INFOSLIDER_EVENT.REFRESH);
								eventManager.triggerHandler(DROPDOWNMENU_EVENT.REFRESH);
								setBtnsEvents();
							});
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case EXPERTS_EVENT.BRAND:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				self.brandNumber = result.data.brand.memberNumber;
				displayData(result.data.brand);
				break;
			case EXPERTS_EVENT.BRAND_PRODUCTS:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				cardList.appendData(result.data.products);
				break;
			case FOLLOWING_EVENT.ADD_FOLLOW:
				switch(status) {
					case 200:
						$('#btnFollow').removeClass('js-add-follow')
										.addClass('js-delete-follow')
										.text('팔로잉');
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
			case FOLLOWING_EVENT.DELETE_FOLLOW:
				switch(status) {
					case 200:
						$('#btnFollow').removeClass('js-delete-follow')
										.addClass('js-add-follow')
										.text('팔로우');
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);

				$('.' + eventType).html(JSON.stringify(response));
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				if (self.colorbox.hasClass('popMessage')) {
					messagePopup.init('', self.expertNumber);
				}
				break;
			case COLORBOX_EVENT.CLEANUP:
				if (self.colorbox.hasClass('popMessage')) {
					messagePopup.destroy();
				}
				break;
		}
	}

};