/* jshint node: true, strict: true */
module.exports = Events().getInstance();

function Events() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'events/Events.js';

	var Events = {
		// @see http://www.jacklmoore.com/colorbox/
		COLOR_BOX : {
			OPEN : 'cbox_open',
			LOAD : 'cbox_load',
			COMPLETE : 'cbox_complete',
			CLEANUP : 'cbox_cleanup',
			CLOSED : 'cbox_closed',
			PURGE : 'cbox_purge',


			APPEND : 'VX-COLORBOX_AREA-APPEND',
			REFRESH : 'VX-COLORBOX_AREA-REFRESH',
			DESTROY : 'VX-COLORBOX_AREA-DESTROY'
		},
		ALERT_POPUP : {
			OPEN : 'VX-ALERT_POPUP-OPEN'
		},
		CHECK_BOX : {
			CHANGE : 'VX-CHECK_BOX-CHANGE'
		},
		OPTION_NUM : {
			CHANGE : 'VX-OPTION_NUM-CHANGE'
		},
		ISOTOPE : {
			APPEND : 'VX-ISOTOPE-APPEND',
			REFRESH : 'VX-ISOTOPE-REFRESH',
			DESTROY : 'VX-ISOTOPE-DESTROY'
		},


		// [S] Controller Events
			// 마이홈즈 - 타임라인
			// @see MyPageController.js
			// @see http://uppp.oneplat.co/swagger/swagger-ui.html#/my-page-controller
			TIMELINE : {
				// 마이커먼 리스트
				LIST : 'myTimeLineResult'
			},
			// 마이홈즈 - 장바구니
			// @see MyPageController.js
			// @see http://uppp.oneplat.co/swagger/swagger-ui.html#/my-page-controller
			CART : {
				// 장바구니 리스트
				LIST : 'myCartListResult',
				// 장바구니 등록
				ADD : 'addMyCartListResult',
				// 장바구니 삭제
				DELETE : 'deleteMyCartListResult'
			},
			// 스크랩
			// @see ScrapController.js
			// @see http://uppp.oneplat.co/swagger/swagger-ui.html#/scrap-controller
			SCRAP : {
				// 스크랩 목록
				LIST : 'scrapListResult',
				// 스크랩 목록(이미지)
				IMAGE_LIST : 'scrapImageListResult',
				// 스크랩 하기
				ADD_SCRAP : 'addScrapResult',
				// 스크랩 수정
				EDIT_SCRAP : 'editScrapResult',
				// 스크랩 삭제
				DELETE_SCRAP : 'deleteScrapResult',
				// 폴더 만들기
				ADD_SCRAP_FOLDER : 'addScrapFolderResult',
				// 폴더 수정
				EDIT_SCRAP_FOLDER : 'editScrapFolderResult',
				// 폴더 삭제
				DELETE_SCRAP_FOLDER : 'deleteScrapFolderResult'
			},
			// 팔로잉
			// @see FollowController.js
			// @see http://uppp.oneplat.co/swagger/swagger-ui.html#/follow-controller
			FOLLOWING : {
				// 팔로우 리스트
				LIST : 'followsListResult',
				// 팔로우 등록
				ADD_FOLLOW : 'addFollowsResult',
				// 팔로우 삭제
				DELETE_FOLLOW : 'deleteFollowsResult'
			},
			// ProductController - 상품
			// @see ProductController.js
			// @see http://uppp.oneplat.co/swagger/swagger-ui.html#/product-controller
			PRODUCT : {
				// 샵 상품 목록
				SHOP_LIST: 'shopProductListResult', 
				// 뉴폼 상품 목록
				NEWFORM_LIST: 'shopNewFormListResult',
				// 상품 평가및 리뷰
				EVALS : 'productEvalsResult',
				// 상품 정보
				INFO : 'productInfoResult',
				// 상품 판매자 정보
				PARTNER_INFO : 'productPartnerInfoResult',
				// 상품 미리보기
				PREVIEW : 'productPreviewResult',
				// 연관상품 리스트
				RELATED : 'productRelatedResult',
				// 상품 리뷰 상세
				REVIEWS : 'productReviewsResult'
			}
		// [E] Controller Events
	},
	instance;

	$.each(Events, function(index, category) {
		var events = [];
		$.each(category, function(index, val) {
			events.push(val);
		});
		category.WILD_CARD = events.join(' ');
	});

	return {
		getInstance: function() {
			if (!instance) {
				instance = Events;
			}
			
			debug.log(fileName, 'getInstance', instance);
			return instance;
		}
	};

}