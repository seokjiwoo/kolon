/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	imageUploader = require('../../components/ImageUploader.js'),
	fileName = 'myPage/MyPage.js';

	var opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			popProfilePic : 'popProfilePic'
		},
		imageUploader : {
			flashOpts : {
				swf : '../images/swf/imagePreview.swf',
				id : 'imageUpoader',
				width : '100%',
				height : '100%',
				wmode : 'transparent',
				filterOpt : {
					filter : 'images (*.jpg, *.jpeg, *.png)',
					type : '*.jpg;*.jpeg;*.png'
				}
			}
		}
	};

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;
	
	return callerObj;
	
	function init(options) {
		Super.init();

		debug.log(fileName, 'init', $, util);

		self = callerObj;

		setElements();
		setBindEvents();
	}

	function setElements() {
		debug.log(fileName, 'setElements');

		self.colorbox = $(opts.colorbox.target);
	}

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.popProfilePic)) {
					imageUploader.init(opts.imageUploader);
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.popProfilePic)) {
					imageUploader.destory();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}
};