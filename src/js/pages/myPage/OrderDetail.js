/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/OrderDetail.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/OrderController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	ORDER_EVENT = events.ORDER,
	DROPDOWNMENU_EVENT = events.DROPDOWN_MENU,
	HTMLPOPUP_EVENT = events.HTML_POPUP;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-order-detail-wrap',
			template : '#order-detail-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util, controller, eventManager, events, COLORBOX_EVENT);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		self.orderNumber = util.getUrlVar().orderNumber;

		if (!self.orderNumber) {
			win.alert('유효하지 않은 접근입니다.');
			location.href = '/';
			return;
		}

		controller.orderDetail(util.getUrlVar().orderNumber);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};

		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(controller).on(ORDER_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		$('.dropChk').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);

		self.templatesWrap.on('click', '.js-btn', onWrapPopBtnClick);
	}

	function onWrapPopBtnClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		info = target.data('order-info');

		self.selPopBtnInfo = {
			target : target,
			info : info
		};

		if (target.hasClass('js-order-cancel')) {
			var list = $('[data-chk-group=\'orderDetail\']').not('[data-chk-role=\'chkAll\']').filter('.on'),
			deleteList = [];

			$.each(list, function() {
				deleteList.push($(this).data('order-number'));
			});

			if (!deleteList.length) {
				return;
			}

			// 주문 취소 신청 처리
			// controller.orderCancel(deleteList, '', '');

			eventManager.trigger(HTMLPOPUP_EVENT.OPEN, [
				'../../_popup/popOrderCancelRequest.html',
				895,
				'popEdge',
				{
					onOpen: function() {
						controller.orderDetail(deleteList, 'COLOR_BOX');
					}
				}
			]);

		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, type) {
		var _template = self.template,
		_templatesWrap = self.templatesWrap;

		if (type === 'COLOR_BOX') {
			_template = self.colorbox.find('#cancel-request-templates');
			_templatesWrap =  self.colorbox.find('.js-cancelRequest-wrap');
		}
		
		var source = _template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		_templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		_templatesWrap.imagesLoaded()
							.always(function() {
								_templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
							});

		if (type === 'COLOR_BOX') {
			self.colorbox.find('form').on('submit', function(e) {e.preventDefault();});
			self.colorbox.find('.js-cancel-submit').on('click', function(e) {
				e.preventDefault();

				var forms = self.colorbox.find('.js-cancel-form'),
				isValid = false,
				cancelType, cancelReson;

				$.each(forms, function() {
					cancelType = $(this).find('.js-type').val();
					cancelReson = $(this).find('.js-inp').val();
					if (cancelType && cancelReson) {
						isValid = true;
					} else {
						isValid = false;
						return false;
					}
				});

				if (!isValid) {
					win.alert('취소 사유를 선택/입력 해주세요.');
					return;
				}

				$.each(forms, function() {
					cancelType = $(this).find('.js-type').val();
					cancelReson = $(this).find('.js-inp').val();

					controller.orderCancel(
						self.selPopBtnInfo.info.orderNumber,
						{
							"accountAuthDatetime": "2016-04-01",
							"accountAuthYn": "Y",
							"addDeliveryChargeTotal": 0,
							"claimDeliveryChargeTotal": 0,
							"claimReasonCode": cancelType,
							"claimReasonStatement": "string",
							"claimTypeCode": "string",
							"orderNumber": 0,
							"refundAccountNumber": 0,
							"refundBankCode": "string",
							"refundDepositorName": cancelReson
						},
						[
							{
								"addDeliveryCharge": 0,
								"claimDeliveryCharge": 0,
								"claimNumber": 0,
								"claimProcessDatetime": "string",
								"claimProcessQuantity": 0,
								"claimProductAmount": 0,
								"claimRequestQuantity": 0,
								"claimStateCode": "string",
								"claimStateReason": "string",
								"deliveryChargePaymentCode": "string",
								"orderNumber": 0,
								"orderProductSequence": "string"
							}
						]
					);
				});
			});
		}
	}

	function setColoboxEvevnts() {
		if (self.colorbox.hasClass('popOrderCancelRequest')) {
		}
	}

	function destroyColoboxEvevnts() {
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				setColoboxEvevnts();
				break;
			case COLORBOX_EVENT.CLEANUP:
				destroyColoboxEvevnts();
				break;
		}
	}

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.val(), data);
	}

	function onControllerListener(e, status, response, type) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case ORDER_EVENT.ORDER_DETAIL:
				if (result && !result.data) {
					displayData([], type);
					return;
				}
				var orderData = result.data;

				orderData.orderDate = moment(orderData.listOrderItem[0].orderDateTime).format('YYYY. MM. DD');
				orderData.orderNumber = orderData.listOrderItem[0].orderNumber;

				orderData.ordererInfo.cellPhoneNumber = util.mobileNumberFormat(orderData.ordererInfo.cellPhoneNumber);

				if (orderData.paymentInfo.slCreditCard != null) {
					orderData.paymentInfo.method = '신용카드';
				} else if (orderData.paymentInfo.slDwb != null) {
					orderData.paymentInfo.method = '무통장 입금';
				} else if (orderData.paymentInfo.slAccountTransfer != null) {
					orderData.paymentInfo.method = '실시간 계좌이체';
				}
				orderData.paymentInfo.totalPaymentPriceDesc = util.currencyFormat(Number(orderData.paymentInfo.totalPaymentPrice));
				orderData.paymentInfo.deliveryChargeDesc = util.currencyFormat(Number(orderData.paymentInfo.deliveryCharge));
				orderData.paymentInfo.orderPriceDesc = util.currencyFormat(Number(orderData.paymentInfo.orderPrice));
				orderData.paymentInfo.discountPriceDesc = util.currencyFormat(Number(orderData.paymentInfo.discountPriceDesc));

				if (orderData.listOrderItem) {
					$.each(orderData.listOrderItem, function(index, listOrderItem) {
						listOrderItem.itemPriceDesc = util.currencyFormat(Number(listOrderItem.itemPrice));
						listOrderItem.discountPriceDesc = util.currencyFormat(Number(listOrderItem.discountPrice));
						listOrderItem.deliveryFreeDesc = util.currencyFormat(Number(listOrderItem.deliveryFree));
					});
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(orderData, type);

				$('.moreView').hide();
				$('.btnIcoMore').click(function(e) {
					e.preventDefault();
					var tableId = $(this).attr('id').substr(8);
					$(this).toggleClass('active');
					$('#moreTable'+tableId).slideToggle();
				});
				break;

			case ORDER_EVENT.ORDER_CANCEL:
				switch(status) {
					case 200:
						win.alert('취소 신청이 완료되었습니다.');
						location.reload();
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				break;
		}
	}
};