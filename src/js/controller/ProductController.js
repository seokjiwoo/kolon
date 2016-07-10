/* jshint node: true, strict: true */

module.exports = ClassProductController().getInstance();

function ClassProductController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = ProductController();
			return instance;
		}
	};
	
	function ProductController() {
		callerObj = {
			// 상품 평가및 리뷰
			evals : evals,
			// 상품 정보
			info : info,
			// 상품 판매자 정보
			partnerInfo : partnerInfo,
			// 상품 미리보기
			preview : preview,
			// 연관상품 리스트
			related : related,
			// 연관상품 리스트
			reviews : reviews
		};		
		return callerObj;
	}

	/**
	 * 상품 평가및 리뷰
	 * @param  {Number} productNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductEvalUsingGET
	 * @ GET /apis/products/{productNumber}/eval
	 */
	function evals(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/eval', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productEvalsResult', [status, result]);
			} else {
				Super.handleError('productEvals', result);
				$(callerObj).trigger('productEvalsResult', [status, result]);
			}
		}, true);
	}


	/**
	 * 상품 정보
	 * @param  {Number} productNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductInfoUsingGET
	 * @ GET /apis/products/{productNumber}/info
	 */
	function info(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/info', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productInfoResult', [status, result]);
			} else {
				Super.handleError('productInfo', result);
				$(callerObj).trigger('productInfoResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 상품 판매자 정보
	 * @param  {Number} productNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductPartnerInfoUsingGET
	 * @ GET /apis/products/{productNumber}/partnerInfo
	 */
	function partnerInfo(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/partnerInfo', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productPartnerInfoResult', [status, result]);
			} else {
				Super.handleError('productPartnerInfo', result);
				$(callerObj).trigger('productPartnerInfoResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 상품 미리보기
	 * @param  {Number} productNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductPreviewUsingGET
	 * @ GET /apis/products/{productNumber}/preview
	 */
	function preview(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/preview', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productPreviewResult', [status, result]);
			} else {
				Super.handleError('productPreview', result);
				$(callerObj).trigger('productPreviewResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 연관상품 리스트
	 * @param  {Number} productNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductRelatedUsingGET
	 * @ GET /apis/products/{productNumber}/related
	 */
	function related(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/related', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productRelatedResult', [status, result]);
			} else {
				Super.handleError('productRelated', result);
				$(callerObj).trigger('productRelatedResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 연관상품 리스트
	 * @param  {Number} productNumber
	 * @param  {Number} reviewNumber
	 * @see  http://uppp.oneplat.co/swagger/swagger-ui.html#!/product-mock-controller/getProductReviewUsingGET
	 * @ GET /apis/products/{productNumber}/reviews/{reviewNumber}
	 */
	function reviews(productNumber, reviewNumber) {
		Super.callApi('/apis/products/' + productNumber + '/reviews/' + reviewNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productReviewsResult', [status, result]);
			} else {
				Super.handleError('productReviews', result);
				$(callerObj).trigger('productReviewsResult', [status, result]);
			}
		}, true);
	}
}

