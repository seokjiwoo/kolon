/* jshint node: true, strict: true */
module.exports = Events().getInstance();

function Events() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'events/Events.js';

	var Events = {
		MEMBER_INFO : {
			INFO : 'myInfoResult',
			CHANGE_EMAIL_ID : 'changeEmailIdResult',
			EDIT_INFO : 'editMemberInfoResult',
			REFUND_BANK_LIST : 'refundBankListResult',
			REFUND_DATA : 'refundDataResult',
			CHANGE_PWD : 'changePasswordResult',
			IS_LOGIN : 'VX-MEMBER_INFO-IS_LOGIN'
		},
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
			DESTROY : 'VX-COLORBOX_AREA-DESTROY',
			CLOSE : 'VX-COLORBOX_AREA-CLOSE',
			RESIZE : 'VX-COLORBOX_AREA-RESIZE'
		},
		ALERT_POPUP : {
			OPEN : 'VX-ALERT_POPUP-OPEN'
		},
		HTML_POPUP : {
			OPEN : 'VX-HTML_POPUP-OPEN',
			REFRESH : 'VX-HTML_POPUP-REFRESH',
			DESTROY : 'VX-HTML_POPUP-DESTROY'
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
		DROPDOWN_MENU : {
			REFRESH : 'VX-DROPDOWN_MENU-REFRESH',
			DESTROY : 'VX-DROPDOWN_MENU-DESTROY',
			CHANGE : 'VX-DROPDOWN_MENU-CHANGE'
		},
		DROPDOWN_SCROLL : {
			REFRESH : 'VX-DROPDOWN_SCROLL-REFRESH',
			DESTROY : 'VX-DROPDOWN_SCROLL-DESTROY',
			CHANGE : 'VX-DROPDOWN_SCROLL-CHANGE'
		},
		DOUGHNUT_CHART : {
			REFRESH : 'VX-DOUGHNUT_CHART-REFRESH',
			DESTROY : 'VX-DOUGHNUT_CHART-DESTROY',
			INIT : 'VX-DOUGHNUT_CHART-INIT',
			APPEND : 'VX-DOUGHNUT_CHART-APPEND'
		},
		HORIZONBAR_CHART : {
			REFRESH : 'VX-HORIZON_BAR_CHART-REFRESH',
			DESTROY : 'VX-HORIZON_BAR_CHART-DESTROY',
			INIT : 'VX-HORIZON_BAR_CHART-INIT',
			APPEND : 'VX-HORIZON_BAR_CHART-APPEND'
		},
		INFO_SLIDER : {
			REFRESH : 'VX-INFO_SLIDER-REFRESH',
			DESTROY : 'VX-INFO_SLIDER-DESTROY',
		},
		WINDOW_OPENER : {
			OPEN : 'VX-WINDOW_OPENER-OPEN',
			REFRESH : 'VX-WINDOW_OPENER-REFRESH',
			DESTROY : 'VX-WINDOW_OPENER-DESTROY'
		},
		RECAPTCHA : {
			CALL_BACK : 'VX-G_RECAPTCHA-CALL_BACK'
		},
		CARD_LIST : {
			APPENDED : 'VX-CARD_LIST-APPENDED'
		},

		// [S] Controller Events
			// MyPage
			// @see MyPageController.js
			MYPAGE : {
				// 내 정보 확인
				INFO : 'myInfoResult',
				// 마이커먼 타임라인
				TIMELINE : 'myTimeLineResult',
				// 내 의견 묻기 목록
				OPINIONS : 'myOpinionsResult',
				// 최근 본 상품 목록
				RECENT_VIEW_ITEMS : 'recentViewItemsResult',
				// 포인트 조회
				POINT : 'myPointsResult',
				// 포인트 상세
				POINT_HISTORY : 'pointsHistoryResult',
				// 알림 유형 코드
				NOTICE_TYPE : 'noticeTypeCodeResult',
				// 알림 리스트 조회
				NOTICE_LIST : 'noticeListResult',
				// 알림 삭제
				NOTICE_DELETE : 'noticeDeleteResult'
			},
			// Login - 로그인
			// @see LoginController.js
			LOGIN : {
				RESULT : 'loginResult',
				SOCIAL_LOGIN_URL : 'socialLoginUrlResult',
				SOCIAL_CONNECT : 'socialConnectResult',
				SOCIAL_DISCONNECT : 'socialDisconnectResult',
				NOT_A_ROBOT : 'notarobotResult',
				REFRESH_MY_INFO : 'myInfoResult'
			},
			// Opinions - 의견묻기
			// @see OpinionsController.js
			OPINIONS : {
				// 의견 주제 코드 리스트 
				CLASS : 'opinionsClassResult',
				// 의견묻기 리스트 조회
				LIST : 'opinionsListResult',
				// 의견묻기 답변 전체 리스트 조회
				ANSWERS : 'opinionAnswersResult',
				// 의견묻기 전문가 리스트
				EXPERTS_LIST : 'opinionsExpertsListResult',
				// 의견묻기 스크랩 폴더 목록
				SCRAPED_LIST : 'scrapedOpinionsListResult',
				// 의견묻기 등록 (첨부 파일 목록, 스크랩 번호 목록 처리 안 되어 있음!)
				POST_OPINION : 'postOpinionResult',
				// 의견묻기 답변 등록
				POST_ANSWER : 'postAnswerResult',
				// 의견묻기 답변 유용함 체크
				POLL_ANSWER : 'pollAnswerResult',

			},
			// Message - 메세지
			// @see MessageController.js
			MESSAGE : {
				LIST : 'messageListResult',
				INQUIRIES : 'messageInquiriesResult',
				INQUIRIES_IMAGES : 'messageInquiriesImagesResult',
				INQUIRIES_DETAIL : 'messageInquiriesDetailResult'
			},
			// Magazine - 메거진
			// @see MagazineController.js
			MAGAZINE : {				
				// 매거진 리스트
				LIST : 'magazineListResult',
				// 매거진 정보
				INFO : 'magazineInfoResult',
				// 매거진 좋아요
				LIKES : 'magazineLikesResult',
				// 에디터의 다른 매거진 카드 리스트
				OTHERS : 'magazineOthersResult',
				// 매거진 에디터 정보
				PARTNER_INFO : 'magazinePartnerInfoResult',
				// 추천 상품 카드 리스트
				PRODUCTS : 'magazineProductsResult',
				// 추천 매거진 카드 리스트
				RECOMMEND : 'magazineRecommendResult'
			},
			// Experts - 전문가
			// @see ExpertsController.js
			EXPERTS : {
				// 전문가 전체 목록
				LIST : 'expertsListResult',
				// 전문가 이름 조회
				NAME : 'expertsNameResult',
				// 전문가 상세 조회
				DETAIL : 'expertsDetailResult',
				// 브랜드 상세
				BRAND : 'expertsBrandResult',
				// 브랜드 판매상품 조회
				BRAND_PRODUCTS : 'expertsBrandProductsResult',
				// 전문가 판매상품
				PRODUCTS : 'expertsProductsResult',
				// 전문가 판매상품 필터 아이템 리스트
				PRODUCTS_FILTER : 'expertsProductsFilterResult'
			},
			// 마이홈즈 - 타임라인
			// @see MyPageController.js
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/my-page-controller
			TIMELINE : {
				// 마이커먼 리스트
				LIST : 'myTimeLineResult'
			},
			// 마이홈즈 - 장바구니
			// @see MyPageController.js
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/my-page-controller
			CART : {
				// 장바구니 리스트
				LIST : 'myCartListResult',
				// 장바구니 등록
				ADD : 'addMyCartListResult',
				// 장바구니 삭제
				DELETE : 'deleteMyCartListResult',
				// 장바구니 삭제
				UPDATE : 'updateMyCartListResult'
			},
			// 스크랩
			// @see ScrapController.js
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/scrap-controller
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
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/follow-controller
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
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/product-controller
			PRODUCT : {
				// 토스트 메시지
				TOAST_MESSAGE: 'toastMessageResult',
				// 샵 상품 목록
				SHOP_LIST: 'shopProductListResult', 
				// 뉴폼 상품 목록
				NEWFORM_LIST: 'shopNewFormListResult',
				// 상품 평가및 리뷰
				EVALS : 'productEvalsResult',
				// 상품 정보
				INFO : 'productInfoResult',
				// 상품 좋아요
				LIKES : 'productLikesResult',
				// 상품 옵션 정보,
				OPTIONS : 'productOptionsResult',
				// 상품 판매자 정보
				PARTNER_INFO : 'productPartnerInfoResult',
				// 판매자의 다른 상품
				PARTNER_GOODS : 'productPartnerGoodsResult',
				// 상품 미리보기
				PREVIEW : 'productPreviewResult',
				// 연관상품 리스트
				RELATED : 'productRelatedResult',
				// 상품 리뷰 상세
				REVIEWS : 'productReviewsResult',
				// 추천 상품 리스트
				RECOMMEND: 'recommendProductResult'
			},
			// OrderController - 주문조회
			// @see OrderController.js
			// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/me-order-controller
			ORDER : {
				// 주문/배송 현황 조회
				ORDER_LIST : 'myOrdersListResult',
				// 주문/배송 - 주문상세
				ORDER_DETAIL : 'orderDetailResult',
				// 구매확정
				ORDER_CONFIRM : 'orderConfirmResult',
				// 주문/배송 - 배송추적 팝업 조회
				ORDER_TRACKING : 'orderTrackingInfoResult',
				// 주문 취소 신청 처리
				ORDER_CANCEL : 'orderCancelResult',
				// 교환 신청 처리
				ORDER_EXCHANGE : 'orderExchangeResult',
				// 반품 신청 처리
				ORDER_RETURN : 'orderReturnResult',

				// 교환/반품/취소 조회
				CANCEL_LIST : 'myCancelListResult',
				// 취소 신청 조회 팝업
				CANCEL_DETAIL : 'cancelDetailResult',


				// OrderController - 주문서 작성
				// @see OrderController.js
				// @see http://dev.koloncommon.com/swagger/swagger-ui.html#/me-order-controller
					// 배송형 주문서 작성 페이지 조회
					ORDERS_INFO : 'myOrdersInfoResult',
					// 주문완료
					ORDERS_COMPLETE : 'ordersCompleteResult',
					// hash_String 취득(EncryptData)
					ORDERS_GET_HASH : 'ordersGetHashStrResult',
					// 배송형 주문서 작성 페이지 처리(결제)
					ORDERS_PROCESS : 'ordersProcessResult',
				
				// 뉴폼상품 선결제 페이지 조회
				NEWFORM_ORDER_DEPOSIT_INFO: 'newFormDepositFormResult',
				// 뉴폼상품 잔금결제 페이지 조회
				NEWFORM_ORDER_BALANCE_INFO: 'newFormBalanceFormResult',
				// 뉴폼상품 주문 리스트 조회
				NEWFORM_ORDER_LIST: 'myConstOrdersListResult'
			},
			CLAIMS : {
				// 교환/반품/취소 목록 조회
				LIST : 'myClaimsListResult',
				// 취소 상세 내역 / 휴대폰 결제
				CELL : 'claimsCellResult',
				// 취소 상세 내역 / 신용카드 결제
				CREDIT : 'claimsCreditResult',
				// 취소 반려 상세 내역
				DENY : 'claimsDenyResult',
				// 취소 상세 내역 / 무통장 입금
				DEPOSIT : 'claimsDepositResult',
				// 교환 상세 내역
				EXCHANGE : 'claimsExchangeResult',
				// 교환 반려 상세 내역
				EXCHANGE_DENY : 'claimsExchangeDenyResult',
				// 반품 상세 내역
				RETURN : 'claimsReturnResult',
				// 반품 반려 상세 내역
				RETURN_DENY : 'claimsReturnDenyResult'
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