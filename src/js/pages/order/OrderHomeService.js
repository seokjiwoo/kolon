/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'order/OrderService.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	CARD_LIST_EVENT = events.CARD_LIST,
	ORDER_EVENT = events.ORDER;

	var DatePickerClass = require('../../components/DatePicker.js'),
    ConsultPicker = DatePickerClass(),
    BuildPicker = DatePickerClass();

	var addressController = require('../../controller/AddressController.js');
	//$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var selectedOneAddress;
	var selectedMultiAddress = new Array();
	var addressBookTarget;

	var pointLimit;
	var baseTotalPrice;

	var productsInfo;

	//$(document).on('refreshAddressData', refreshAddressDataHandler);
	//$(document).on('selectAddressData', selectAddressDataHandler);
	
	var loginController = require('../../controller/LoginController');
	//$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');
	var loginData;

	var orderData;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			delivery1 : {
				wrap : '#delivery1',
				template : '#order-delivery1-templates',
			},
			delivery2 : {
				wrap : '#delivery2',
				template : '#order-delivery2-templates',	
			},
			wrap : '.test',
			template : '#order-goods-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		self = callerObj;
		self.opts = opts;
		
		setElements();
		setBindEvents();

		var orderProductArray = new Array();

		if (Cookies.getJSON('instantNFOrder') == undefined) {
			//alert('잘못된 접근입니다.');
			//Cookies.remove('instantNFOrder');
			//location.href='/';
		} else {
			//orderProductArray = Cookies.getJSON('instantNFOrder');
			//debug.log(orderProductArray);
			//Cookies.remove('instantNFOrder');
			//controller.orderNewFormDepositForm(orderProductArray);
		}
	}
}
