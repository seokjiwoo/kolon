/* jshint node: true, strict: true */
module.exports = DropDownMenu().getInstance();

function DropDownMenu() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/DropDownMenu.js';

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU;

	var opts = {
		wrap : 'body',
		dropMenus : '.drop',
		dropCheckMenus : '.dropChk',
		cssClass : {
			active : 'on',
			dropOn : 'dropOn'
		},
		dataAttr : {
			prevent : 'prevent',
			allChecker : 'all-checker'
		}
	};

	var callerObj = {
		init : init,
		refresh : refresh,
		destroy : destroy,
		EVENT : DROPDOWNMENU_EVENT
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
		eventManager.on(self.EVENT.REFRESH, $.proxy(refresh, self))
					.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).on(self.EVENT.REFRESH, $.proxy(refresh, self))
				.on(self.EVENT.DESTROY, $.proxy(destroy, self));

		$.each(self.drops, function() {
			$(this).find('a').eq(0).on('click', $.proxy(onDropMenuToggle, self));
			$(this).find('a:not(:first)').on('click', $.proxy(onDropMenuClick, self));
		});

		$.each(self.dropCheckMenus, function() {
			$(this).find('input').on('change', $.proxy(onDropCheckChange, self));
		});
	}

	function removeBindEvents() {
		eventManager.off(self.EVENT.REFRESH, $.proxy(refresh, self))
					.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		$(self).off(self.EVENT.REFRESH, $.proxy(refresh, self))
				.off(self.EVENT.DESTROY, $.proxy(destroy, self));

		$.each(self.drops, function() {
			$(this).find('a').eq(0).off('click', $.proxy(onDropMenuToggle, self));
			$(this).find('a:not(:first)').off('click', $.proxy(onDropMenuClick, self));
			$(this).off('keyupoutside mousedownoutside', $.proxy(onDropMenuClose, self));
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

		if (dropMenu.hasClass(self.opts.cssClass.dropOn)) {
			dropMenu.one('keyupoutside mousedownoutside', $.proxy(onDropMenuClose, self));
		}
	}

	function onDropMenuClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		dropMenu = target.closest(self.opts.dropMenus),
		menus = dropMenu.find('a');

		menus.filter('.' + self.opts.cssClass.active).removeClass(self.opts.cssClass.active);
		target.addClass(self.opts.cssClass.active);
		menus.eq(0).text(target.text());

		dropMenu.removeClass(self.opts.cssClass.dropOn)
				.val([target.data('value')])
				.trigger(self.EVENT.CHANGE, {menu: dropMenu, values : dropMenu.val()});
				
		eventManager.trigger(self.EVENT.CHANGE, {menu: dropMenu, values : dropMenu.val()});

		dropMenu.off('keyupoutside mousedownoutside', $.proxy(onDropMenuClose, self));
	}

	function onDropCheckChange(e) {
		var target = $(e.currentTarget),
		dropCheckMenu = target.closest(self.opts.dropCheckMenus),
		hasAllChecker = dropCheckMenu.find('[data-' + self.opts.dataAttr.allChecker + ']'),
		checks = dropCheckMenu.find('input'),
		labels = dropCheckMenu.find('label'),
		idx = checks.index(target),
		isChecked = target.prop('checked');


		// 전체선택 토글 처리
		if ((hasAllChecker.size() && target.data(self.opts.dataAttr.allChecker)) || (!hasAllChecker.size() && idx === 0)) {
			checks.prop('checked', isChecked);
			if (isChecked) {
				labels.addClass(self.opts.cssClass.active);
			} else {
				labels.removeClass(self.opts.cssClass.active);
			}

			triggerDropCheckValues(dropCheckMenu, checks);
			return;
		}

		// input 요소 선택에 따른 '전체선택' 활성화처리
		if (isChecked) {
			if (checks.size() - checks.filter(':checked').size() === 1) {
				if (hasAllChecker.size()) {
					hasAllChecker.prop('checked', true);
					hasAllChecker.siblings('label').addClass(self.opts.cssClass.active);
					target.siblings('label').addClass(self.opts.cssClass.active);
				} else {
					checks.eq(0).prop('checked', true);
					labels.eq(0).addClass(self.opts.cssClass.active);
				}
			} else {
				target.siblings('label').addClass(self.opts.cssClass.active);
			}
		} else {
			if (hasAllChecker.size()) {
				hasAllChecker.prop('checked', false);
				hasAllChecker.siblings('label').removeClass(self.opts.cssClass.active);
				target.siblings('label').removeClass(self.opts.cssClass.active);
			} else {
				checks.eq(0).prop('checked', false);
				labels.eq(0).removeClass(self.opts.cssClass.active);
			}
		}

		triggerDropCheckValues(dropCheckMenu, checks);
	}

	function triggerDropCheckValues(dropCheckMenu, checks) {
		var values = [];
		$.each(checks.filter(':checked'), function() {
			values.push($(this).attr('name'));
		});

		eventManager.trigger(self.EVENT.CHANGE, {menu: dropCheckMenu, values : values});
		dropCheckMenu.val(values)
					.trigger(self.EVENT.CHANGE, {menu: dropCheckMenu, values : values});
	}

	function onDropMenuClose(e) {
		var target = $(e.currentTarget);
		target.removeClass(self.opts.cssClass.dropOn);
	}

	function destroy() {
		if (!(instance && self)) return;
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