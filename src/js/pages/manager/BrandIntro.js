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
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	FOLLOWING_EVENT = events.FOLLOWING;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.container',
			template : '#brand-intro-templates'
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

		self.followTargetCode = util.getUrlVar().followTargetCode;
		self.followTargetNumber = util.getUrlVar().followTargetNumber;
		self.followTargetSectionCode = util.getUrlVar().followTargetSectionCode;

		if (debug.isDebugMode()) {
			if (!self.followTargetCode) {
				var followTargetCode = win.prompt('queryString not Found!\n\nfollowTargetCode 를 String 입력하세요', '');
				location.href += '?followTargetCode=' + followTargetCode;
				return;
			}
			if (!self.followTargetNumber) {
				var followTargetNumber = win.prompt('queryString not Found!\n\nfollowTargetNumber 를 Number 입력하세요', '');
				location.href += '&followTargetNumber=' + followTargetNumber;
				return;
			}
			if (!self.followTargetSectionCode) {
				var followTargetSectionCode = win.prompt('queryString not Found!\n\nfollowTargetSectionCode 를 String 입력하세요', '');
				location.href += '&followTargetSectionCode=' + followTargetSectionCode;
				return;
			}
		}

		$('.container a, .container button').on('click', function(e) {
			var target = $(e.currentTarget);

			if (target.hasClass('js-add-follow')) {
				e.preventDefault();

				var data = {
					"followTargetCode": self.followTargetCode,
					"followTargetNumber": self.followTargetNumber,
					"followTargetSectionCode": self.followTargetSectionCode
				};

				$('.js-ajax-data').html('ajax 전송 data : ' + JSON.stringify(data));
				followController.addFollows(data);
			} else if (target.hasClass('js-delete-follow')) {
				e.preventDefault();
				
				$('.js-ajax-data2').html('ajax 전송 data : ' + JSON.stringify(self.followTargetNumber));
				followController.deleteFollows(self.followTargetNumber);
			}
		});
		
		setElements();
		setBindEvents();
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(followController).on(FOLLOWING_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case FOLLOWING_EVENT.ADD_FOLLOW:
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);

				$('.' + eventType).html(JSON.stringify(response));
				break;
			case FOLLOWING_EVENT.DELETE_FOLLOW:
				switch(status) {
					case 200:
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
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}

};