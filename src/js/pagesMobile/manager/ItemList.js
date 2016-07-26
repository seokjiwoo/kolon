/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/ItemList.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass(),
	followController = require('../../controller/FollowController.js'),
	expertsController = require('../../controller/ExpertsController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	messagePopup = require('../../components/MessagePopup.js'),
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
			wrap : '.js-manager-detail-wrap',
			template : '#manager-detail-templates'
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
		self.expertNumber = self.urlVar.expertNumber;
		if (!self.expertNumber) location.href = '/manager/';
		
		setElements();
		setBindEvents();

		setBtnsEvents();

		expertsController.detail(self.expertNumber);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);
		
		cardList = CardList();
		$(cardList).on('cardAppended', cardAppendedHandler);
		cardList.init();	// 카드 리스트

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
		$('#orderDrop').on('change', onOrderChange);
		// $('#orderDrop').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);
	}

	function onOrderChange() {
		expertsController.products(self.expertNumber, $(this).val());
	}

	// function onDropCheckMenuChange(e, data) {
	// 	var target = $(e.target);

	// 	debug.log(fileName, 'onDropCheckMenuChange', target, target.val(), data);
	// 	cardList.removeAllData();
	// 	expertsController.products(self.expertNumber, target.val().join(''));
	// }

	function onFollowListener(e) {
		e.preventDefault();

		var target = $(e.currentTarget);

		if (target.hasClass('js-add-follow')) {
			followController.addFollows(self.expertNumber, 'BM_FOLLOW_TYPE_01');
		} else if (target.hasClass('js-delete-follow')) {
			followController.deleteFollows(self.followTargetNumber);
		}
	}

	function destroyBtnsEvents() {
		$('#btnFollow').off('click', onFollowListener);
		$('#orderDrop').off('change', onOrderChange);
	}
	

	// Handlebars 마크업 템플릿 구성
	function displayBasicData(data, _template, templatesWrap) {
		_template = _template || self.template;
		templatesWrap = templatesWrap || self.templatesWrap;

		var source = _template.html(),
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
								setBtnsEvents();
							});
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case EXPERTS_EVENT.DETAIL:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				self.followTargetNumber = result.data.expert.followSeq;
				displayBasicData(result.data.expert);
				$('.except').dotdotdot({watch:'window'});
				if (result.data.expert.followYn == 'Y') $('#btnFollow').removeClass('js-add-follow').addClass('js-delete-follow').text('팔로잉');

				expertsController.products(self.expertNumber, 'newest');
				
				displayBasicData(result.data.expert, $('#manager-message-templates'), $('.js-message-templates-wrap'));
				break;
			case EXPERTS_EVENT.PRODUCTS:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				// cardList.removeAllData();
				// cardList.appendData(result.data.products);
				
				displayBasicData(result.data, $('#manager-product-templates'), $('.js-manager-product-wrap'));
				break;
			case FOLLOWING_EVENT.ADD_FOLLOW:
				switch(status) {
					case 200: 
						$('#followerCount').text(Number($('#followerCount').text())+1);
						$('#btnFollow').removeClass('js-add-follow').addClass('js-delete-follow').text('팔로잉');
						break;
					default: win.alert(result.message); break;
				}
				break;
			case FOLLOWING_EVENT.DELETE_FOLLOW:
				switch(status) {
					case 200: 
						$('#followerCount').text(Number($('#followerCount').text())-1);
						$('#btnFollow').removeClass('js-delete-follow').addClass('js-add-follow').text('팔로우');
						break;
					default: win.alert(result.message); break;
				}
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

	function cardAppendedHandler(e) {
		debug.log('카드 이벤트 설정?');
	};
};