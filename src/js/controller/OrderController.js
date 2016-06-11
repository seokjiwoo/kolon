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
			 * 예제
			 */
			example: example
		}
		
		return callerObj;	
	};
	
	/**
	 * 예제
	 */
	function example(attr) {
		Super.callApi('/apis/example', 'POST', {
			"example": attr,
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('exampleResult', [200]);
			} else {
				Super.handleError('example', result);
				$(callerObj).trigger('exampleResult', [result.status]);
			}
		}, false);
	};


	/*
	/apis/order : 주소록
		get /apis/order/addresses
			주소록 목록
		post /apis/order/addresses
			주소록 등록
		get /apis/order/addresses/search/{addressKeyword}
			주소 검색
		get /apis/order/addresses/{addressNumber}
			주소록 단건 조회
		put /apis/order/addresses/{addressNumber}
			주소록 삭제
		put /apis/order/addresses{addressNumber}
			주소록 수정

	/apis/orders : 주문서 작성
		post /apis/orders
			배송형 주문서 작성 페이지 조회
		post /apis/orders/process
			배송형 주문서 작성 처리
	*/
}

