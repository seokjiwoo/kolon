/* jshint node: true, strict: true */

module.exports = ClassProductMockController().getInstance();

function ClassProductMockController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = ProductMockController();
			return instance;
		}
	};
	
	function ProductMockController() {
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
				$(callerObj).trigger('productMockEvalsResult', [status, result]);
			} else {
				Super.handleError('productMockEvals', result);
				$(callerObj).trigger('productMockEvalsResult', [status, result]);
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
				$(callerObj).trigger('productMockInfoResult', [status, result]);
			} else {
				Super.handleError('productMockInfo', result);
				$(callerObj).trigger('productMockInfoResult', [status, result]);
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
				$(callerObj).trigger('productMockPartnerInfoResult', [status, result]);
			} else {
				Super.handleError('productMockPartnerInfo', result);
				$(callerObj).trigger('productMockPartnerInfoResult', [status, result]);
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
				$(callerObj).trigger('productMockPreviewResult', [status, result]);
			} else {
				Super.handleError('productMockPreview', result);
				$(callerObj).trigger('productMockPreviewResult', [status, result]);
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
				$(callerObj).trigger('productMockRelatedResult', [status, result]);
			} else {
				Super.handleError('productMockRelated', result);
				$(callerObj).trigger('productMockRelatedResult', [status, result]);
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
				$(callerObj).trigger('productMockReviewsResult', [status, result]);
			} else {
				Super.handleError('productMockReviews', result);
				$(callerObj).trigger('productMockReviewsResult', [status, result]);
			}
		}, true);
	}
}

