/* global $ */
/* jshint node: true, strict: true */

var pageId;
var pageModule;

$(document).ready(function() {
	'use strict';

	var PageModuleClass;
	pageId = $('body').data('pageId');
	
	switch(pageId) {

		// [S] 메인 index
		case 'index':
			PageModuleClass = require('./pagesMobile/Index.js');
			break;
		// [E] 메인 index


		// [S] 검색 search
			// 검색결과 result
			case 'search-result':
				PageModuleClass = require('./pagesMobile/search/Result.js');
				break;
		// [E] 검색 search


		// [S] 회원 member
			// 로그인/가입 login
			case 'member-login':
				PageModuleClass = require('./pagesMobile/member/Login.js');
				break;

			// 로그아웃 logout
			case 'member-logout':
				PageModuleClass = require('./pagesMobile/member/Logout.js');
				break;

			// 비밀번호 찾기 passwordFind
			case 'member-passwordFind':
				PageModuleClass = require('./pagesMobile/member/PasswordFind.js');
				break;

			// 비밀번호 설정 passwordReset
			case 'member-passwordReset':
				PageModuleClass = require('./pagesMobile/member/PasswordReset.js');
				break;

			// 휴면회원 안내 accountReuse
			case 'member-accountReuse':
				PageModuleClass = require('./pagesMobile/member/AccountReuse.js');
				break;

			// 기존계정 안내 accountInformation
			case 'member-accountInformation':
				PageModuleClass = require('./pagesMobile/member/AccountInformation.js');
				break;

			case 'member-certified':
				PageModuleClass = require('./pagesMobile/member/Certified.js');
				break;
		// [E] 회원 member


		// [S] 뉴폼 newForm
			// 상품목록 index
			case 'newForm':
				PageModuleClass = require('./pagesMobile/newForm/Index.js');
				break;

			// 상품상세 detail
			case 'newForm-detail':
				PageModuleClass = require('./pagesMobile/newForm/Detail.js');
				break;
		// [E] 뉴폼 newForm


		// [S] 샵 shop
			// 상품목록 index
			case 'shop':
				PageModuleClass = require('./pagesMobile/shop/Index.js');
				break;

			// 상품상세 detail
			case 'shop-detail':
				PageModuleClass = require('./pagesMobile/shop/Detail.js');
				break;
		// [E] 샵 shop


		// [S] 매거진 magazine
			// 목록 index
			case 'magazine':
				PageModuleClass = require('./pagesMobile/magazine/Index.js');
				break;

			// 상세 detail
			case 'magazine-detail':
				PageModuleClass = require('./pagesMobile/magazine/Detail.js');
				break;
		// [E] 매거진 magazine


		// [S] 홈서비스 homeService
			// 홈서비스 소개 index
			case 'homeService':
				PageModuleClass = require('./pagesMobile/homeService/Index.js');
				break;

			// 세탁 신청 requestWashing
			case 'homeService-requestWashing':
				PageModuleClass = require('./pagesMobile/homeService/RequestWashing.js');
				break;

			// 이사 신청 requestMoving
			case 'homeService-requestMoving':
				PageModuleClass = require('./pagesMobile/homeService/RequestMoving.js');
				break;
		// [E] 홈서비스 homeService


		// [S] 의견묻기 qna
			case 'qna':
				PageModuleClass = require('./pagesMobile/qna/Index.js');
				break;
		// [E] 의견묻기 qna


		// [S] 커먼전문가 manager
			// 목록 index
			case 'manager':
				PageModuleClass = require('./pagesMobile/manager/Index.js');
				break;

			// 전문가 소개 detail
			case 'manager-detail':
				PageModuleClass = require('./pagesMobile/manager/Detail.js');
				break;

			// 전문가 판매상품 itemList
			case 'manager-itemList':
				PageModuleClass = require('./pagesMobile/manager/ItemList.js');
				break;

			// 브랜드 소개
			case 'brand-intro':
				PageModuleClass = require('./pagesMobile/manager/BrandIntro.js');
				break;

			// 브랜드 판매상품
			case 'brand-itemList':
				PageModuleClass = require('./pagesMobile/manager/BrandItemList.js');
				break;
		// [E] 커먼전문가 manager


		// [S] 주문서 작성 order
			// 배송형 주문서 작성 orderGoods
			case 'order-orderGoods':
				PageModuleClass = require('./pagesMobile/order/OrderGoods.js');
				break;

			// 시공형 주문서 작성 orderService
			case 'order-orderService':
				PageModuleClass = require('./pagesMobile/order/OrderService.js');
				break;

			// 주문완료 complete
			case 'order-complete':
				PageModuleClass = require('./pagesMobile/order/Complete.js');
				break;
		// [E] 주문서 작성 order


		// [S] 마이커먼 myPage
			// 마이커먼 index
			case 'myPage':
				PageModuleClass = require('./pagesMobile/myPage/Index.js');
				break;

			// 주문배송 목록 order
			case 'myPage-order':
				PageModuleClass = require('./pagesMobile/myPage/Order.js');
				break;

			// 주문배송 상세 orderDetail
			case 'myPage-orderDetail':
				PageModuleClass = require('./pagesMobile/myPage/OrderDetail.js');
				break;

			// 교환/반품내역 return
			case 'myPage-return':
				PageModuleClass = require('./pagesMobile/myPage/Return.js');
				break;

			// 시공상품 내역 myService
			case 'myPage-myService':
				PageModuleClass = require('./pagesMobile/myPage/MyService.js');
				break;

			// 시공상품 상세 myServiceDetail
			case 'myPage-myServiceDetail':
				PageModuleClass = require('./pagesMobile/myPage/MyServiceDetail.js');
				break;

			// 최근 본 상품 recentSeenItem
			case 'myPage-recentSeenItem':
				PageModuleClass = require('./pagesMobile/myPage/RecentSeenItem.js');
				break;

			// 1:1 메시지 message
			case 'myPage-message':
				PageModuleClass = require('./pagesMobile/myPage/Message.js');
				break;

			// 1:1 메시지 상세	messageDetail
			case 'myPage-messageDetail':
				PageModuleClass = require('./pagesMobile/myPage/MessageDetail.js');
				break;

			// 내 의견묻기	myQnA
			case 'myPage-myQnA':
				PageModuleClass = require('./pagesMobile/myPage/MyQnA.js');
				break;

			// 내 정보	profile
			case 'myPage-profile':
				PageModuleClass = require('./pagesMobile/myPage/Profile.js');
				break;

			case 'myPage-profilePreview':
				PageModuleClass = require('./pagesMobile/myPage/ProfilePreview.js');
				break;

			// 내 정보 수정	profileEdit
			case 'myPage-profileEdit':
				PageModuleClass = require('./pagesMobile/myPage/ProfileEdit.js');
				break;

			// 회원탈퇴	resign
			case 'myPage-resign':
				PageModuleClass = require('./pagesMobile/myPage/Resign.js');
				break;

			// 비밀번호 변경	editPassword
			case 'myPage-editPassword':
				PageModuleClass = require('./pagesMobile/myPage/EditPassword.js');
				break;

			// 홈서비스 내역 조회	homeService
			case 'myPage-homeService':
				PageModuleClass = require('./pagesMobile/myPage/HomeService.js');
				break;

			// 홈서비스 내역 상세/세탁 - 홈서비스 내역 상세/이사
			case 'myPage-homeServiceMoving':
				PageModuleClass = require('./pagesMobile/myPage/HomeServiceMoving.js');
				break;
			case 'myPage-homeServiceWashing':
				PageModuleClass = require('./pagesMobile/myPage/HomeServiceWashing.js');
				break;

			// 홈서비스 취소내역 조회	homeServiceCancel
			case 'myPage-homeServiceCancel':
				PageModuleClass = require('./pagesMobile/myPage/HomeServiceCancel.js');
				break;

			// 알림	notice
			case 'myPage-notice':
				PageModuleClass = require('./pagesMobile/myPage/Notice.js');
				break;

			// 스크랩/글 - 스크랩/이미지	scrap
			case 'myPage-scrap':
				PageModuleClass = require('./pagesMobile/myPage/Scrap.js');
				break;

			// 스크랩 이미지 목록	scrapImage
			case 'myPage-scrapImage':
				PageModuleClass = require('./pagesMobile/myPage/ScrapImage.js');
				break;

			// 좋아요  like
			case 'myPage-like':
				PageModuleClass = require('./pagesMobile/myPage/Like.js');
				break;

			// 팔로잉	following
			case 'myPage-following':
				PageModuleClass = require('./pagesMobile/myPage/Following.js');
				break;

			// 마이카트/뉴폼 상품	myCartNewForm
			case 'myPage-myCartNewForm':
				PageModuleClass = require('./pagesMobile/myPage/MyCartNewForm.js');
				break;

			// 마이카트/샵 상품	myCartShop
			case 'myPage-myCartShop':
				PageModuleClass = require('./pagesMobile/myPage/MyCartShop.js');
				break;

			// 포인트	point
			case 'myPage-point':
				PageModuleClass = require('./pagesMobile/myPage/Point.js');
				break;

			// 나의 활동 내역 - 모바일만 적용
			case 'myPage-myActivity':
				PageModuleClass = require('./pagesMobile/myPage/MyActivity.js')
				break;
		// [E] 마이커먼 myPage

		case 'popup-addressBook':
			PageModuleClass = require('./pagesMobile/addressPopup/addressBook.js');
			break;
		case 'popup-addressForm':
			PageModuleClass = require('./pagesMobile/addressPopup/addressForm.js');
			break;

		case 'popup-message':
			PageModuleClass = require('./pagesMobile/messagePopup/message.js');
			break;

		default:
			PageModuleClass = require('./pagesMobile/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init(pageId);
});