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
	WINDOWOPENER_EVENT = events.WINDOW_OPENER,
	COLORBOX_EVENT = events.COLOR_BOX,
	CARD_LIST_EVENT = events.CARD_LIST;

	var opts = {
		wrap : '.js-social-wrap',
		shareOpen : '.js-open',
		shareClose : '.js-close',
		sharePop : {
			btns : '.btnPop[data-share-url]',
			layerClass : 'snsSharePop'
		},
		templates : {
			wrap : '.js-share-pop-templates-wrap',
			template : '#share-pop-templates'
		},
		colorbox : '#colorbox',
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
		self.btnSharePop = $(self.opts.sharePop.btns);
		self.colorbox = $(self.opts.colorbox);

		if ($('#shareLink').size()) {
			$('#shareLink').val($('#shareLink').data('share-url') || win.location.href);
		}
	}

	function setBindEvents() {
		self.shareOpen.on('click', onShareOpenClick);
		self.shareClose.on('click', onShareCloseClick);
		self.shareBtns.on('click', onShareBtnsClick);
		self.btnSharePop.on('click', onSharePopClick);

		var clipBtn = self.shareBtns.filter('[data-share-sns=\'url\']');
		self.clip = new win.ZeroClipboard(clipBtn).setText(clipBtn.data('share-url') || win.location.href);

		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener)
					.on(CARD_LIST_EVENT.APPENDED, refresh);
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

	function onSharePopClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		shareUrl = target.data('share-url');

		self.selShareUrl = { 'shareUrl' : hasDomain(shareUrl) ? shareUrl : win.location.protocol + '//' + win.location.host + shareUrl };
	}

	function hasDomain(url) {
		return (/koloncommon/).test(url);
	}

	function onShareBtnsClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		snsType = target.data('share-sns'),
		format = self.opts.format,
		shareUrl = target.data('share-url'),
		href;

		debug.log(fileName, 'onShareBtnsClick', target, snsType);

		switch(snsType) {
			case 'facebook':
				href = format.facebook.replace('{{URL}}', encodeURIComponent(shareUrl || win.location.href));
				break;
			case 'twitter':
				href = format.twitter.replace('{{URL}}', encodeURIComponent(shareUrl || win.location.href));
				break;
			case 'kakaostory':
				href = format.kakaostory.replace('{{URL}}', encodeURIComponent(shareUrl || win.location.href));
				break;
			case 'pinterest':
				href = format.pinterest.replace('{{URL}}', encodeURIComponent(shareUrl || win.location.href));
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
		self.btnSharePop.off('click', onSharePopClick);
		self.clip.off('complete');

		eventManager.off(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener)
					.off(CARD_LIST_EVENT.APPENDED, refresh);

		delete self.clip;
	}

	function destroy() {
		removeBindEvents();
	}

	function refresh() {
		destroy();
		init();
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = $(self.opts.templates.template).html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		win.console.log(data);

		$(self.opts.templates.wrap).empty()
							.append(insertElements);

		$(self.opts.templates.wrap).imagesLoaded()
							.always(function() {
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				if (self.colorbox.hasClass(self.opts.sharePop.layerClass)) {
					displayData(self.selShareUrl);
				}
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}

}