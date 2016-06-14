/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	DEBUG = require('../utils/Console.js'),
	FILE_NAME = 'LivingCategory.js';

	var opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		rangeSlider : {
			target : '.js-range-slider'
		},
		cssClass : {
			categoryPop : 'categoryPop'
		}
	};

	var SuperClass = require('./Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		'init' : init,
		'onCboxEventListener' : onCboxEventListener
	},
	self;
	
	return callerObj;
	
	function init() {
		Super.init();

		DEBUG.log(FILE_NAME, 'init');
		
		self = callerObj;

		setElements();
		setBindEvents();
	}

	function setElements() {
		DEBUG.log(FILE_NAME, 'setElements');

		self.colorbox = $(opts.colorbox.target);
	}

	function setBindEvents() {
		DEBUG.log(FILE_NAME, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
	}

	function onCboxEventListener(e) {
		DEBUG.log(FILE_NAME, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					setRangeSlider();
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.categoryPop)) {
					destoryRangeSlider();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}

	function setRangeSlider() {
		DEBUG.log(FILE_NAME, 'setRangeSlider');
		
		self.slider = self.colorbox.find(opts.rangeSlider.target);
		self.info = self.colorbox.find('.graphData');
		
		if (self.slider.slider('instance')) {
			return;
		}

		self.slider.slider({
			range : true,
			min : 0,
			max : 500,
			values : [ 75, 300 ],
			create : onSliderCreate,
			slide : onSliderChange
		});
	}

	function onSliderCreate(e, ui) {
		DEBUG.log(FILE_NAME, 'onSliderCreate');
		onSliderChange(e, self.slider.slider('option'));
	}

	function onSliderChange(e, ui) {
		DEBUG.log(FILE_NAME, 'onSliderChange', ui.values[0] + ' ~ ' + ui.values[1]);
		self.info.text(ui.values[0] + ' ~ ' + ui.values[1]);
	}

	function destoryRangeSlider() {
		DEBUG.log(FILE_NAME, 'destoryRangeSlider');
		self.slider = self.colorbox.find(opts.rangeSlider.target);

		if (self.slider.slider('instance')) {
			self.slider.slider('destroy');
		}
	}

};