/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/Detail.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	followController = require('../../controller/FollowController.js'),
	expertsController = require('../../controller/ExpertsController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	EXPERTS_EVENT = events.EXPERTS,
	FOLLOWING_EVENT = events.FOLLOWING,
	INFOSLIDER_EVENT = events.INFO_SLIDER;
	
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
	}

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
								eventManager.triggerHandler(INFOSLIDER_EVENT.REFRESH);
								setBtnsEvents();

								var portfolioSlider,
								portfolioSliderTotal;

								portfolioSlider = $('#portfolioSlider').bxSlider({
									pager : false,
									onSliderLoad : function(index) {
										portfolioSliderTotal = $(this).children().filter(':not(.bx-clone)').size();
										$(this).closest('.portfolioArea').find('.js-cur').text(index + 1);
										$(this).closest('.portfolioArea').find('.js-total').text(portfolioSliderTotal);
									},
									onSlideAfter : function($slideElement, oldIndex, newIndex) {
										$(this).closest('.portfolioArea').find('.js-cur').text(newIndex + 1);
									}
								});

								$('#portfolioSlider').imagesLoaded()
														.always(function() {
															portfolioSlider.reloadSlider();
															if (portfolioSliderTotal === 1) {
																portfolioSlider.destroySlider();
															}
														});
							});
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
	}


	function onControllerListener(e, status, response/*, elements*/) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case EXPERTS_EVENT.DETAIL:
				if (result.data.expert == null) {
					win.alert('해당 전문가의 데이터가 없습니다.');
					location.href = '/manager/';
				} else {
					self.followTargetNumber = result.data.expert.followSeq;
					displayData(result.data.expert);
					$('.except').dotdotdot({watch:'window'});
					if (result.data.expert.followYn == 'Y') $('#btnFollow').removeClass('js-add-follow').addClass('js-delete-follow').text('팔로잉');
				}

				expertsController.products(self.expertNumber, 'newest');
				break;
			case EXPERTS_EVENT.PRODUCTS:
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
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}

};