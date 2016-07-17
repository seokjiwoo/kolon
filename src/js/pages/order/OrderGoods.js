/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'order/OrderGoods.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	ORDER_EVENT = events.ORDER;

	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var originAddress;
	var targetAddress;
	var addressBookTarget;

	var pointLimit;
	var baseTotalPrice;

	$(document).on('refreshAddressData', refreshAddressDataHandler);
	$(document).on('selectAddressData', selectAddressDataHandler);

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
		
		debug.log(fileName, $, util, controller, eventManager, events, COLORBOX_EVENT);

		self = callerObj;
		self.opts = opts;
		
		setElements();
		setBindEvents();
		
		var orderProductArray = new Array();

		if (Cookies.getJSON('instantOrder') == undefined) {
			//
		} else {
			orderProductArray = Cookies.getJSON('instantOrder');
			$.map(orderProductArray, function(eachCartItem) {
				eachCartItem.quantity = eachCartItem.productQuantity;
			});
			//Cookies.remove('instantOrder');
			controller.myOrdersInfo(orderProductArray);
		}
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case ORDER_EVENT.ORDERS_INFO:
				result.common.data.paymentInfo.leftPoint = 10000;

				baseTotalPrice = Number(result.common.data.paymentInfo.totalPaymentPrice);
				pointLimit = Number(result.common.data.paymentInfo.leftPoint);
				
				var totalDeliveryCharge = 0;
				$.each(result.common.data.products, function(key, value) {
					//result.common.data.paymentInfo[key+'Desc'] = util.currencyFormat(value);
					totalDeliveryCharge += value.deliveryCharge;
				});
				$.each(result.common.data.paymentInfo, function(key, value) {
					result.common.data.paymentInfo[key+'Desc'] = util.currencyFormat(value);
				});
				console.log(result.common.data);

				displayData(result.common.data);
				if (result.common.data.products.length == 1) {
					$('#deliveryTab').hide();
					$('#addressFormWrapper').css('margin-top', '20px');
					$('#delivery1').show();
					$('#delivery2').hide();
				}

				refreshAddressDataHandler();
				$('.addressSelect').change(function(e){
					setAddress($(this).attr('id').substr(14), $(this).val());
				});
				$('.messageSelect').change(function(e){
					if ($(this).val() != '-') {
						$('#messageField-'+$(this).attr('id').substr(14)).val( $(this).val() );
					}
				});
				$('.messageField').change(function(e){
					$('#messageSelect-'+$(this).attr('id').substr(13)).val('-');
				});
				$('.openAddressPopup').click(function(e) {
					addressBookTarget = $(this).attr('id').substr(12);
					console.log($(this).attr('id').substr(12));
				});

				if (pointLimit < 5000) {
					$('#pointCk01').attr('disabled', 'disabled');
					$('#pointWt').attr('disabled', 'disabled');
				}
				$('#pointWt').change(function(e){
					var newValue = Number($('#pointWt').val());
					if (newValue < 5000) {
						alert('포인트는 최하 5000포인트부터 사용가능합니다.');
						$('#pointWt').val('');
						$('.usedPoint').text('0');
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice));
					} else if (newValue > pointLimit) {
						alert('사용 가능한 포인트를 초과합니다. 다시 입력해주세요.');
						$('#pointWt').val('');
						$('.usedPoint').text('0');
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice));
					} else {
						$('.usedPoint').text(util.currencyFormat(newValue));
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice-newValue));
					}
				});
				$('#useAllPointCheck').click(function(e){
					if (!$('#pointCk01').prop('checked')) {
						$('#pointWt').val(pointLimit);
						$('.usedPoint').text(pointLimit);
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice-pointLimit));
					} else {
						$('#pointWt').val('');
						$('.usedPoint').text('0');
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice));
					}
				});

				$('.basePrice').text(util.currencyFormat(result.common.data.paymentInfo.totalPaymentPrice-totalDeliveryCharge));
				$('.basicDiscount').text(result.common.data.paymentInfo.totalDiscountPriceDesc);
				$('.usedPoint').text('0');
				$('.handlingPrice').text(util.currencyFormat(totalDeliveryCharge));
				$('.totalPrice').text(result.common.data.paymentInfo.totalPaymentPriceDesc);
				break;
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var delivery1 = self.opts.templates.delivery1,
		delivery2 = self.opts.templates.delivery2,
		source, template, insertElements;

		source = $(delivery1.template).html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(data));

		$(delivery1.wrap).empty().append(insertElements).imagesLoaded().always(function() {
			eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
			eventManager.triggerHandler(INFOSLIDER_EVENT.REFRESH);
		});

		source = $(delivery2.template).html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(data));
		
		$(delivery2.wrap).empty().append(insertElements).imagesLoaded().always(function() {
			eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
			eventManager.triggerHandler(INFOSLIDER_EVENT.REFRESH);
		});

		source = $('#order-payment-templates').html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(data.paymentInfo));
		$('#paymentForm1').empty().append(insertElements);
		
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}




	

	function refreshAddressDataHandler(e) {
		addressController.addressList();
	};

	function addressListHandler(e, status, list) {
		var tags = '<option value="-" label="선택해 주세요" selected="selected">선택해 주세요</option>';
		
		addressArray = new Array();
		$.map(list.items, function(each) {
			addressArray[each.addressSequence] = each;
			tags += '<option value="'+each.addressSequence+'" label="'+each.addressManagementName+'">'+each.addressManagementName+'</option>';
		});
		$('.addressSelect').html(tags);
	};

	function setAddress(addressNum, seq) {
		var addressObject = addressArray[seq];
		$('#address-'+addressNum).html('<p><span><b>받으실 분</b>'+addressObject.receiverName+'</span><span><b>연락처</b>'+util.mobileNumberFormat(addressObject.cellPhoneNumber)+' </span></p><p><span><b>도로명</b>'+addressObject.roadBaseAddress+' '+addressObject.detailAddress+'</span><span><b>지번</b>'+addressObject.lotBaseAddress+'</span></p>');
		
		/*switch(addressNum) {
			case 'origin': 
				originAddress = addressObject;
				//
				break;
			case 'target':
				targetAddress = addressObject;
				break; 
		}*/
	}

	function selectAddressDataHandler(e, seq) {
		console.log(addressBookTarget, seq);
		setAddress(addressBookTarget, seq);
		$('#addressSelect-'+addressBookTarget).val(seq);
	};
};