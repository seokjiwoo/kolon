/* jshint node: true, strict: true */
module.exports = EventManager().getInstance();

function EventManager() {
	'use strict';

	var win = window,
	doc = win.document,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	events = require('./Events'),
	fileName = 'events/EventManager.js';

	var COLORBOX_EVENT = events.COLOR_BOX,
	SCRAP_EVENT = events.SCRAP,
	instance;

	return {
		getInstance: function() {
			if (!instance) {
				instance = EventsManager();
			}
			debug.log(fileName, 'getInstance', instance, events);
			return instance;
		}
	};

	function EventsManager() {
		var eventElement = $('<div data-event-manager=\'VX-KOLON\' style="display:none"></div>');

		function init() {
			debug.log(fileName, 'init', eventElement);
			$('body').append(eventElement);
			setBindEvents();
		}

		function setBindEvents() {
			$(doc).on(COLORBOX_EVENT.WILD_CARD, onColorBoxListener);
			eventElement.on(COLORBOX_EVENT.CLOSE + ' ' + COLORBOX_EVENT.RESIZE, onColorBoxCustomListener);
		}

		function onColorBoxListener(e) {
			debug.log(fileName, 'onColorBoxListener', e, eventElement, instance);
			switch(e.type) {
				case COLORBOX_EVENT.COMPLETE:
					eventElement.triggerHandler(COLORBOX_EVENT.REFRESH);
					break;
				case COLORBOX_EVENT.CLEANUP:
					eventElement.triggerHandler(COLORBOX_EVENT.DESTROY);
					break;
				case COLORBOX_EVENT.CLOSE:
					$.colorbox.close();
					break;
				case COLORBOX_EVENT.RESIZE:
					$.colorbox.resize();
					break;
			}
			eventElement.triggerHandler(e);
		}

		function onColorBoxCustomListener(e) {
			debug.log(fileName, 'onColorBoxCustomListener', e, eventElement, instance);
			switch(e.type) {
				case COLORBOX_EVENT.CLOSE:
					$.colorbox.close();
					break;
				case COLORBOX_EVENT.RESIZE:
					$.colorbox.resize();
					break;
			}
		}

		init();

		return eventElement;
	}

}