/* jshint node: true, strict: true */
module.exports = ScrollMenu().getInstance();

function ScrollMenu() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/ScrollMenu.js';

	var opts = {
		cssClass : {
			isScrolling : 'is-scrolling'
		}
	};

	var callerObj = {
		init : init
	},
	instance, self;
	
	return {
		getInstance: function() {
			if (!instance) instance = callerObj;
			return instance;
		}
	};
	
	function init(options) {
		self = callerObj;
		self.opts = $.extend({}, opts, options);

		debug.log(fileName, 'init', self.opts);

		setElements();
		setBindEvents();
	}

	function setElements() {
		self.startY = 0;
		self.body = $('body');
	}

	function setBindEvents() {
		// $(win).on('scroll', $.proxy(onScrollListener, self))
		// 		.on('resize', $.proxy(onResizeListener, self));
		
		$(win).on('touchstart', $.proxy(onTouchStart, self))
				.on('touchmove', $.proxy(onTouchMove, self))
				.on('touchend', $.proxy(onTouchEnd, self));
	}

	function onTouchStart(e) {
		var event = e.originalEvent,
		touchObj = event.changedTouches[0];

		self.startY = parseInt(touchObj.clientY, 10);
	}

	function onTouchMove(e) {
		var winTop = $(win).scrollTop(),
		event = e.originalEvent,
		touchObj = event.changedTouches[0],
		dist = parseInt(touchObj.clientY) - self.startY;

		if (dist > 0) {
			self.body.addClass(self.opts.cssClass.isScrolling);
		} else {
			self.body.removeClass(self.opts.cssClass.isScrolling);
		}
	}

	function onTouchEnd(e) {
		var winTop = $(win).scrollTop(),
		event = e.originalEvent,
		touchObj = event.changedTouches[0],
		dist = parseInt(touchObj.clientY) - self.startY;

		if (dist > 0) {
			self.body.addClass(self.opts.cssClass.isScrolling);
		} else {
			self.body.removeClass(self.opts.cssClass.isScrolling);
		}
	}

}