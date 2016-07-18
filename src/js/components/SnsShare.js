/* jshint node: true, strict: true */
module.exports = SnsShare().getInstance();

function SnsShare() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/SnsShare.js';

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	WINDOWOPENER_EVENT = events.WINDOW_OPENER;

	var opts = {
		wrap : '.js-social-wrap',
		shareOpen : '.js-open',
		shareClose : '.js-close',
		dataAttr : {
			shareBtns : '[data-share-sns]'
		},
		cssClass : {
			isActive : 'active'
		},
		format : {
			facebook : "https://www.facebook.com/sharer.php?u={{URL}}",
            twitter : "https://www.twitter.com/share?url={{URL}}",
            google : "https://plus.google.com/share?url={{URL}}&btmpl=popup",
            pinterest : "https://www.pinterest.com/pin/create/button/?url={{URL}}",
            kakaostory : 'https://story.kakao.com/share?url={{URL}}',
            domain : ''
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

		win.ZeroClipboard.config({
			swfPath: '/js/zeroclipboard/dist/ZeroClipboard.swf'
		});

		setElements();
		setBindEvents();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.shareOpen = $(self.opts.shareOpen);
		self.shareClose = $(self.opts.shareClose);
		self.shareBtns = $(self.opts.dataAttr.shareBtns);
	}

	function setBindEvents() {
		self.shareOpen.on('click', onShareOpenClick);
		self.shareClose.on('click', onShareCloseClick);
		self.shareBtns.on('click', onShareBtnsClick);
		self.clip = new win.ZeroClipboard(self.shareBtns.filter('[data-share-sns=\'url\']')).setText(location.href);
	}

	function onShareOpenClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		wrap = target.closest(self.opts.wrap);

		wrap.addClass(self.opts.cssClass.isActive);
	}

	function onShareCloseClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		wrap = target.closest(self.opts.wrap);

		wrap.removeClass(self.opts.cssClass.isActive);
	}

	function hasDomain(url) {
		return new RegExp(/\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/).test(url || location.href);
	}

	function onShareBtnsClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		snsType = target.data('share-sns'),
		format = self.opts.format,
		href;

		debug.log(fileName, 'onShareBtnsClick', target, snsType);

		switch(snsType) {
			case 'facebook':
				href = format.facebook.replace('{{URL}}', encodeURIComponent(location.href));
				break;
			case 'twitter':
				href = format.twitter.replace('{{URL}}', encodeURIComponent(location.href));
				break;
			case 'kakaostory':
				href = format.kakaostory.replace('{{URL}}', encodeURIComponent(location.href));
				break;
			case 'pinterest':
				href = format.pinterest.replace('{{URL}}', encodeURIComponent(location.href));
				break;
		}

		if (snsType === 'url') {
			win.alert('주소가 복사되었습니다.\n원하는 곳에 붙여넣기(Ctrl+V)해주세요.');
			return;
		}

		eventManager.triggerHandler(
			WINDOWOPENER_EVENT.OPEN,
			[
				href,
				{
					name : 'snsshare',
					width : 730,
					height : 500
				}
			]
		);
	}

	function removeBindEvents() {
		self.shareOpen.off('click', onShareOpenClick);
		self.shareClose.off('click', onShareCloseClick);
		self.shareBtns.off('click', onShareBtnsClick);
		self.clip.off('complete');
		delete self.clip;
	}

	function destroy() {
		removeBindEvents();
	}

	function refresh() {
		destroy();
		init();
	}

}