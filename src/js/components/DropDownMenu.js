/* jshint node: true, strict: true */
module.exports = DropDownMenu().getInstance();

function DropDownMenu() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	fileName = 'compoents/DropDownMenu.js';

	var opts = {
		wrap : 'body',
		dropMenus : '.drop',
		dropCheckMenus : '.dropChk',
		cssClass : {
			active : 'on',
			dropOn : 'dropOn'
		},
		dataAttr : {
			prevent : 'prevent'
		}
	};

	var callerObj = {
		init : init,
		refresh : refresh,
		destroy : destroy,
		EVENT : {
			REFRESH : 'DROP_DOWN_MENU-REFRESH',
			DESTROY : 'DROP_DOWN_MENU-DESTROY',
			CHANGE : 'DROP_DOWN_MENU-CHANGE'
		}
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
		self.wrap = $(self.opts.wrap);
		self.drops = self.wrap.find(self.opts.dropMenus);
		self.dropMenus = self.drops.filter(':not(' + self.opts.dropCheckMenus + ')');
		self.dropCheckMenus = self.drops.filter(self.opts.dropCheckMenus);
	}

	function setBindEvents() {
		$('body').on(self.EVENT.REFRESH, $.proxy(refresh, self))
					.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).on(self.EVENT.REFRESH, $.proxy(refresh, self))
				.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		$.each(self.drops, function() {
			$(this).find('a').eq(0).on('click', onDropMenuToggle);
			$(this).find('a:not(:first)').on('click', onDropMenuClick);
		});
	}

	function removeBindEvents() {
		$('body').off(self.EVENT.REFRESH, $.proxy(refresh, self))
					.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).off(self.EVENT.REFRESH, $.proxy(refresh, self))
				.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		$.each(self.drops, function() {
			$(this).find('a').eq(0).off('click', onDropMenuToggle);
			$(this).find('a:not(:first)').off('click', onDropMenuClick);
		});
	}

	function onDropMenuToggle(e) {
		var target = $(e.currentTarget),
		dropMenu = target.closest(self.opts.dropMenus),
		isPrevent = (dropMenu.data(self.opts.dataAttr.prevent) === undefined) ? true : dropMenu.data(self.opts.dataAttr.prevent);
		
		if (isPrevent) {
			e.preventDefault();
		}

		dropMenu.toggleClass(self.opts.cssClass.dropOn);
	}

	function onDropMenuClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		dropMenu = target.closest(self.opts.dropMenus);

		dropMenu.find('a.' + self.opts.cssClass.active)
				.removeClass(self.opts.cssClass.active);

		target.addClass(self.opts.cssClass.active);

		dropMenu.removeClass(self.opts.cssClass.dropOn)
				.val([target.data('value')])
				.trigger(self.EVENT.CHANGE, {value : dropMenu.val()});
	}

	function destroy() {
		removeBindEvents();

		$.each(self.drops, function() {
			$(this).val('');
		});
	}

	function refresh() {
		destroy();
		init();
	}

}