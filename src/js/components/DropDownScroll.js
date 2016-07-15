/* jshint node: true, strict: true */
module.exports = DropDownScroll().getInstance();

function DropDownScroll() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/DropDownScroll.js';

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	DROPDOWNSCROLL_EVENT = events.DROPDOWN_SCROLL;

	var opts = {
		wrap : '.dropScroll, .dropScrollEx',
		toggler : '.dropToggle',
		iScroll : {
			target : '.scrollWrap, scrollWrapEx',
			list : '.dropList, .dropListEx',
			items : '.dropList > ul > li > a, .dropListEx > ul > li > a',
			opts : {
				scrollbars: true,
				mouseWheel: true,
				fadeScrollbars: false,
				bounce: false
			}
		},
		cssClass : {
			isShow : 'is-show'
		}
	};

	var callerObj = {
		init : init,
		refresh : refresh,
		destroy : destroy
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
		setIscroll();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.toggler = self.wrap.find(self.opts.toggler);

		self.iScrolls = [];
		self.iScrollsTrg = self.wrap.find(self.opts.iScroll.target);
		self.iScrollsItems = self.iScrollsTrg.find(self.opts.iScroll.items);
	}

	function setBindEvents() {
		eventManager.on(self.EVENT.REFRESH, $.proxy(refresh, self))
					.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).on(self.EVENT.REFRESH, $.proxy(refresh, self))
				.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		self.toggler.on('click', $.proxy(onTogglerClick, self));
		self.iScrollsItems.on('click', $.proxy(onItemsClick, self));
	}

	function setIscroll() {
		var iScroll;

		$.each(self.iScrollsTrg, function() {
			iScroll = new win.IScroll($(this).get(0), self.opts.iScroll.opts);
			$(this).closest(self.opts.wrap).data('iscroll', iScroll);
			self.iScrolls.push(iScroll);
		});
	}

	function onTogglerClick(e) {
		e.preventDefault();
		var target = $(e.currentTarget),
		wrap = target.closest(self.opts.wrap),
		iScroll = wrap.data('iscroll');

		wrap.toggleClass(self.opts.cssClass.isShow);

		if (!wrap.hasClass(self.opts.cssClass.isShow)) return;

		if (iScroll) iScroll.refresh();
		wrap.one('keyupoutside mousedownoutside', $.proxy(onWrapClose, self));
		wrap.on('mousewheel', $.proxy(onWheelPrevent, self));
	}

	function onItemsClick(e) {
		e.preventDefault();
		var target = $(e.currentTarget),
		wrap = target.closest(self.opts.wrap),
		toggler = wrap.find(self.opts.toggler);

		toggler.text(target.text());

		wrap.off('keyupoutside mousedownoutside', $.proxy(onWrapClose, self))
			.off('mousewheel', $.proxy(onWheelPrevent, self));

		wrap.removeClass(self.opts.cssClass.isShow)
				.val(target.data('value'))
				.trigger(DROPDOWNSCROLL_EVENT.CHANGE, {menu: wrap, values : wrap.val()});

		eventManager.trigger(DROPDOWNSCROLL_EVENT.CHANGE, {menu: wrap, values : wrap.val()});
	}

	function onWrapClose(e) {
		var target = $(e.currentTarget);
		target.removeClass(self.opts.cssClass.isShow);
	}

	function removeBindEvents() {
		eventManager.off(self.EVENT.REFRESH, $.proxy(refresh, self))
					.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).off(self.EVENT.REFRESH, $.proxy(refresh, self))
				.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		self.toggler.off('click', $.proxy(onTogglerClick, self));
		self.iScrollsItems.off('click', $.proxy(onItemsClick, self));
	}

	function onWheelPrevent(e) {
		e.preventDefault();
	}

	function destroy() {
		removeBindEvents();

		$.each(self.wrap, function() {
			$(this).val('');
		});
	}

	function refresh() {
		destroy();
		init();
	}

}