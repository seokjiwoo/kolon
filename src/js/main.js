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
			PageModuleClass = require('./pages/Index.js');
			break;
		// [E] 메인 index


		// [S] 검색 search
			// 검색결과 result
			case 'search-result':
				PageModuleClass = require('./pages/search/Result.js');
				break;
		// [E] 검색 search


		// [S] 회원 member
			// 로그인/가입 login
			case 'member-login':
				PageModuleClass = require('./pages/member/Login.js');
				break;

			// 로그아웃 logout
			case 'member-logout':
				PageModuleClass = require('./pages/member/Logout.js');
				break;

			// 비밀번호 찾기 passwordFind
			case 'member-passwordFind':
				PageModuleClass = require('./pages/member/PasswordFind.js');
				break;

			// 비밀번호 설정 passwordReset
			case 'member-passwordReset':
				PageModuleClass = require('./pages/member/PasswordReset.js');
				break;

			// 휴면회원 안내 accountReuse
			case 'member-accountReuse':
				PageModuleClass = require('./pages/member/AccountReuse.js');
				break;

			// 기존계정 안내 accountInformation
			case 'member-accountInformation':
				PageModuleClass = require('./pages/member/AccountInformation.js');
				break;
		// [E] 회원 member


		// [S] 뉴폼 newForm
			// 상품목록 index
			case 'newForm':
				PageModuleClass = require('./pages/newForm/Index.js');
				break;

			// 상품상세 detail
			case 'newForm-detail':
				PageModuleClass = require('./pages/newForm/Detail.js');
				break;
		// [E] 뉴폼 newForm


		// [S] 샵 shop
			// 상품목록 index
			case 'shop':
				PageModuleClass = require('./pages/shop/Index.js');
				break;

			// 상품상세 detail
			case 'shop-detail':
				PageModuleClass = require('./pages/shop/Detail.js');
				break;
		// [E] 샵 shop


		// [S] 매거진 magazine
			// 목록 index
			case 'magazine':
				PageModuleClass = require('./pages/magazine/Index.js');
				break;

			// 상세 detail
			case 'magazine-detail':
				PageModuleClass = require('./pages/magazine/Detail.js');
				break;
		// [E] 매거진 magazine


		// [S] 홈서비스 homeService
			// 홈서비스 소개 index
			case 'homeService':
				PageModuleClass = require('./pages/homeService/Index.js');
				break;

			// 청소 신청 requestCleaning
			case 'homeService-requestCleaning':
				PageModuleClass = require('./pages/homeService/RequestCleaning.js');
				break;

			// 세탁 신청 requestWashing
			case 'homeService-requestWashing':
				PageModuleClass = require('./pages/homeService/RequestWashing.js');
				break;

			// 이사 신청 requestMoving
			case 'homeService-requestMoving':
				PageModuleClass = require('./pages/homeService/RequestMoving.js');
				break;
		// [E] 홈서비스 homeService


		// [S] 의견묻기 qna
			// 목록 index
			case 'qna':
				PageModuleClass = require('./pages/qna/Index.js');
				break;

			// 작성 write
			case 'qna-write':
				PageModuleClass = require('./pages/qna/Write.js');
				break;
		// [E] 의견묻기 qna


		// [S] 커먼전문가 manager
			// 목록 index
			case 'manager':
				PageModuleClass = require('./pages/manager/Index.js');
				break;

			// 전문가/브랜드 소개 detail
			case 'manager-detail':
				PageModuleClass = require('./pages/manager/Detail.js');
				break;

			// 전문가/브랜드 판매상품 itemList
			case 'manager-itemList':
				PageModuleClass = require('./pages/manager/ItemList.js');
				break;

			// 완료된 공간 portfolio
			case 'manager-portfolio':
				PageModuleClass = require('./pages/manager/Portfolio.js');
				break;
		// [E] 커먼전문가 manager


		// [S] 주문서 작성 order
			// 배송형 주문서 작성 orderGoods
			case 'order-orderGoods':
				PageModuleClass = require('./pages/order/OrderGoods.js');
				break;

			// 시공형 주문서 작성 orderService
			case 'order-orderService':
				PageModuleClass = require('./pages/order/OrderService.js');
				break;

			// 주문완료 complete
			case 'order-complete':
				PageModuleClass = require('./pages/order/Complete.js');
				break;
		// [E] 주문서 작성 order


		// [S] 마이커먼 myPage
			// 마이커먼 index
			case 'myPage':
				PageModuleClass = require('./pages/myPage/Index.js');
				break;

			// 주문배송 목록 order
			case 'myPage-order':
				PageModuleClass = require('./pages/myPage/Order.js');
				break;

			// 주문배송 상세 orderDetail
			case 'myPage-orderDetail':
				PageModuleClass = require('./pages/myPage/OrderDetail.js');
				break;

			// 교환/반품내역 return
			case 'myPage-return':
				PageModuleClass = require('./pages/myPage/Return.js');
				break;

			// 시공상품 내역 myService
			case 'myPage-myService':
				PageModuleClass = require('./pages/myPage/MyService.js');
				break;

			// 시공상품 상세 myServiceDetail
			case 'myPage-myServiceDetail':
				PageModuleClass = require('./pages/myPage/MyServiceDetail.js');
				break;

			// 최근 본 상품 recentSeenItem
			case 'myPage-recentSeenItem':
				PageModuleClass = require('./pages/myPage/RecentSeenItem.js');
				break;

			// 1:1 메시지 message
			case 'myPage-message':
				PageModuleClass = require('./pages/myPage/Message.js');
				break;

			// 1:1 메시지 상세	messageDetail
			case 'myPage-messageDetail':
				PageModuleClass = require('./pages/myPage/MessageDetail.js');
				break;

			// 내 의견묻기	myQnA
			case 'myPage-myQnA':
				PageModuleClass = require('./pages/myPage/MyQnA.js');
				break;

			// 내가 작성한 리뷰	review
			case 'myPage-review':
				PageModuleClass = require('./pages/myPage/Review.js');
				break;

			// 리뷰 작성	reviewWrite
			case 'myPage-reviewWrite':
				PageModuleClass = require('./pages/myPage/ReviewWrite.js');
				break;

			// 리뷰 편집	reviewEdit
			case 'myPage-reviewEdit':
				PageModuleClass = require('./pages/myPage/ReviewEdit.js');
				break;

			// 내 정보	profile
			case 'myPage-profile':
				PageModuleClass = require('./pages/myPage/Profile.js');
				break;

			// 내 정보 수정	profileEdit
			case 'myPage-profileEdit':
				PageModuleClass = require('./pages/myPage/ProfileEdit.js');
				break;

			// 회원탈퇴	resign
			case 'myPage-resign':
				PageModuleClass = require('./pages/myPage/Resign.js');
				break;

			// 비밀번호 변경	editPassword
			case 'myPage-editPassword':
				PageModuleClass = require('./pages/myPage/EditPassword.js');
				break;

			// 홈서비스 내역 조회	homeService
			case 'myPage-homeService':
				PageModuleClass = require('./pages/myPage/HomeService.js');
				break;

			// 홈서비스 내역 상세/세탁 - 홈서비스 내역 상세/이사	homeServiceDetail
			case 'myPage-homeServiceDetail':
				PageModuleClass = require('./pages/myPage/HomeServiceDetail.js');
				break;

			// 홈서비스 취소내역 조회	homeServiceCancel
			case 'myPage-homeServiceCancel':
				PageModuleClass = require('./pages/myPage/HomeServiceCancel.js');
				break;

			// 알림	notice
			case 'myPage-notice':
				PageModuleClass = require('./pages/myPage/Notice.js');
				break;

			// 스크랩/글 - 스크랩/이미지	scrap
			case 'myPage-scrap':
				PageModuleClass = require('./pages/myPage/Scrap.js');
				break;

			// 스크랩 이미지 목록	scrapImage
			case 'myPage-scrapImage':
				PageModuleClass = require('./pages/myPage/ScrapImage.js');
				break;

			// 스크랩 이미지 폴더 목록	scrapFolder
			case 'myPage-scrapFolder':
				PageModuleClass = require('./pages/myPage/ScrapFolder.js');
				break;

			// 팔로잉	following
			case 'myPage-following':
				PageModuleClass = require('./pages/myPage/Following.js');
				break;

			// 마이카트/뉴폼 상품	myCartNewForm
			case 'myPage-myCartNewForm':
				PageModuleClass = require('./pages/myPage/MyCartNewForm.js');
				break;

			// 마이카트/샵 상품	myCartShop
			case 'myPage-myCartShop':
				PageModuleClass = require('./pages/myPage/MyCartShop.js');
				break;

			// 포인트	point
			case 'myPage-point':
				PageModuleClass = require('./pages/myPage/Point.js');
				break;
		// [E] 마이커먼 myPage

		default:
			PageModuleClass = require('./pages/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init(pageId);
});