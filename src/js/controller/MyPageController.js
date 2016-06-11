/* global $ */

module.exports = ClassMyPageController().getInstance();

function ClassMyPageController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = MyPageController();
			return instance;
		}
	};
	
	function MyPageController() {
		callerObj = {
			/**
			 * 내 정보 확인
			 */
			myInfo: myInfo,
			/**
			 * 내 의견 묻기 목록
			 */
			myOpinions: myOpinions,
			/**
			 * 최근 본 상품 목록
			 */
			recentViewItems: recentViewItems,
			/**
			 * 내 리뷰 목록
			 */
			myReview: myReview,
			/**
			 * 주문/배송 현황 조회
			 */
			myOrdersList: myOrdersList,
			/**
			 * 주문 상세
			 */
			orderDetail: orderDetail,
			/**
			 * 배송 조회
			 */
			orderTrackingInfo: orderTrackingInfo
		}
		
		return callerObj;	
	};
	
	function myInfo() {
		Super.callApi('/apis/me', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myInfoResult', [200, result]);
			} else {
				Super.handleError('myInfo', result);
			}
		}, true);
	};
	
	function myOpinions() {
		Super.callApi('/apis/me/opinions', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myOpinionsResult', [200, result]);
			} else {
				Super.handleError('myOpinions', result);
			}
		}, false);
	};
	
	function recentViewItems() {
		Super.callApi('/apis/me/recent', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('recentViewItemsResult', [200, result]);
			} else {
				Super.handleError('recentViewItems', result);
			}
		}, false);
	};
	
	function myReview() {
		Super.callApi('/apis/me/reviews', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myReviewResult', [200, result]);
			} else {
				Super.handleError('myReview', result);
			}
		}, false);
	};
	
	function myOrdersList() {
		Super.callApi('/apis/me/orders', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myOrdersListResult', [200, result]);
			} else {
				Super.handleError('myOrdersList', result);
			}
		}, false);
	};
	
	function orderDetail(orderNumber) {
		Super.callApi('/apis/me/orders/'+orderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderDetailResult', [200, result]);
			} else {
				Super.handleError('orderDetail', result);
			}
		}, false);
	};
	
	function orderTrackingInfo(orderNumber) {
		Super.callApi('/apis/me/orders/'+orderNumber+'/tracking', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('orderTrackingInfoResult', [200, result]);
			} else {
				Super.handleError('orderTrackingInfo', result);
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

	get /apis/me/claims
		교환/반품/취소 목록 조회
	get /apis/me/claims/{claimNumber}/cancelCell
		취소 상세 내역 / 휴대폰 결제
	get /apis/me/claims/{claimNumber}/cancelCredit
		취소 상세 내역 / 신용카드 결제
	get /apis/me/claims/{claimNumber}/cancelDeny
		취소 반려 상세 내역
	get /apis/me/claims/{claimNumber}/cancelDeposit
		취소 상세 내역 / 무통장 입금
	get /apis/me/claims/{claimNumber}/exchange
		교환 상세 내역
	get /apis/me/claims/{claimNumber}/exchangeDeny
		교환 반려 상세 내역
	get /apis/me/claims/{claimNumber}/return
		반품 상세 내역
	get /apis/me/claims/{claimNumber}/returnDeny
		반품 반려 상세 내역

	get /apis/follows
		팔로잉 리스트 조회
	post /apis/follows
		팔로우 하기
	delete /apis/follows/{followNumber}
		팔로잉 취소
	*/
}

