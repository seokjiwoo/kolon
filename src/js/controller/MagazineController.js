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

	//	매거진 리스트
	//	GET /apis/magazines
	function list() {
		Super.callApi('/apis/magazines', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineListResult', [status, result.data]);
			} else {
				Super.handleError('magazineList', result);
				$(callerObj).trigger('magazineListResult', [status, result]);
			}
		}, true);
	}

	//	매거진 정보
	//	GET /apis/magazines/{magazineNumber}
	function info(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineInfoResult', [status, result]);
			} else {
				Super.handleError('magazineInfo', result);
				$(callerObj).trigger('magazineInfoResult', [status, result]);
			}
		}, true);
	}

	//	매거진 좋아요
	//	POST /apis/magazines/{magazineNumber}/likes
	function likes(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/likes', 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineLikesResult', [status, result]);
			} else {
				Super.handleError('magazineLikes', result);
				$(callerObj).trigger('magazineLikesResult', [status, result]);
			}
		}, true);
	}

	//	에디터의 다른 매거진 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/others
	function others(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/others', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineOthersResult', [status, result]);
			} else {
				Super.handleError('magazineOthers', result);
				$(callerObj).trigger('magazineOthersResult', [status, result]);
			}
		}, true);
	}

	//	매거진 에디터 정보
	//	GET /apis/magazines/{magazineNumber}/partnerInfo
	function partnerInfo(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/partnerInfo', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazinePartnerInfoResult', [status, result]);
			} else {
				Super.handleError('magazinePartnerInfo', result);
				$(callerObj).trigger('magazinePartnerInfoResult', [status, result]);
			}
		}, true);
	}

	//	추천 상품 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/products
	function products(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/products', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineProductsResult', [status, result]);
			} else {
				Super.handleError('magazineProducts', result);
				$(callerObj).trigger('magazineProductsResult', [status, result]);
			}
		}, true);
	}

	//	추천 매거진 카드 리스트
	//	GET /apis/magazines/{magazineNumber}/recommend
	function recommend(magazineNumber) {
		Super.callApi('/apis/magazines/' + magazineNumber + '/recommend', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('magazineRecommendResult', [status, result]);
			} else {
				Super.handleError('magazineRecommend', result);
				$(callerObj).trigger('magazineRecommendResult', [status, result]);
			}
		}, true);
	}
}

