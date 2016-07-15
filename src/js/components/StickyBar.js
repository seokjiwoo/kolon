/* jshint node: true, strict: true */
module.exports = StickyBar().getInstance();

function StickyBar() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/StickyBar.js';

	var opts = {
		header : '#top .topMenu',
		stickyBar : {
			wrap : '.js-sticky-bar',
			list : '.js-sticky-list'
		},
		cssClass : {
			isFixed : 'is-fixed'
		},
		duration : 400,
		marginPos : 0
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

		onScrollListener();
	}

	function setElements() {
		self.stickyBar = $(self.opts.stickyBar.wrap);
		self.stickyBarList = self.stickyBar.find(self.opts.stickyBar.list);
		self.orgPos = self.stickyBar.offset().top - self.stickyBar.outerHeight();
		self.headerHeight = $(self.opts.header).outerHeight() + self.opts.marginPos;
	}

	function setBindEvents() {
		$(win).on('scroll', $.proxy(onScrollListener, self))
				.on('resize', $.proxy(onResizeListener, self));

		self.stickyBarList.find('a').on('click', $.proxy(onStickyClick, self));
	}

	function onStickyClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		activeTrg = $($(target).attr('href')),
		activePos;

		if (activeTrg.size()) {
			activePos = activeTrg.offset().top - self.stickyBar.outerHeight() - self.headerHeight;

			$('html, body').animate({scrollTop : activePos}, self.opts.duration);
		}
	}

	function onScrollListener() {
		var winTop = $(win).scrollTop(),
		checkPos = self.orgPos - self.headerHeight;

		if (winTop >= checkPos) {
			self.stickyBar.addClass(self.opts.cssClass.isFixed);
		} else {
			self.stickyBar.removeClass(self.opts.cssClass.isFixed);
		}

		if (!self.stickyBar.hasClass(self.opts.cssClass.isFixed)) {
			return
		}

		$.each(self.stickyBarList.find('a'), function() {
			var target = $($(this).attr('href')),
			targetPos;

			if (!target.size()) {
				return;
			}

			targetPos = (target.offset().top - self.stickyBar.outerHeight()) - self.headerHeight;

			if (winTop >= targetPos) {
				$(this).parent().addClass('on');
				$(this).parent().siblings().removeClass('on');
			}
		});
	}

	function onResizeListener() {
		onScrollListener();
	}

}