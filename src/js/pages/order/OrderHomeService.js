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
				var data = result.common.data;

				data.washServiceDetail.priceDesc = util.currencyFormat(data.washServiceDetail.price);
/*
				productsInfo = data.constProducts;
				$.map(productsInfo, function(each){
					each.productPriceDesc = util.currencyFormat(each.productPrice);
					each.discountPriceDesc = util.currencyFormat(each.discountPrice);
					each.constExpectPriceDesc = util.currencyFormat(each.constExpectPrice);
				});
*/				
				renderData(data, '#order-homeService-templates', '#order-homeService-wrap', true);

				/*
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
*/
				var cardSelectTag = '<option value="" label="카드 선택" selected="selected">카드 선택</option>';
				for (var key in data.listCards) {
					var eachCard = data.listCards[key];
					cardSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.cardCompanyName+'">'+eachCard.cardCompanyName+'</option>';
				}
				$('#cardSelect').html(cardSelectTag);

				//if (paymentInfo.totalAdvancePrice < 50000) $('#quotaSelect').attr('disabled', 'disabled');

				$('.radioBtn').click(function(e){
					$('#PayMethod').val($('.payRadio.on').attr('id').substr(3));
				});
		
				$('#MID').val(data.pgInfo.mid);
				$("#MallIP").val(data.pgInfo.mallIp);
				$("#UserIP").val(data.pgInfo.userIp);
				$("#EdiDate").val(data.pgInfo.ediDate);
				$("#VbankExpDate").val(data.pgInfo.vbankExpDate);
				
				$('#GoodsName').val(productsInfo[0].productName);
				//$('#Amt').val(paymentInfo.totalAdvancePrice);
				$('#Moid').val(data.orderNumber);
				$('#GoodsCnt').val(productsInfo.length);
				
				$('#PayMethod').val('CARD'); // CARD / BANK / VBANK
				$('#SelectCardCode').val(''); // 카드번호
				$('#SelectQuota').val('00'); // 할부개월수
				$('#products').val(''); // 상품요약전문 (상품번호|주문옵션번호|수량|주소순번|배송요청메모) 

				$('.requestPaymentButton').click(getHashString);

				if (!util.isIe()) $('#payBANK').remove();
				eventManager.triggerHandler(CARD_LIST_EVENT.APPENDED);
				break;
		}
	};

	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();
		
		if (loginData.phone != null) {
		} else {
			alert('본인인증이 필요한 페이지입니다.');
			location.href='/';
		}
	};

	function getHashString(e) {
		var paymentPrice = Number($('#Amt').val());

		var productsArray = new Array();
		for (var key in productsInfo) {
			var product = productsInfo[key];
			var eachOrderArray = new Array(
				product.productNumber,
				product.productOptionNumber
			);
			productsArray.push(eachOrderArray.join('|'));
		}
		
		$('#products').val(productsArray.join(','));
		$('#wishSurveyDate').val(moment($('.js-picker-visit').datepicker('getDate')).format('YYYYMMDD'));
		$('#wishSurveyHour').val($('#visitTimeSelector').val());
		$('#wishConstBeginDate').val(moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'));
		$('#wishConstEndDate').val(moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'));
		$('#addressSequence').val(selectedOneAddress);
		$('#dwellingFormCode').val($('input[name="hTp1"]:checked').val());
		$('#dwellingPyeongCode').val($('input[name="hTp2"]:checked').val());
		$('#remodelingReasonCode').val($('input[name="hTp3"]:checked').val());
		$('#remodelingReasonEtc').val(encodeURI($('#homeReasonEtcField').val()));
		$('#addRequestContents').val(encodeURI($('#requestField').val()));
	
		switch($('#PayMethod').val()) {
			case 'CARD':
				if ($('#cardSelect').val() == '') {
					alert('카드를 지정해 주세요.');
					return;
				}
				if ($('#SelectQuota').val() == '') {
					alert('할부개월수를 지정해 주세요.');
					return;
				}
				$('#SelectCardCode').val($('#cardSelect').val()); 	// 카드회사 번호
				$('#SelectQuota').val($('#quotaSelect').val()); 	// 할부개월수
				break;
		}

		jQuery.ajax({
			type: "GET",
			url: "/apis/constorders/getHashString?ediDate="+$("#EdiDate").val()+"&price="+paymentPrice,
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