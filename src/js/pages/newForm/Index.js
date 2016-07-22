/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	fileName = 'newForm/Index.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	cartController = require('../../controller/OrderController.js'),
	productController = require('../../controller/ProductController.js'),
	DropDownMenu = require('../../components/DropDownMenu.js'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCT_EVENT = events.PRODUCT;

	var CardList = require('../../components/CardList.js');
	var cardList;

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
				currency : ''
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

	var listOrder = 'newest';

	var SuperClass = require('../Page.js'),
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

		debug.log(fileName, 'init');
		
		self = callerObj;

		setElements();
		setBindEvents();

		productController.newFormList(listOrder);			// newest:최신순/scrap:스크랩순/like:좋아요순
		$('#orderDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			cardList.removeAllData();
			listOrder = data.values[0];
			productController.newFormList(listOrder);
		});
	}

	function setElements() {
		debug.log(fileName, 'setElements');

		cardList = CardList();
		$(cardList).on('cardAppended', cardAppendedHandler);
		cardList.init();	// 카드 리스트

		self.colorbox = $(opts.colorbox.target);
		$('#mainSlider').bxSlider({
			auto:true,
			autoHover:true,
			pause:5000
		});
	}

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
				
		$(cartController).on(CART_EVENT.WILD_CARD, onControllerListener);
		$(productController).on(PRODUCT_EVENT.WILD_CARD, onControllerListener);
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;
		
		switch(eventType) {
			case PRODUCT_EVENT.NEWFORM_LIST:
				cardList.appendData(result.productCards);
				break;
		}
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

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
		debug.log(fileName, 'setRangeSlider');
		
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

		debug.log(fileName, 'setRangeSlider data-slide-opt : ', self.slider, self.slider.data('slider-opt'), sliderOpts);
		self.slider.slider(sliderOpts);
	}

	function onSliderCreate(e, ui) {
		debug.log(fileName, 'onSliderCreate', e, ui);

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
		debug.log(fileName, 'onSliderChange', ui, ui.values[0] + ' ~ ' + ui.values[1]);
		var leftValue = util.currencyFormat(ui.values[0]),
		rightValue = util.currencyFormat(ui.values[1]);

		self.infoValues.text(leftValue + ' ~ ' + rightValue);
		self.infoLeft.text(leftValue + self.currency);
		self.infoRight.text(rightValue + self.currency);

		setValuesPos();
	}

	function destoryRangeSlider() {
		debug.log(fileName, 'destoryRangeSlider');
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

	function cardAppendedHandler(e) {
		debug.log('카드 이벤트 설정?');
	};
};