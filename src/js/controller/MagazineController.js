/* jshint node: true, strict: true */

module.exports = ClassMagazineController().getInstance();

function ClassMagazineController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var model = require('../model/CardListModel.js');

	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = MagazineController();
			return instance;
		}
	};
	
	function MagazineController() {
		callerObj = {
			/**
			 * 인기 매거진 리스트
			 */
			getListPopular: getListPopular,
			/**
			 * 매거진 리스트
			 */
			list : list,
			/**
			 * 매거진 정보
			 */
			info : info,
			/**
			 * 매거진 좋아요
			 */
			likes : likes,
			/**
			 * 에디터의 다른 매거진 카드 리스트
			 */
			others : others,
			/**
			 * 매거진 에디터 정보
			 */
			partnerInfo : partnerInfo,
			/**
			 * 추천 상품 카드 리스트
			 */
			products : products,
			/**
			 * 추천 매거진 카드 리스트
			 */
			recommend : recommend
		};
		
		return callerObj;	
	}

	function getListPopular() {
		Super.callApi('/apis/magazines/popular', 'GET', {}, function(status, result) {
			if (status == 200) {
				model.topFixedList(result.data.magazines);
				$(callerObj).trigger('getListPopularResult', [200]);
			} else {
				Super.handleError('getListPopular', result);
				$(callerObj).trigger('getListPopularResult', [result.status]);
			}
		}, true);
	}


	//	매거진 리스트
	//	GET /apis/magazines
	function list() {
		Super.callApi('/apis/magazines', 'GET', {}, function(status, result) {
			if (status == 200) {
				// model.topFixedList(result.data.magazines);
				$(callerObj).trigger('magazineListResult', [result.status]);
			} else {
				Super.handleError('magazineList', result);
				$(callerObj).trigger('magazineListResult', [result.status]);
			}
		}, true);
	}

	//	매거진 정보
	//	GET /apis/magazines/{magazineNumber}
	function info(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineInfoResult', [result.status]);
			} else {
				Super.handleError('magazineInfo', result);
				$(callerObj).trigger('magazineInfoResult', [result.status]);
			}
		}, true);
	}

	//	매거진 좋아요
	//	POST /apis/magazines/{magazineNumber}/likes
	function likes(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/likes', 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineLikesResult', [result.status]);
			} else {
				Super.handleError('magazineLikes', result);
				$(callerObj).trigger('magazineLikesResult', [result.status]);
			}
		}, true);
	}

	//	에디터의 다른 매거진 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/others
	function others(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/others', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineOthersResult', [result.status]);
			} else {
				Super.handleError('magazineOthers', result);
				$(callerObj).trigger('magazineOthersResult', [result.status]);
			}
		}, true);
	}

	//	매거진 에디터 정보
	//	GET /apis/magazines/{magazineNumber}/partnerInfo
	function partnerInfo(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/partnerInfo', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazinePartnerInfoResult', [result.status]);
			} else {
				Super.handleError('magazinePartnerInfo', result);
				$(callerObj).trigger('magazinePartnerInfoResult', [result.status]);
			}
		}, true);
	}

	//	추천 상품 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/products
	function products(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/products', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineProductsResult', [result.status]);
			} else {
				Super.handleError('magazineProducts', result);
				$(callerObj).trigger('magazineProductsResult', [result.status]);
			}
		}, true);
	}

	//	추천 매거진 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/recommend
	function recommend(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/recommend', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineRecommendResult', [result.status]);
			} else {
				Super.handleError('magazineRecommend', result);
				$(callerObj).trigger('magazineRecommendResult', [result.status]);
			}
		}, true);
	}
}

