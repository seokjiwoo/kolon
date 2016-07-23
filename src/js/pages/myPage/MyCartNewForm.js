/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyCartNewForm.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CHECKBOX_EVENT = events.CHECK_BOX,
	CART_EVENT = events.CART;

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		newFormList : {
			wrap : '.js-myCartNewForm-list',
			totalPrice : '.js-list-totalPrice'
		},
		templates : {
			wrap : '.singleCard',
			template : '#myCartNewForm-list-templates'
		},
		listSize : '.js-list-size',
		listDel : '.js-list-delete',
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		// myCartNewForm 리스트 조회
		var productSectionCode = 'PD_PROD_SVC_SECTION_02';
		controller.myCartList(productSectionCode);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(CART_EVENT.WILD_CARD, onControllerListener);

		eventManager.on(CHECKBOX_EVENT.CHANGE, onCheckBoxChange);
	}

	function setDeleteEvents() {
		// 선택 리스트 삭제 처리
		$(self.opts.listDel).on('click', function(e) {
			e.preventDefault();

			var list = $('[data-chk-group=\'myCartNewForm\']').not('[data-chk-role=\'chkAll\']').filter('.on'),
			deleteList = [];

			$.each(list, function() {
				deleteList.push($(this).data('cart-number'));
			});

			if (!deleteList.length) {
				return;
			}

			// myCartNewForm 리스트 삭제
			controller.deleteMyCartList(deleteList);
		});
	}

	function onCheckBoxChange(/*e, target, chkGroup, chked*/) {
	}

	function displayData(data) {
		if (data.myCarts) {
			$.map(data.myCarts, function(myCarts) {
				myCarts.deliveryChargeDesc = util.currencyFormat(myCarts.deliveryCharge);
				myCarts.productOrderPriceDesc = util.currencyFormat(myCarts.productOrderPrice);
				myCarts.productSalePriceDesc = util.currencyFormat(myCarts.productSalePrice);
			});
		}

		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data.myCarts));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});

		self.templatesWrap.find(self.opts.listSize).html(self.templatesWrap.find(self.opts.newFormList.wrap).size());
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case CART_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result.data);
				setDeleteEvents();
				break;
			case CART_EVENT.DELETE:
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status);
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
		}
	}

	function testResult() {
		win.alert('임시처리 결과처리 - location.reload');
		win.location.reload();
	}

};