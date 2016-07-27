/* global $ */

module.exports = ClassOrderController().getInstance();

function ClassOrderController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = OrderController();
			return instance;
		}
	};
	
	function OrderController() {
		callerObj = {
			/**
			 * 장바구니 리스트
			 */
			myCartList : myCartList,
			/**
			 * 장바구니 등록
			 */
			addMyCartList : addMyCartList,
			/**
			 * 장바구니 개수 업데이트
			 */
			updateMyCartList : updateMyCartList,
			/**
			 * 장바구니 삭제
			 */
			deleteMyCartList : deleteMyCartList,
			
			/**
			 * 주문/배송 현황 조회
			 */
			myOrdersList: myOrdersList,
			/**
			 * 교환/반품/취소 조회
			 */
			myCancelList: myCancelList,
			/**
			 * 주문/배송 - 주문상세
			 */
			orderDetail: orderDetail,
			/**
			 * 취소 신청 조회 팝업
			 */
			cancelDetail: cancelDetail,
			/**
			 * 주문 취소 신청 처리
			 */
			orderCancel: orderCancel,
			/**
			 * 구매확정
			 */
			orderConfirm: orderConfirm,
			/**
			 * 교환 신청 처리
			 */
			orderExchange: orderExchange,
			/**
			 * 반품 신청 처리
			 */
			orderReturn: orderReturn,
			/**
			 * 주문/배송 - 배송추적 팝업 조회
			 */
			orderTrackingInfo: orderTrackingInfo,

			/**
			 * 교환/반품/취소 목록 조회
			 */
			myClaimsList: myClaimsList,
			/**
			 * 취소 상세 내역 / 휴대폰 결제
			 */
			claimsCell: claimsCell,
			/**
			 * 취소 상세 내역 / 신용카드 결제
			 */
			claimsCredit: claimsCredit,
			/**
			 * 취소 반려 상세 내역
			 */
			claimsDeny: claimsDeny,
			/**
			 * 취소 상세 내역 / 무통장 입금
			 */
			claimsDeposit: claimsDeposit,
			/**
			 * 교환 상세 내역
			 */
			claimsExchange: claimsExchange,
			/**
			 * 교환 반려 상세 내역
			 */
			claimsExchangeDeny: claimsExchangeDeny,
			/**
			 * 반품 상세 내역
			 */
			claimsReturn: claimsReturn,
			/**
			 * 반품 반려 상세 내역
			 */
			claimsReturnDeny: claimsReturnDeny,
			/**
			 * 배송형 주문서 작성 페이지 조회
			 */
			myOrdersInfo: myOrdersInfo,
			/**
			 * 주문완료
			 */
			ordersComplete: ordersComplete,
			ordersAdvanceComplete: ordersAdvanceComplete,
			ordersBalanceComplete: ordersBalanceComplete,
			ordersHomeServiceComplete: ordersHomeServiceComplete,
			/**
			 * hash_String 취득(EncryptData)
			 */
			ordersGetHashStr: ordersGetHashStr,
			/**
			 * 배송형 주문서 작성 페이지 처리(결제)
			 */
			ordersProcess: ordersProcess,
			/**
			 * 시공형 주문서 선결제 페이지 조회
			 */
			orderNewFormDepositForm: orderNewFormDepositForm,
			/**
			 * 시공형 주문서 잔금결제 페이지 조회
			 */
			orderNewFormBalanceForm: orderNewFormBalanceForm,

			/**
			 * 시공형 주문목록
			 */
			myConstOrdersList: myConstOrdersList,
			
			/**
			 * 생활서비스 주문서 작성 페이지 조회
			 */
			homeServiceOrderForm: homeServiceOrderForm,
		}
		
		return callerObj;	
	};
	
	/**
	 * 장바구니 리스트
	 * @param {String} productSectionCode
	 */
	function myCartList(productSectionCode) {
		Super.callApi('/apis/me/cart/' + productSectionCode, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myCartListResult', [status, result]);
			} else {
				Super.handleError('myCartList', result);
				$(callerObj).trigger('myCartListResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 장바구니 등록
	 * @param {Arrary} myCartRequestList
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/my-page-controller/createMyCartUsingPOST
	 */
	function addMyCartList(myCartRequestList, constFlag, requestedObj) {
		Super.callApi('/apis/me/cart'+(constFlag?'?constYn=Y':''), 'POST', myCartRequestList, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addMyCartListResult', [status, result, requestedObj]);
			} else {
				Super.handleError('addMyCartList', result);
				$(callerObj).trigger('addMyCartListResult', [status, result, requestedObj]);
			}
		}, false);
	}

	/**
	 * 장바구니 수량 변경
	 * @param {Arrary} myCartRequestList
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/my-page-controller/createMyCartUsingPUT
	 */
	function updateMyCartList(cartNumber, quantityRequest) {
		Super.callApi('/apis/me/cart/'+cartNumber, 'PUT', quantityRequest, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('updateMyCartListResult', [status, result]);
			} else {
				Super.handleError('updateMyCartList', result);
				$(callerObj).trigger('updateMyCartListResult', [status, result]);
			}
		}, false);
	}

	

	/**
	 * 장바구니 삭제
	 * @param  {Array} cartNumber
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/my-page-controller/removeMyCartUsingDELETE
	 */
	function deleteMyCartList(cartNumber) {
		Super.callApi('/apis/me/cart', 'DELETE', {
			'cartNumber' : cartNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('deleteMyCartListResult', [status, result]);
			} else {
				Super.handleError('deleteMyCartList', result);
				$(callerObj).trigger('deleteMyCartListResult', [status, result]);
			}
		}, false);
	};
	
	// 주문/배송 현황 조회
	function myOrdersList(startDate, endDate, keyword, deliveryStateCode) {
		Super.callApi('/apis/me/orders', 'GET', {
			'startDate' : startDate,
			'endDate' : endDate,
			'keyword' : keyword || '',
			'deliveryStateCode' : deliveryStateCode || ''
		}, function(status, result) {
			if (status == 200) {
				var deliveryChunk = {};
				$.map(result.data.listOrderItems, function(eachOrder) {
					if (eachOrder.parentDeliveryNumber != 0) eachOrder.deliveryNumber = eachOrder.parentDeliveryNumber;
					if (deliveryChunk[eachOrder.deliveryNumber] == undefined) deliveryChunk[eachOrder.deliveryNumber] = new Array();
					deliveryChunk[eachOrder.deliveryNumber].push(eachOrder);
				});
				var deliceryChunkArray = new Array();
				$.map(deliveryChunk, function(eachOrder) {
					deliceryChunkArray.push(eachOrder);
				});
				deliceryChunkArray.reverse();

				result.data.deliveryChunk = deliceryChunkArray;
				$(callerObj).trigger('myOrdersListResult', [status, result]);
			} else {
				Super.handleError('myOrdersList', result);
				$(callerObj).trigger('myOrdersListResult', [status, result]);
			}
		}, false);
	};

	// 교환/반품/취소 조회
	function myCancelList(startDate, endDate, keyword, deliveryStateCode) {
		Super.callApi('/apis/me/orders/cancel/list', 'GET', {
			'startDate' : startDate,
			'endDate' : endDate,
			'keyword' : keyword || '',
			'deliveryStateCode' : deliveryStateCode || ''
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myCancelListResult', [status, result]);
			} else {
				Super.handleError('myCancelsList', result);
				$(callerObj).trigger('myCancelListResult', [status, result]);
			}
		}, false);
	};
	
	// 주문/배송 - 주문상세
	function orderDetail(orderNumber, type) {
		Super.callApi('/apis/me/orders/'+orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				var deliveryChunk = {};
				$.map(result.data.listOrderItem, function(eachOrder) {
					if (eachOrder.parentDeliveryNumber != 0) eachOrder.deliveryNumber = eachOrder.parentDeliveryNumber;
					if (deliveryChunk[eachOrder.deliveryNumber] == undefined) deliveryChunk[eachOrder.deliveryNumber] = new Array();
					deliveryChunk[eachOrder.deliveryNumber].push(eachOrder);
				});
				var deliceryChunkArray = new Array();
				$.map(deliveryChunk, function(eachOrder) {
					deliceryChunkArray.push(eachOrder);
				});
				deliceryChunkArray.reverse();

				result.data.deliveryChunk = deliceryChunkArray;
				$(callerObj).trigger('orderDetailResult', [status, result, type]);
			} else {
				Super.handleError('orderDetail', result);
				$(callerObj).trigger('orderDetailResult', [status, result, type]);
			}
		}, false);
	};

	// 취소 신청 조회 팝업
	// cancelList / productNumber|optionNumber 순으로 입력 
	// 복수개일경우 , (콤마)로 구분
	// ex: 2|3,5|6 
	// 5|6
	function cancelDetail(orderNumber, cancelList) {
		Super.callApi('/apis/me/orders/' + orderNumber + '/cancel', 'GET', {
			'cancelList' : cancelList
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('cancelDetailResult', [status, result]);
			} else {
				Super.handleError('cancelDetail', result);
				$(callerObj).trigger('cancelDetailResult', [status, result]);
			}
		}, false);
	};

	// 주문 취소 신청 처리
	// POST /apis/me/orders/{orderNumber}/cancel
	function orderCancel(orderNumber, claim, items) {
		Super.callApi('/apis/me/orders/'+orderNumber + '/cancel', 'POST', {
			'claim' : claim,
			'items' : items
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderCancelResult', [status, result]);
			} else {
				Super.handleError('orderCancel', result);
				$(callerObj).trigger('orderCancelResult', [status, result]);
			}
		}, false);
	};

	// 구매확정
	function orderConfirm(orderNumber, productNumber, optionNumber) {
		Super.callApi('/apis/me/orders/'+orderNumber+'/confirm/?productNumber='+productNumber+'&orderOptionNumber='+optionNumber, 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderConfirmResult', [status, result]);
			} else {
				Super.handleError('orderConfirm', result);
				$(callerObj).trigger('orderConfirmResult', [status, result]);
			}
		}, false);
	};

	// 교환 신청 처리
	function orderExchange(orderNumber, claim, items) {
		Super.callApi('/apis/me/orders/' + orderNumber + '/exchange', 'POST', {
			'claim' : claim,
			'items' : items
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderExchangeResult', [status, result]);
			} else {
				Super.handleError('orderExchange', result);
				$(callerObj).trigger('orderExchangeResult', [status, result]);
			}
		}, false);
	};

	// 반품 신청 처리
	function orderReturn(orderNumber, claim, items) {
		Super.callApi('/apis/me/orders/' + orderNumber + '/return', 'POST', {
			'claim' : claim,
			'items' : items
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderReturnResult', [status, result]);
			} else {
				Super.handleError('orderReturn', result);
				$(callerObj).trigger('orderReturnResult', [status, result]);
			}
		}, false);
	};


	// 주문/배송 - 배송추적 팝업 조회
	function orderTrackingInfo(orderNumber, deliveryNumber) {
		Super.callApi('/apis/me/orders/' + orderNumber + '/tracking', 'GET', {
			'deliveryNumber' : deliveryNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderTrackingInfoResult', [status, result]);
			} else {
				Super.handleError('orderTrackingInfo', result);
				$(callerObj).trigger('orderTrackingInfoResult', [status, result]);
			}
		}, false);
	};


	// 교환/반품/취소 목록 조회
	function myClaimsList(startDate, endDate, keyword, deliveryStateCode) {
		Super.callApi('/apis/me/orders/cancel/list', 'GET', {
			'startDate' : startDate,
			'endDate' : endDate,
			'keyword' : keyword || '',
			'deliveryStateCode' : deliveryStateCode || ''
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myClaimsListResult', [status, result]);
			} else {
				Super.handleError('myClaimsList', result);
				$(callerObj).trigger('myClaimsListResult', [status, result]);
			}
		}, false);
	};

	// 취소 상세 내역 / 휴대폰 결제
	function claimsCell(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/cancelCell', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsCellResult', [status, result]);
			} else {
				Super.handleError('claimsCell', result);
				$(callerObj).trigger('claimsCellResult', [status, result]);
			}
		}, false);
	};

	// 취소 상세 내역 / 휴대폰 결제
	function claimsCredit(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/cancelCredit', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsCreditResult', [status, result]);
			} else {
				Super.handleError('claimsCredit', result);
				$(callerObj).trigger('claimsCreditResult', [status, result]);
			}
		}, false);
	};

	// 취소 반려 상세 내역
	function claimsDeny(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/cancelDeny', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsDenyResult', [status, result]);
			} else {
				Super.handleError('claimsDeny', result);
				$(callerObj).trigger('claimsDenyResult', [status, result]);
			}
		}, false);
	};

	// 취소 상세 내역 / 무통장 입금
	function claimsDeposit(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/cancelDeposit', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsDepositResult', [status, result]);
			} else {
				Super.handleError('claimsDeposit', result);
				$(callerObj).trigger('claimsDepositResult', [status, result]);
			}
		}, false);
	};

	// 교환 상세 내역
	function claimsExchange(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/exchange', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsExchangeResult', [status, result]);
			} else {
				Super.handleError('claimsExchange', result);
				$(callerObj).trigger('claimsExchangeResult', [status, result]);
			}
		}, false);
	};

	// 교환 반려 상세 내역
	function claimsExchangeDeny(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/exchangeDeny', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsExchangeDenyResult', [status, result]);
			} else {
				Super.handleError('claimsExchangeDeny', result);
				$(callerObj).trigger('claimsExchangeDenyResult', [status, result]);
			}
		}, false);
	};

	// 반품 상세 내역
	function claimsReturn(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/return', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsReturnResult', [status, result]);
			} else {
				Super.handleError('claimsReturn', result);
				$(callerObj).trigger('claimsReturnResult', [status, result]);
			}
		}, false);
	};

	// 반품 반려 상세 내역
	function claimsReturnDeny(claimNumber) {
		Super.callApi('/apis/me/claims/' + claimNumber + '/returnDeny', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('claimsReturnDenyResult', [status, result]);
			} else {
				Super.handleError('claimsReturn', result);
				$(callerObj).trigger('claimsReturnDenyResult', [status, result]);
			}
		}, false);
	};


	/**
	 * 배송형 주문서 작성 페이지 조회
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/order-controller/orderUsingPOST_1
	 */
	function myOrdersInfo(products) {
		Super.callApi('/apis/orders', 'POST', {
			'products' : products
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myOrdersInfoResult', [status, result]);
			} else {
				Super.handleError('myOrdersInfo', result);
				$(callerObj).trigger('myOrdersInfoResult', [status, result]);
			}
		}, true);
	};

	// 주문완료
	function ordersComplete(orderNumber) {
		Super.callApi('/apis/orders/complete/' + orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersCompleteResult', [status, result]);
			} else {
				Super.handleError('ordersComplete', result);
				$(callerObj).trigger('ordersCompleteResult', [status, result]);
			}
		}, true);
	};

	// 선결제 주문 완료
	function ordersAdvanceComplete(orderNumber) {
		Super.callApi('/apis/constorders/advance/' + orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersCompleteResult', [status, result.common]);
			} else {
				Super.handleError('ordersComplete', result);
				$(callerObj).trigger('ordersCompleteResult', [status, result.common]);
			}
		}, true);
	};

	// 잔금결제 주문 완료
	function ordersBalanceComplete(orderNumber) {
		Super.callApi('/apis/constorders/balance/' + orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersCompleteResult', [status, result.common]);
			} else {
				Super.handleError('ordersComplete', result);
				$(callerObj).trigger('ordersCompleteResult', [status, result.common]);
			}
		}, true);
	};

	// 홈서비스 주문 완료
	function ordersHomeServiceComplete(orderNumber) {
		Super.callApi('/apis/living/wash/order/' + orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersCompleteResult', [status, result]);
			} else {
				Super.handleError('ordersComplete', result);
				$(callerObj).trigger('ordersCompleteResult', [status, result]);
			}
		}, true);
	};


	/**
	 * hash_String 취득(EncryptData)
	 * @param  {String} ediDate [yyyyMMddHHmmss - 전문 생성일시]
	 * @param  {String} price   [description - 결제 금액(최종 결제 금액)]
	 */
	function ordersGetHashStr(ediDate, price) {
		Super.callApi('/apis/orders/getHashString', 'GET', {
			'ediDate' : ediDate,
			'price' : price
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersGetHashStrResult', [status, result]);
			} else {
				Super.handleError('ordersGetHashStr', result);
				$(callerObj).trigger('ordersGetHashStrResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 배송형 주문서 작성 페이지 처리(결제)
	 * @param  {String} products   [주문 상품 목록( 상품번호 | 주문옵션 번호| 수량| 주소 수번| 배송요청 메모 ) 형태로 입력, ',' 로 구분]
	 * @param  {String} usingPoint [결제 금액(최종 결제 금액)]
	 */
	function ordersProcess(products, usingPoint) {
		Super.callApi('/apis/orders/process', 'POST', {
			'products' : products,
			'usingPoint' : usingPoint
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('ordersProcessResult', [status, result]);
			} else {
				Super.handleError('ordersProcess', result);
				$(callerObj).trigger('ordersProcessResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 시공형 선결제 주문서 작성 페이지 조회
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/order-controller/orderUsingPOST_1
	 */
	function orderNewFormDepositForm(products) {
		Super.callApi('/apis/constorders/advance', 'POST', {
			'products' : products
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('newFormDepositFormResult', [status, result.common]);
			} else {
				Super.handleError('orderNewFormDepositForm', result);
				$(callerObj).trigger('newFormDepositFormResult', [status, result.common]);
			}
		}, true);
	};

	/**
	 * 시공형 잔금결제 주문서 작성 페이지 조회
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/order-controller/orderUsingPOST_1
	 */
	function orderNewFormBalanceForm(orderNumber) {
		Super.callApi('/apis/constorders/balance/'+orderNumber, 'POST', {
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('newFormBalanceFormResult', [status, result.common]);
			} else {
				Super.handleError('orderNewFormBalanceForm', result);
				$(callerObj).trigger('newFormBalanceFormResult', [status, result.common]);
			}
		}, true);
	};

	/**
	 * 생활서비스 주문서 작성페이지 조회
	 */
	function homeServiceOrderForm(orderNumber) {
		Super.callApi('/apis/living/order', 'POST', {
			"serviceRequestNumber": orderNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('homeServiceOrderFormResult', [status, result]);
			} else {
				Super.handleError('homeServiceOrderForm', result);
				$(callerObj).trigger('homeServiceOrderFormResult', [status, result]);
			}
		}, true);
	}
	
	// 주문/배송 현황 조회
	function myConstOrdersList(startDate, endDate, keyword, deliveryStateCode) {
		Super.callApi('/apis/me/constorders', 'GET', {
			'startDate' : startDate,
			'endDate' : endDate,
			'keyword' : keyword || '',
			'deliveryStateCode' : deliveryStateCode || ''
		}, function(status, result) {
			if (status == 200) {
				/*
				var deliveryChunk = {};
				$.map(result.data.listOrderItems, function(eachOrder) {
					if (eachOrder.parentDeliveryNumber != 0) eachOrder.deliveryNumber = eachOrder.parentDeliveryNumber;
					if (deliveryChunk[eachOrder.deliveryNumber] == undefined) deliveryChunk[eachOrder.deliveryNumber] = new Array();
					deliveryChunk[eachOrder.deliveryNumber].push(eachOrder);
				});
				var deliceryChunkArray = new Array();
				$.map(deliveryChunk, function(eachOrder) {
					deliceryChunkArray.push(eachOrder);
				});
				deliceryChunkArray.reverse();

				result.data.deliveryChunk = deliceryChunkArray;*/
				$(callerObj).trigger('myConstOrdersListResult', [status, result.data]);
			} else {
				Super.handleError('myConstOrdersList', result);
				$(callerObj).trigger('myConstOrdersListResult', [status, result]);
			}
		}, false);
	};

	

	/*
    get /apis/me/orders/{orderNumber}/cancel
        취소 신청 조회 팝업
    post /apis/me/orders/{orderNumber}/cancel
        주문 취소 신청 처리
    post /apis/me/orders/{orderNumber}/confirm
        구매확정
    post /apis/me/orders/{orderNumber}/exchange
        교환 신청 처리
    post /apis/me/orders/{orderNumber}/return
        반품 신청 처리
    get /apis/me/orders/{orderNumber}/review
        상품리뷰 작성 페이지
    post /apis/me/orders/{orderNumber}/review
        상품리뷰 작성 처리

	*/
}

