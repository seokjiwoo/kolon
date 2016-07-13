/* jshint node: true, strict: true */

module.exports = ClassExpertsController().getInstance();

function ClassExpertsController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();

	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = ClassExpertsController();
			return instance;
		}
	};
	
	function ClassExpertsController() {
		callerObj = {
			/**
			 * 전문가 전체 목록
			 */
			list : list,
			/**
			 * 전문가 이름 조회
			 */
			name : name,
			/**
			 * 전문가 상세 조회
			 */
			detail : detail,
			/**
			 * 브랜드 상세
			 */
			brand : brand,
			/**
			 * 브랜드 판매상품 조회
			 */
			brandProducts : brandProducts,
			/**
			 * 전문가 판매상품
			 */
			products : products,
			/**
			 * 전문가 판매상품 필터 아이템 리스트
			 */
			productsFilter : productsFilter
		};
		
		return callerObj;	
	}

	//	전문가 전체 목록
	//	GET /apis/experts
	function list() {
		Super.callApi('/apis/experts', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsListResult', [status, result.data]);
			} else {
				Super.handleError('expertsList', result);
				$(callerObj).trigger('expertsListResult', [status, result]);
			}
		}, true);
	}


	/**
	 * 전문가 이름 조회
	 * GET /apis/experts/name
	 * @param  {String} expertName
	 * @param  {String} order      [PD_OPTION_SORT]
	 */
	function name(expertName, order) {
		Super.callApi('/apis/experts/name', 'GET', {
			'expertName' : expertName,
			'order' : order
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsNameResult', [status, result]);
			} else {
				Super.handleError('expertsName', result);
				$(callerObj).trigger('expertsNameResult', [status, result]);
			}
		}, true);
	}

	//	전문가 상세 조회
	//	GET /apis/experts/{expertNum}
	function detail(expertNum) {
		Super.callApi('/apis/experts/' + expertNum, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsDetailResult', [status, result]);
			} else {
				Super.handleError('expertsDetail', result);
				$(callerObj).trigger('expertsDetailResult', [status, result]);
			}
		}, true);
	}

	//	브랜드 상세
	//	GET /apis/experts/{expertNum}/brand
	function brand(expertNum) {
		Super.callApi('/apis/experts/' + expertNum + '/brand', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsBrandResult', [status, result]);
			} else {
				Super.handleError('expertsBrand', result);
				$(callerObj).trigger('expertsBrandResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 브랜드 판매상품 조회
	 * GET /apis/experts/{expertNum}/brand/products
	 * @param  {String} expertNum
	 * @param  {String} order      [PD_OPTION_SORT]
	 */
	function brandProducts(expertNum, order) {
		Super.callApi('/apis/experts/' + expertNum + '/brand/products', 'GET', {
			'order' : order
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsBrandProductsResult', [status, result]);
			} else {
				Super.handleError('expertsBrandProducts', result);
				$(callerObj).trigger('expertsBrandProductsResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 전문가 판매상품
	 * GET /apis/experts/{expertNum}/products
	 * @param  {String} expertNum
	 * @param  {String} order      [PD_OPTION_SORT]
	 *
	 */
	function products(expertNum, order) {
		Super.callApi('/apis/experts/' + expertNum + '/products', 'GET', {
			'order' : order
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsProductsResult', [status, result]);
			} else {
				Super.handleError('expertsProducts', result);
				$(callerObj).trigger('expertsProductsResult', [status, result]);
			}
		}, true);
	}

	// 전문가 판매상품 필터 아이템 리스트
	// GET /apis/experts/{expertNum}/products/filter
	function productsFilter(expertNum) {
		Super.callApi('/apis/experts/' + expertNum + '/products/filter', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertsProductsFilterResult', [status, result]);
			} else {
				Super.handleError('expertsProductsFilter', result);
				$(callerObj).trigger('expertsProductsFilterResult', [status, result]);
			}
		}, true);
	}
}

