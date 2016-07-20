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
		
		debug.log(fileName, $, util, controller, eventManager, events, COLORBOX_EVENT);

		self = callerObj;
		self.opts = opts;
		
		setElements();
		setBindEvents();
		
		var orderProductArray = new Array();

		if (Cookies.getJSON('instantOrder') == undefined) {
			alert('잘못된 접근입니다.');
			//Cookies.remove('instantOrder');
			location.href='/';
		} else {
			orderProductArray = Cookies.getJSON('instantOrder');
			debug.log(orderProductArray);
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
				var data = result.common.data;
				data.paymentInfo.leftPoint = 10000;

				productsInfo = data.products;
				baseTotalPrice = Number(data.paymentInfo.totalPaymentPrice);
				pointLimit = Number(data.paymentInfo.leftPoint);
				
				var totalDeliveryCharge = 0;
				$.each(data.products, function(key, value) {
					//data.paymentInfo[key+'Desc'] = util.currencyFormat(value);
					totalDeliveryCharge += value.deliveryCharge;
				});
				$.each(data.paymentInfo, function(key, value) {
					data.paymentInfo[key+'Desc'] = util.currencyFormat(value);
				});
				debug.log(data);

				displayData(data);
				if (data.products.length == 1) {
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
					debug.log($(this).attr('id').substr(12));
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
						if (newValue > baseTotalPrice) {
							newValue = baseTotalPrice;
							$('#pointWt').val(newValue);
						}
						$('.usedPoint').text(util.currencyFormat(newValue));
						$('.totalPrice').text(util.currencyFormat(baseTotalPrice-newValue));
					}
					$('#usingPoint').val($('#pointWt').val());
					$('#Amt').val(baseTotalPrice-newValue);
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
					$('#usingPoint').val($('#pointWt').val());
					$('#Amt').val(baseTotalPrice-pointLimit);
				});

				$('.basePrice').text(util.currencyFormat(data.paymentInfo.totalPaymentPrice-totalDeliveryCharge));
				$('.basicDiscount').text(data.paymentInfo.totalDiscountPriceDesc);
				$('.usedPoint').text('0');
				$('.handlingPrice').text(util.currencyFormat(totalDeliveryCharge));
				$('.totalPrice').text(data.paymentInfo.totalPaymentPriceDesc);

				var cardSelectTag = '<option value="" label="카드 선택" selected="selected">카드 선택</option>';
				for (var key in data.cards) {
					var eachCard = data.cards[key];
					cardSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.cardCompanyName+'">'+eachCard.cardCompanyName+'</option>';
				}
				$('#cardSelect').html(cardSelectTag);

				/* var bankSelectTag = '<option value="" label="은행 선택" selected="selected">은행 선택</option>';
				for (var key in data.banks) {
					var eachCard = data.banks[key];
					bankSelectTag += '<option value="'+eachCard.code+'" label="'+eachCard.bankName+'">'+eachCard.bankName+'</option>';
				}
				$('#bankSelect').html(bankSelectTag); */

				$('.radioBtn').click(function(e){
					$('#PayMethod').val($('.payRadio.on').attr('id').substr(3));
				});

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

				$('.requestPaymentButton').click(getHashString);
				break;
		}
	}

	function myInfoResultHandler(e) {
		loginData = loginDataModel.loginData();
		debug.log(loginData);
		$('#BuyerName').val(loginData.memberName);
		if (loginData.phone != null) {
			$('#BuyerTel').val(loginData.phone);
		} else {
			alert('본인인증이 필요한 페이지입니다.');
			//Cookies.remove('instantOrder');
			location.href='/';
		}
	};

	function getHashString(e) {
		if (!$('#agree01cb').hasClass('on')) {
			alert('개인정보 제 3자 제공에 동의해 주세요.');
			return;
		}
		var usingPoint = parseInt($("#usingPoint").val());
		if (isNaN(usingPoint)) usingPoint = 0;
		var paymentPrice = baseTotalPrice - usingPoint;

		var productsArray = new Array();
		for (var key in productsInfo) {
			var product = productsInfo[key];
			var eachOrderArray = new Array(
				product.productNumber,
				product.orderOptionNum,
				product.quantity,
				($('#delivery1').is(':visible') ? selectedOneAddress : selectedMultiAddress[key]),
				encodeURI( $('#messageField-'+(Number(key)+1)).val() )
			);
			if (!eachOrderArray[3]) {
				alert('배송지를 지정해 주세요.');
				return;
			}
			productsArray.push(eachOrderArray.join('|'));
		}
		
		$('#products').val(productsArray.join(','));
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
		$("#Amt").val(paymentPrice);

		jQuery.ajax({
			type: "GET",
			url: "/apis/orders/getHashString?ediDate="+$("#EdiDate").val()+"&price="+paymentPrice,
			success : function(data) {
				$("#EncryptData").val(data.data.hash_String);
			},
			complete : function(data) {
				goPay(document.payForm);
			},
			error : function(xhr, status, error) {
				Super.Super.alertPopup('결재에 실패하였습니다', status+': '+error, '확인');
			}
		});
	};

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
	};

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
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