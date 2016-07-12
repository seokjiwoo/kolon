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
	fileName = 'shop/Index.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	cartController = require('../../controller/OrderController.js'),
	productController = require('../../controller/ProductController.js'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCT_EVENT = events.PRODUCT;

	var CardList = require('../../components/CardList.js');
	var cardList;

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);
		
		setElements();
		setBindEvents();

		productController.shopList();
	}

	function setElements() {
		cardList = CardList();
		$(cardList).on('cardAppended', cardAppendedHandler);
		cardList.init();

		$('#mainSlider').bxSlider();
	}

	function setBindEvents() {
		$(cartController).on(CART_EVENT.WILD_CARD, onControllerListener);
		$(productController).on(PRODUCT_EVENT.WILD_CARD, onControllerListener);
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;
		
		switch(eventType) {
			case PRODUCT_EVENT.SHOP_LIST:
				cardList.appendData(result.productCards);
				break;
		}
	};

	function cardAppendedHandler(e) {
		console.log('카드 이벤트 설정?');
	}
};