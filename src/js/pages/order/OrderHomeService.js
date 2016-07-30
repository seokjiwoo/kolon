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
	CARD_LIST_EVENT = events.CARD_LIST,
	ORDER_EVENT = events.ORDER;

	var orderNumber;
	var baseTotalPrice;

	var productsInfo;
	
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

	return callerObj;
	
	function init() {
		Super.init();
		
		self = callerObj;
		
		setElements();
		setBindEvents();

		orderNumber = util.getUrlVar().orderNumber;

		if (orderNumber == undefined) {
			alert('잘못된 접근입니다.');
			location.href='/';
		} else {
			controller.homeServiceOrderForm(orderNumber);
		}
	}

	function setElements() {
		self.selPopBtnInfo = {};
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
			case ORDER_EVENT.HOMESERVICE_ORDER_INFO:
				if (result.status == 400 || result.status == 406) {
					alert(result.message);
					history.back(-1);
					return;
				}
				var data = result.common.data;

				data.washServiceDetail.priceDesc = util.currencyFormat(data.washServiceDetail.price);
				data.washServiceDetail.requestTargetContact = util.mobileNumberFormat(data.washServiceDetail.requestTargetContact);

				renderData(data, '#order-homeService-templates', '#order-homeService-wrap', true);

				orderNumber = data.orderNumber;

				$('.totalPrice').text(data.washServiceDetail.priceDesc);

				var cardSelectTag = '<option value="" label="카드 선택" selected="selected">카드 선택</option>';
				for (var key in data.cards) {
					var eachCard = data.cards[key];
					cardSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.cardCompanyName+'">'+eachCard.cardCompanyName+'</option>';
				}
				$('#cardSelect').html(cardSelectTag);

				if (data.washServiceDetail.price < 50000) $('#quotaSelect').attr('disabled', 'disabled');

				$('.radioBox label').on('click', function(e){
					$(this).addClass('on').parent().parent().siblings('li').find('label').removeClass('on');
				});
				$('.radioBtn').click(function(e){
					$('#PayMethod').val($('.payRadio.on').attr('id').substr(3));
				});

				$('#MID').val(data.pgInfo.mid);
				$("#MallIP").val(data.pgInfo.mallIp);
				$("#UserIP").val(data.pgInfo.userIp);
				$("#EdiDate").val(data.pgInfo.ediDate);
				$("#VbankExpDate").val(data.pgInfo.vbankExpDate);
				
				$('#GoodsName').val(data.washServiceDetail.companyName);
				$('#Amt').val(data.washServiceDetail.price);
				$('#Moid').val(orderNumber);
				$('#GoodsCnt').val(1);
				
				$('#PayMethod').val('CARD'); // CARD / BANK / VBANK
				$('#SelectCardCode').val(''); // 카드번호
				$('#SelectQuota').val('00'); // 할부개월수

				$('.requestPaymentButton').click(getHashString);

				if (!util.isIe()) $('#payBANK').remove();
				eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
				break;
		}
	};

	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();
		$('#BuyerName').val(loginData.memberName);
		if (loginData.phone != null) {
			$('#BuyerTel').val(loginData.phone);
			if (loginData.email != null) $('#BuyerEmail').val(loginData.email);
		} else {
			alert('본인인증이 필요한 페이지입니다.');
			location.href='/';
		}
	};

	function getHashString(e) {
		var paymentPrice = Number($('#Amt').pVal());

		switch($('#PayMethod').pVal()) {
			case 'CARD':
				if ($('#cardSelect').pVal() == '') {
					alert('카드를 지정해 주세요.');
					return;
				}
				if ($('#SelectQuota').pVal() == '') {
					alert('할부개월수를 지정해 주세요.');
					return;
				}
				$('#SelectCardCode').val($('#cardSelect').pVal()); 	// 카드회사 번호
				$('#SelectQuota').val($('#quotaSelect').pVal()); 	// 할부개월수
				break;
		}

		jQuery.ajax({
			type: "GET",
			url: "/apis/living/order/getHashString/"+orderNumber+"?ediDate="+$("#EdiDate").pVal()+"&price="+paymentPrice,
			success : function(data) {
				$("#EncryptData").val(data.data.hash_String);
				$("#Moid").val(data.data.orderNumber);
			},
			complete : function(data) {
				goPay(document.payForm);
			},
			error : function(xhr, status, error) {
				Super.Super.alertPopup('결재에 실패하였습니다', status+': '+error, '확인');
			}
		});
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};