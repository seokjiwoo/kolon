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
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
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

		setElements();
		setBindEvents();

		messagePopup.init('', 1);
	}

	function setElements() {
	}

	function setBindEvents() {
	}
};