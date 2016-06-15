/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	DEBUG = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	FILE_NAME = 'LivingCategory.js';

	var opts = {
		wrap : '.js-slider-wrap',
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		rangeSlider : {
			target : '.js-slider',
			opts : {
				range : true,
				min : 0,
				max : 500,
				step : 1,
				values : [ 75, 300 ],
				create : $.noop,
				slide : $.noop,
				stop : $.noop,
				currency : '만원'
			}
		},
		info : {
			values : '.js-slider-values',
			leftValue : '.js-slider-lv',
			rightValue : '.js-slider-rv'
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
		
		self.wrap = self.colorbox.find(opts.wrap);
		self.slider = self.wrap.find(opts.rangeSlider.target);
		self.infoValues = self.wrap.find(opts.info.values);
		self.infoLeft = self.wrap.find(opts.info.leftValue);
		self.infoRight = self.wrap.find(opts.info.rightValue);
		
		if (self.slider.slider('instance')) {
			return;
		}

		var sliderOpts = {},
		dataOpts = self.slider.data('slider-opt');

		if (dataOpts) {
			sliderOpts = $.extend(true, opts.rangeSlider.opts, dataOpts);
		}

		if (sliderOpts.create === $.noop) {
			sliderOpts.create = onSliderCreate;
		}

		if (sliderOpts.slide === $.noop) {
			sliderOpts.slide = onSliderChange;	
		}

		if (sliderOpts.stop === $.noop) {
			sliderOpts.stop = setValuesPos;
		}

		self.currency = sliderOpts.currency;

		DEBUG.log(FILE_NAME, 'setRangeSlider data-slide-opt : ', self.slider, self.slider.data('slider-opt'), sliderOpts);
		self.slider.slider(sliderOpts);
	}

	function onSliderCreate(e, ui) {
		DEBUG.log(FILE_NAME, 'onSliderCreate', e, ui);

		var inst = self.slider.slider('instance'),
		handles = inst.handles;

		self.range = $(inst.range);
		self.handleLeft = $(handles[0]);
		self.handleRight = $(handles[1]);

		self.handleLeft.addClass('leftBtn');
		self.handleRight.addClass('rightBtn');

		onSliderChange(e, self.slider.slider('option'));
	}

	function onSliderChange(e, ui) {
		DEBUG.log(FILE_NAME, 'onSliderChange', ui, ui.values[0] + ' ~ ' + ui.values[1]);
		var leftValue = util.currencyFormat(ui.values[0]),
		rightValue = util.currencyFormat(ui.values[1]);

		self.infoValues.text(leftValue + ' ~ ' + rightValue);
		self.infoLeft.text(leftValue + self.currency);
		self.infoRight.text(rightValue + self.currency);

		setValuesPos();
	}

	function destoryRangeSlider() {
		DEBUG.log(FILE_NAME, 'destoryRangeSlider');
		self.slider = self.colorbox.find(opts.rangeSlider.target);

		if (self.slider.slider('instance')) {
			self.slider.slider('destroy');
		}
	}

	function setValuesPos() {
		var widthPer = (self.range.width() / self.range.offsetParent().width()) * 100,
		leftPer = (self.range.position().left / self.slider.outerWidth())  * 100,
		posPer = ((widthPer/2) + leftPer);

		self.infoValues.css({
			'left' : posPer + '%'
		});
	}

};