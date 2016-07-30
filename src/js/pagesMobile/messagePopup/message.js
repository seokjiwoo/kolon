/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';
	
	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'messagePopup/message.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass();

	var messagePopup = require('../../components/MessagePopup.js'),
	expertsController = require('../../controller/ExpertsController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	EXPERTS_EVENT = events.EXPERTS,
	MESSAGE_EVENT = events.MESSAGE,
	COLORBOX_EVENT = events.COLOR_BOX;

	var opts = {

	};

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;
	
	return callerObj;
	
	function init() {
		Super.init();

		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		self.expertNumber = util.getUrlVar().saleMemberNumber;

		setElements();
		setBindEvents();

		messagePopup.init();
		
		expertsController.detail(self.expertNumber);
		$(expertsController).on(EXPERTS_EVENT.WILD_CARD, onControllerListener);

		// saleMemberNumber=1029
	}

	function setElements() {
	}

	function setBindEvents() {
	}

	function onControllerListener(e, status, response/*, elements*/) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case EXPERTS_EVENT.DETAIL:
				if (result.data.expert == null) {
					win.alert('해당 전문가의 데이터가 없습니다.');
					location.href = '/manager/';
					return;
				}

				$('#popup-saleMemberPic').attr('src', result.data.expert.imageUrl);
				$('#popup-saleMemberName').text(result.data.expert.name);
				$('#popup-saleMemberCompany').text(result.data.expert.companyName);
				break;
		}
	}
};