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

		$('.dropChk').on(DROPDOWNMENU_EVENT.CHANGE, onDropCheckMenuChange);

		self.templatesWrap.on('click', '.js-btn', onWrapPopBtnClick);
	}

	function onWrapPopBtnClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		info = target.closest('[data-order-info]').data('order-info');

		self.selPopBtnInfo = {
			target : target,
			info : info
		};

		if (target.hasClass('js-order-cancel')) {
			var list = $('[data-chk-group=\'orderDetail\']').not('[data-chk-role=\'chkAll\']').filter('.on');
			var cancelRequestMessage = '';

			$.each(list, function() {
				cancelRequestMessage += ($(this).data().productNumber+'|'+$(this).data().optionNumber+',');
			});
			
			if (cancelRequestMessage == '') {
				return;
			}

			MyPage.Super.Super.htmlPopup('/_popup/popOrderCancelRequest.html', '100%', 'popEdge', {
				onOpen: function() {
					controller.cancelDetail(self.selPopBtnInfo.info.orderNumber, cancelRequestMessage);
				}
			});
		}

		if (target.hasClass('js-order-cancel-all')) {
			MyPage.Super.Super.htmlPopup('/_popup/popOrderCancelRequest.html', '100%', 'popEdge', {
				onOpen: function() {
					if (self.selPopBtnInfo.info.joinedOrder == "1") {
						controller.cancelDetail(self.selPopBtnInfo.info.orderNumber, self.selPopBtnInfo.info.productNumber+'|'+self.selPopBtnInfo.info.orderOptionNumber);
					} else {
						var cancelRequestMessage = '';
						$.each($('[data-order-info]'), function(key, each){
							var eachInfo = $(each).data('order-info');
							if (self.selPopBtnInfo.info.orderNumber == eachInfo.orderNumber) {
								cancelRequestMessage += (eachInfo.productNumber+'|'+eachInfo.orderOptionNumber+',');
							} 
						});
						controller.cancelDetail(self.selPopBtnInfo.info.orderNumber, cancelRequestMessage);
					}
				}
			});
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data, type) {
		var _template = self.template,
		_templatesWrap = self.templatesWrap;

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

								$('.btnToggle').on('click', function(e) {
									e.preventDefault();

									$(this).toggleClass('open');
									$(this).siblings('.slideCon').slideToggle();
								});
							});
	}

	function onDropCheckMenuChange(e, data) {
		var target = $(e.target);

		debug.log(fileName, 'onDropCheckMenuChange', target, target.pVal(), data);
	}
	function displayCancelPopup(data, type) {
		var _template = self.colorbox.find('#cancel-request-templates');
		var _templatesWrap = self.colorbox.find('.js-cancelRequest-wrap');

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
		
		var cancelOrderDataArray = new Array();
		$.each(data.product, function(key, each){
			cancelOrderDataArray.push(new Array(each.productNumber, each.orderOptionNumber));
		});

		self.colorbox.find('form').on('submit', function(e) {e.preventDefault();});
		self.colorbox.find('#js-order-cancel-form').on('submit', function(e) {
			e.preventDefault();

			var isValid = true,
			cancelType, cancelReson;

			$.each($('.cancelReasonDrop'), function(key, each){
				cancelOrderDataArray[key].push($(each).pVal());
				if (!$(each).pVal()) isValid = false;
			});
			$.each($('.cancelReasonField'), function(key, each){
				cancelOrderDataArray[key].push(encodeURI($(each).pVal()));
				if (!$(each).pVal()) isValid = false;
			});
			
			if (!isValid) {
				win.alert('취소 사유를 선택/입력 해주세요.');
				return;
			}
			
			var cancelOrderArray = new Array();
			$.map(cancelOrderDataArray, function(each) {
				cancelOrderArray.push(each.join('|'));
			});

			var cancelOrder = cancelOrderArray.join(',');
			
			controller.orderCancel(self.selPopBtnInfo.info.orderNumber, cancelOrder);
		});
	};

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
				
			
			case ORDER_EVENT.CANCEL_DETAIL:
				displayCancelPopup(result.data, type);
				$(document).trigger('initProfileEditButton');
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
				break;
		}
	}
};