/* jshint node: true, strict: true */

module.exports = ClassProductController().getInstance();

function ClassProductController() {
	'use strict';
	var debug = require('../utils/Console.js');

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
			// 상세페이지 진입 카운트 
			detailCountAdd: detailCountAdd,
			// 상세페이지 이탈 카운트
			detailCountSubtract: detailCountSubtract,
			// 샵(=배송형 상품) 리스트
			shopList: shopList,
			// 뉴폼(=시공형 상품) 리스트
			newFormList: newFormList,
			// 상품 평가및 리뷰 (사용안함)
			evals : evals,
			// 상품 정보
			info : info,
			// 상품 좋아요
			likes : likes,
			// 상품 판매자 정보
			partnerInfo : partnerInfo,
			// 판매자의 다른 상품
			partnerGoodsInfo: partnerGoodsInfo,
			// 추천상품 리스트
			recommend : recommend,
			// 상품 미리보기 (사용안함)
			preview : preview,
			// 연관상품 리스트 (사용안함)
			related : related,
			// 리뷰 리스트 (사용안함)
			reviews : reviews,
			// 다중옵션 리스트
			options : options,
			// 다중옵션 상품의 전체 옵션 (모바일)
			entireOptions : entireOptions
		};		
		return callerObj;
	}

	function detailCountAdd() {
		Super.callApi('/apis/count/product/', 'GET', {
			"url": encodeURI(document.URL)
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('toastMessageResult', [status, result.data]);
			} else {
				Super.handleError('detailCountAdd', result);
				$(callerObj).trigger('toastMessageResult', [status, result]);
			}
		}, true);
	};

	function detailCountSubtract() {
		Super.callApi('/apis/count/product/?url='+encodeURI(document.URL), 'DELETE', {}, function(status, result) {
		}, true);
	};

	/**
	 * 샵(=배송형 상품) 리스트
	 */
	function shopList(order, page) {
		if (!order) order = 'newest';		// newest:최신순/scrap:스크랩순/like:좋아요순
		// page, size는 나중에 정의 필요

		Super.callApi('/apis/products/', 'GET', {
			"productServiceSectionCode": "PD_PROD_SVC_SECTION_01",
			"orderType": order
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('shopProductListResult', [status, result.data]);
			} else {
				Super.handleError('shopList', result);
				$(callerObj).trigger('shopProductListResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 뉴폼(=시공형 상품) 리스트
	 */
	function newFormList(order, page) {
		if (!order) order = 'newest';		// newest:최신순/scrap:스크랩순/like:좋아요순
		// page, size는 나중에 정의 필요

		Super.callApi('/apis/products/', 'GET', {
			"productServiceSectionCode": "PD_PROD_SVC_SECTION_02",
			"orderType": order
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('shopNewFormListResult', [status, result.data]);
			} else {
				Super.handleError('newFormList', result);
				$(callerObj).trigger('shopNewFormListResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 상품 평가및 리뷰
	 * @param  {Number} productNumber
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductEvalUsingGET
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
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductInfoUsingGET
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
	 * 상품 좋아요
	 * @param  {Number} productNumber
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductInfoUsingGET
	 * @ POST /apis/products/{productNumber}/likes
	 */
	function likes(productNumber, productSvcCode) {
		Super.callApi('/apis/products/' + productNumber + '/likes', 'POST', {
			'productSvcCode' : productSvcCode
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productLikesResult', [status, result]);
			} else {
				Super.handleError('productLikes', result);
				$(callerObj).trigger('productLikesResult', [status, result]);
			}
		}, true);
	}


	/**
	 * 다중옵션 상품 옵션
	 * @param  {Number} criteriaOptionCount
	 * @param  {Number} optionLevel
	 * @param  {Array} optionValueArray
	 * @see  https://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductOptionValuesUsingGET
	 * @ GET /apis/products/{productNumber}/options
	 */
	function options(productNumber, criteriaOptionCount, optionLevel, optionValueArray) {
		var optionValues = {
			"criteriaOptionCount": criteriaOptionCount,
			"optionLevel": optionLevel
		}
		for (var i = 0; i < optionLevel; i++) {
			optionValues["optionValue"+(i+1)] = optionValueArray[i];
		}
		
		Super.callApi('/apis/products/' + productNumber + '/options', 'GET', optionValues, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productOptionsResult', [status, result]);
			} else {
				Super.handleError('productOptions', result);
				$(callerObj).trigger('productOptionsResult', [status, result]);
			}
		}, true);
	}
	/**
	 * 다중옵션 상품의 전체 옵션 (모바일)
	 * @param  {Number} criteriaOptionCount
	 * @param  {Number} optionLevel
	 * @param  {Array} optionValueArray
	 * @see  https://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductOptionValuesUsingGET
	 * @ GET /apis/products/{productNumber}/options
	 */
	function entireOptions(productNumber, criteriaOptionCount) {
		Super.callApi('/apis/products/' + productNumber + '/options', 'GET', {
			"criteriaOptionCount": criteriaOptionCount,
			"optionLevel": criteriaOptionCount
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productOptionsResult', [status, result]);
			} else {
				Super.handleError('productOptions', result);
				$(callerObj).trigger('productOptionsResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 상품 판매자 정보
	 * @param  {Number} productNumber
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductPartnerInfoUsingGET
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
	 * 상품 판매자의 다른 상품 정보
	 * @param  {Number} productNumber
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductPartnerInfoUsingGET
	 * @ GET /apis/products/{productNumber}/partnerInfo
	 */
	function partnerGoodsInfo(productNumber) {
		Super.callApi('/apis/products/' + productNumber + '/partners/products', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('productPartnerGoodsResult', [status, result]);
			} else {
				Super.handleError('productPartnerGoods', result);
				$(callerObj).trigger('productPartnerGoodsResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 추천상품 리스트
	 * @param  {Number} productNumber
	 * @param  {String} productServiceSectionCode
	 * @see  https://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getRecommendProductUsingGET
	 * @ GET /apis/products/{productNumber}/recommend
	 */
	function recommend(productNumber, productServiceSectionCode) {
		Super.callApi('/apis/products/'+productNumber+'/recommend', 'GET', {
			"productServiceSectionCode": productServiceSectionCode
		}, function(status, result) {
			if (status == 200) {
				result.data.productServiceSectionCode = productServiceSectionCode;
				$(callerObj).trigger('recommendProductResult', [status, result]);
			} else {
				Super.handleError('recommendProduct', result);
				$(callerObj).trigger('recommendProductResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 상품 미리보기
	 * @param  {Number} productNumber
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductPreviewUsingGET
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
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductRelatedUsingGET
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
	 * @see  http://dev.koloncommon.com/swagger/swagger-ui.html#!/product-controller/getProductReviewUsingGET
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

