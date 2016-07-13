/* jshint node: true, strict: true */
module.exports = ClassMessagePopup().getInstance();

function ClassMessagePopup() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	fileName = 'compoents/MessagePopup.js';

	var controller = require('../controller/MessageController.js'),
	eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	MESSAGE_EVENT = events.MESSAGE,
	COLORBOX_EVENT = events.COLOR_BOX,
	opts = {
		wrap : '.js-message-popup',
		message : {
			form : '.js-message-form',
			inp : '.js-message-inp',
			submit : '.js-message-submit'
		}
	};

	var callerObj = {
		init : init,
		destroy : destroy,
		refresh : refresh
	},
	instance, self;
	
	return {
		getInstance: function() {
			if (!instance) instance = callerObj;
			return instance;
		}
	};
	
	function init(productNumber, saleMemberNumber) {
		self = callerObj;
		self.opts = opts;
		self.productNumber = productNumber;
		self.saleMemberNumber = saleMemberNumber;

		debug.log(fileName, 'init', self.opts);

		setElements();
		setBindEvents();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.msgForm = self.wrap.find(self.opts.message.form);
		self.msgInp = self.wrap.find(self.opts.message.inp);
		self.msgSubmit = self.wrap.find(self.opts.message.submit);
	}

	function setBindEvents() {
		$(controller).on(MESSAGE_EVENT.WILD_CARD, onControllerListener);
		self.msgForm.on('submit', onSubmitPrevent);
		self.msgSubmit.on('click', onSubmitListener);
	}

	function onSubmitPrevent(e) {
		e.preventDefault();
	}

	function onSubmitListener(e) {
		e.preventDefault();
		
		if (!self.msgInp.val()) {
			win.alert('자세한 내용을 작성해 주세요.');
			return;
		}

		controller.inquiries(
			self.msgInp.val(),
			'',
			self.productNumber,
			self.saleMemberNumber
		);
	}

	function removeBindEvents() {
		$(controller).off(MESSAGE_EVENT.WILD_CARD, onControllerListener);
		self.msgForm.off('submit', onSubmitPrevent);
		self.msgSubmit.off('click', onSubmitListener);
	}

	function destroy() {
		removeBindEvents();
	}

	function refresh() {
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case MESSAGE_EVENT.INQUIRIES:
				switch(status) {
					case 200:
						win.alert('등록되었습니다.');
						eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, eventManager);
				break;
		}
	}

}