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
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var selectedOneAddress;
	var selectedMultiAddress = new Array();
	var addressBookTarget;

	var pointLimit;
	var baseTotalPrice;
	var usePoint;
	var paymentPrice;

	var productsInfo;

	$(document).on('refreshAddressData', refreshAddressDataHandler);
	$(document).on('selectAddressData', selectAddressDataHandler);
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');
	var loginData;

	var orderNumber;
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
		var orderProductArray = new Array();

		if (orderNumber == undefined) {
			alert('잘못된 접근입니다.');
			location.href='/';
		} else {
			controller.orderNewFormBalanceForm(orderNumber);
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
			case ORDER_EVENT.NEWFORM_ORDER_BALANCE_INFO:
				if (result.status == 400 || result.status == 406) {
					alert(result.message);
					history.back(-1);
					return;
				}
				var data = result.data;
				
				var paymentInfo = data.balancePayment.balancePaymentPrice;
				//paymentInfo.leftPoint = 100000;
				
				baseTotalPrice = Number(paymentInfo.totalPaymentPrice);
				pointLimit = Number(paymentInfo.leftPoint) || 0;

				productsInfo = data.constProducts;
				$.map(productsInfo, function(each){
					each.productPriceDesc = util.currencyFormat(each.productPrice);
					each.discountPriceDesc = util.currencyFormat(each.discountPrice);
					each.constExpectPriceDesc = util.currencyFormat(each.constExpectPrice);
				});
				
				renderData(productsInfo, '#order-product-templates', '#order-product-wrap', true);

				var orderConfirmInfo = data.constOrderConfirm;
				orderConfirmInfo.estimatePriceDesc = util.currencyFormat(orderConfirmInfo.estimatePrice);
				orderConfirmInfo.surveyPriceDesc = util.currencyFormat(orderConfirmInfo.surveyPrice);
				$.map(orderConfirmInfo.constEstimateItems, function(each){
					each.itemPriceDesc = util.currencyFormat(each.itemPrice);
				});

				renderData(orderConfirmInfo, '#order-estimate-templates', '#order-estimate-wrap', true);
				renderData(orderConfirmInfo, '#order-estimate-items-templates', '#order-estimate-items-wrap', true);
				
				paymentInfo.estimatePriceDesc = util.currencyFormat(paymentInfo.estimatePrice);
				paymentInfo.advancePriceDesc = util.currencyFormat(paymentInfo.advancePrice);
				paymentInfo.installmentPriceDesc = util.currencyFormat(paymentInfo.installmentPrice);
				paymentInfo.totalPaymentPriceDesc = util.currencyFormat(paymentInfo.totalPaymentPrice);

				renderData(paymentInfo, '#order-payment-templates', '#order-payment-wrap', true);

				$('.totalProductPrice').text(util.currencyFormat(paymentInfo.totalProductPrice));
				$('.totalConstExpectPriceDesc').text(util.currencyFormat(paymentInfo.totalConstExpectPrice));

				$('.savingPoint').text(util.currencyFormat(paymentInfo.savingPoint));
				$('.basePrice').text(paymentInfo.totalPaymentPriceDesc);
				$('.basicDiscount').text(util.currencyFormat(paymentInfo.totalDiscountPrice));
				$('.usedPoint').text('0');
				$('.handlingPrice').text('0');
				$('.totalPrice').text(paymentInfo.totalPaymentPriceDesc);

				if (pointLimit < 5000) {
					$('#pointCk01').attr('disabled', 'disabled');
					$('#pointWt').attr('disabled', 'disabled');
				}
				$('#pointWt').change(reCalculatePointUse);
				$('#useAllPointCheck').click(function(e){
					if (!$('#pointCk01').prop('checked')) {
						$('#pointLb01').addClass('on');
						$('#pointWt').val(pointLimit);
					} else {
						$('#pointLb01').removeClass('on');
						$('#pointWt').val('');
					}
					reCalculatePointUse();
				});

				reCalculatePointUse();

				var cardSelectTag = '<option value="" label="카드 선택" selected="selected">카드 선택</option>';
				for (var key in data.listCards) {
					var eachCard = data.listCards[key];
					cardSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.cardCompanyName+'">'+eachCard.cardCompanyName+'</option>';
				}
				$('#cardSelect').html(cardSelectTag);

				$('.radioBtn').click(function(e){
					$('#PayMethod').val($('.payRadio.on').attr('id').substr(3));
				});
		
				$('#MID').val(data.pgInfo.mid);
				$("#MallIP").val(data.pgInfo.mallIp);
				$("#UserIP").val(data.pgInfo.userIp);
				$("#EdiDate").val(data.pgInfo.ediDate);
				$("#VbankExpDate").val(data.pgInfo.vbankExpDate);
				
				$('#GoodsName').val(productsInfo[0].productName);
				$('#Amt').val(paymentInfo.totalPaymentPrice);
				$('#Moid').val(orderNumber);
				
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

	function reCalculatePointUse() {
		usePoint = Number($('#pointWt').pVal());

		$('#pointLb01').removeClass('on');
		if (isNaN(usePoint)) usePoint = 0;
		if (usePoint < 5000) {
			if (usePoint != 0) alert('포인트는 최하 5000포인트부터 사용가능합니다.');
			usePoint = 0;
		} else if (usePoint > pointLimit) {
			alert('사용 가능한 포인트를 초과합니다. 다시 입력해주세요.');
			usePoint = 0;
		} else if (usePoint > baseTotalPrice) {
			usePoint = baseTotalPrice;
			$('#pointLb01').addClass('on');
		}
		
		$('#pointWt').val(usePoint);
		$('#usingPoint').val(usePoint);
		$('.usedPoint').text(util.currencyFormat(usePoint));
		$('.totalPrice').text(util.currencyFormat(baseTotalPrice-usePoint));		
		if (usePoint == 0) $('#pointWt').val('');

		paymentPrice = baseTotalPrice-usePoint;
		$('#Amt').val(paymentPrice);

		if (paymentPrice < 50000) {
			$('#quotaSelect').val('00');
			$('#quotaSelect').attr('disabled', 'disabled');
		} else {
			$('#quotaSelect').removeAttr('disabled');
		}
	};

	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();
		//debug.log(loginData);
		$('#BuyerName').val(loginData.memberName);
		if (loginData.phone != null) {
			$('#BuyerTel').val(loginData.phone);
			if (loginData.email != null) $('#BuyerEmail').val(loginData.email);
		} else {
			alert('본인인증이 필요한 페이지입니다.');
			//Cookies.remove('instantOrder');
			location.href='/';
		}
	};

	function getHashString(e) {
		var paymentPrice = Number($('#Amt').pVal());

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
		$('#wishSurveyHour').val($('#visitTimeSelector').pVal());
		$('#wishConstBeginDate').val(moment($('.js-picker-from').datepicker('getDate')).format('YYYYMMDD'));
		$('#wishConstEndDate').val(moment($('.js-picker-to').datepicker('getDate')).format('YYYYMMDD'));
		$('#addressSequence').val(selectedOneAddress);
		$('#dwellingFormCode').val($('input[name="hTp1"]:checked').pVal());
		$('#dwellingPyeongCode').val($('input[name="hTp2"]:checked').pVal());
		$('#remodelingReasonCode').val($('input[name="hTp3"]:checked').pVal());
		$('#remodelingReasonEtc').val(encodeURI($('#homeReasonEtcField').pVal()));
		$('#addRequestContents').val(encodeURI($('#requestField').pVal()));
	
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
			url: "/apis/constorders/getHashString?ediDate="+$("#EdiDate").pVal()+"&price="+paymentPrice+"&orderNumber="+orderNumber,
			success : function(data) {
				$("#EncryptData").val(data.data.hash_String);
			},
			complete : function(data) {
				if (paymentPrice == 0) {
					document.payForm.submit();
				} else {
					goPay(document.payForm);
				}
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
		selectedOneAddress = seq;
	};

	function selectAddressDataHandler(e, seq) {
		debug.log(addressBookTarget, seq);
		setAddress(addressBookTarget, seq);
		$('#addressSelect-'+addressBookTarget).val(seq);
	};
};