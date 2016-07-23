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
	ORDER_EVENT = events.ORDER;

	var DatePickerClass = require('../../components/DatePicker.js'),
    ConsultPicker = DatePickerClass(),
    BuildPicker = DatePickerClass();

	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var selectedOneAddress;
	var selectedMultiAddress = new Array();
	var addressBookTarget;

	var pointLimit;
	var baseTotalPrice;

	var productsInfo;

	$(document).on('refreshAddressData', refreshAddressDataHandler);
	$(document).on('selectAddressData', selectAddressDataHandler);
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
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
		/*
		var orderProductArray = new Array();

		if (Cookies.getJSON('instantNFOrder') == undefined) {
			alert('잘못된 접근입니다.');
			//Cookies.remove('instantNFOrder');
			location.href='/';
		} else {
			orderProductArray = Cookies.getJSON('instantNFOrder');
			debug.log(orderProductArray);
			//Cookies.remove('instantNFOrder');
			controller.orderNewFormDepositForm(orderProductArray);
		}
		*/
		var orderProductArray = [{
			"productNumber": 1000000001,
			"productOptionNumber": 1002,
			"productQty": 1
		}];
		controller.orderNewFormDepositForm(orderProductArray);
	}

	function setElements() {
		self.selPopBtnInfo = {};

		
	}

	function setDatePicker() {
		var consultWrap = $('.js-picker');
		ConsultPicker.init({
			type : 'default',
			default : {
				wrap : consultWrap,
				picker : consultWrap.find('.js-picker'),
				altField : consultWrap.find('.js-alt'),
				button : consultWrap.find('.js-btn'),
				changeYear: true,
				changeMonth: true
			}
		});
		
		var buildWrap = $('.js-range-picker');
		BuildPicker.init({
			type : 'range',
			range : {
				from : {
					wrap : buildWrap,
					picker : buildWrap.find('.js-picker-from'),
					altField : buildWrap.find('.js-alt-from'),
					button : buildWrap.find('.js-btn-from'),
					changeYear: true,
					changeMonth: true
				},
				to : {
					wrap : buildWrap,
					picker : buildWrap.find('.js-picker-to'),
					altField : buildWrap.find('.js-alt-to'),
					button : buildWrap.find('.js-btn-to'),
					changeYear: true,
					changeMonth: true
				}
			}
		});
	}

	function setBindEvents() {
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
		//eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case ORDER_EVENT.NEWFORM_ORDER_DEPOSIT_INFO:
				var data = result.data;
				//data.paymentInfo.leftPoint = 100000;

				productsInfo = data.constProducts;
				$.map(productsInfo, function(each){
					each.productPriceDesc = util.currencyFormat(each.productPrice);
					each.discountPriceDesc = util.currencyFormat(each.discountPrice);
					each.constExpectPriceDesc = util.currencyFormat(each.constExpectPrice);
				});
				
				renderData(productsInfo, '#order-delivery-templates', '#order-delivery-wrap', true);

				setDatePicker();
				$('.js-picker').datepicker('option', 'minDate', new Date());
				$('.js-picker-from').datepicker('option', 'minDate', new Date());
				$('.js-picker-from').datepicker('option', 'maxDate', null);
				$('.js-picker-to').datepicker('option', 'minDate', new Date());
				
				refreshAddressDataHandler();
				$('.addressSelect').change(function(e){
					setAddress($(this).attr('id').substr(14), $(this).val());
				});

				var constReservation = data.constReservation;
				var tags = '';
				$.each(constReservation.dwellingForm, function(key, each){
					tags += '<li class="hType0'+(key+1)+'"><span class="radioBox"><input type="radio" value="'+each.code+'" id="hTp1'+key+'"/><label for="hTp1'+key+'">'+each.codeName+'</label></span></li>';  // <li class="">
				});
				$('.homeType').html(tags);
				tags = '';
				$.each(constReservation.dwellingPyeong, function(key, each){
					tags += '<li><span class="radioBox"><input type="radio" value="'+each.code+'" id="hTp2'+key+'"/><label for="hTp2'+key+'">'+each.codeName+'</label></span></li>';
				});
				$('.homeSize').html(tags);
				tags = '';
				$.each(constReservation.remodelingReason, function(key, each){
					tags += '<li><span class="radioBox"><input type="radio" value="'+each.code+'" id="hTp3'+key+'"/><label for="hTp3'+key+'">'+each.codeName+'</label></span></li>';
				});
				$('.homeReason').html(tags);

				$('.agreeCont').html(constReservation.constOrderTerms[0].termsContents);
				
				var paymentInfo = data.constPaymentInfo.paymentPrice;
				paymentInfo.totalAdvancePriceDesc = util.currencyFormat(paymentInfo.totalAdvancePrice);
				
				$('.totalProductPrice').text(util.currencyFormat(paymentInfo.totalProductPrice));
				$('.totalConstExpectPriceDesc').text(util.currencyFormat(paymentInfo.totalConstExpectPrice));
				$('.savingPoint').text(util.currencyFormat(paymentInfo.savingPoint));
				$('.basePrice').text(paymentInfo.totalAdvancePriceDesc);
				$('.basicDiscount').text(util.currencyFormat(paymentInfo.totalDiscountPrice));
				//$('.usedPoint').text('0');
				$('.handlingPrice').text('0');
				$('.totalPrice').text(paymentInfo.totalAdvancePriceDesc);

				var cardSelectTag = '<option value="" label="카드 선택" selected="selected">카드 선택</option>';
				for (var key in data.listCards) {
					var eachCard = data.listCards[key];
					cardSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.cardCompanyName+'">'+eachCard.cardCompanyName+'</option>';
				}
				$('#cardSelect').html(cardSelectTag);

				$('.radioBtn').click(function(e){
					$('#PayMethod').val($('.payRadio.on').attr('id').substr(3));
				});
/*
				$('#MID').val(data.pgInfo.mid);
				$("#MallIP").val(data.pgInfo.mallIp);
				$("#UserIP").val(data.pgInfo.userIp);
				$("#EdiDate").val(data.pgInfo.ediDate);
				$("#VbankExpDate").val(data.pgInfo.vbankExpDate);
				
				$('#GoodsName').val(data.products[0].productName);
				$('#Amt').val(baseTotalPrice);
				$('#Moid').val(data.orderNumber);
				$('#GoodsCnt').val(data.products.length);
				
				$('#PayMethod').val('CARD'); // CARD / BANK / VBANK
				$('#SelectCardCode').val(''); // 카드번호
				$('#SelectQuota').val('00'); // 할부개월수
				$('#products').val(''); // 상품요약전문 (상품번호|주문옵션번호|수량|주소순번|배송요청메모) 

				$('.requestPaymentButton').click(getHashString);*/
				break;
		}
	};

	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();
		//debug.log(loginData);
		if (loginData.phone != null) {
			//
		} else {
			alert('본인인증이 필요한 페이지입니다.');
			location.href='/';
		}
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};

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

		if (addressNum == '1') {
			// 단일배송지
			selectedOneAddress = seq;
		} else {
			// 복수배송지
			var orderOrder = Number(addressNum.split('-')[1]);
			selectedMultiAddress[orderOrder] = seq;
		}
	};

	function selectAddressDataHandler(e, seq) {
		debug.log(addressBookTarget, seq);
		setAddress(addressBookTarget, seq);
		$('#addressSelect-'+addressBookTarget).val(seq);
	};
};