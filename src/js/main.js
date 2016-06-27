/* global $ */
/* jshint node: true, strict: true */

var pageId;
var pageModule;

$(document).ready(function() {
	'use strict';

	var PageModuleClass;
	pageId = $('body').data('pageId');
	
	switch(pageId) {
		// [S] index
		case 'index':
			PageModuleClass = require('./pages/Index.js');
			break;
		// [E] index

		case 'member-login':
			PageModuleClass = require('./pages/member/Login.js');
			break;
		case 'member-logout':
			PageModuleClass = require('./pages/member/Logout.js');
			break;
			break;
		case 'member-findLoginInformation':
			PageModuleClass = require('./pages/member/FindLoginInformation.js');
			break;
		case 'member-findLoginPwReset':
			PageModuleClass = require('./pages/member/ResetPassword.js');
			break;

			
		case 'magazine-list':
			PageModuleClass = require('./pages/magazine/MagazineList.js');
			break;
		

		// [S] living
			// 4-카테고리
			case 'living-category':
				PageModuleClass = require('./pages/living/Category.js');
				break;
		// [E] living
		
		
		// [S] QnA 				11-의견묻기
		case 'qna':
			PageModuleClass = require('./pages/QnA/QnA.js');
			break;
		// [E] QnA 				11-의견묻기
		

		// [S] myPage 			13-마이홈즈
		case 'myPage':
			PageModuleClass = require('./pages/myPage/MyPage.js');
			break;
		case 'myPage-editInfo':
			PageModuleClass = require('./pages/myPage/ProfileEdit.js');
			break;
		case 'myPage-myService':
			PageModuleClass = require('./pages/myPage/MyService.js');
			break;
		case 'myPage-myServiceDetail':
			PageModuleClass = require('./pages/myPage/MyServiceDetail.js');
			break;
		case 'myPage-order':
			PageModuleClass = require('./pages/myPage/Order.js');
			break;
		case 'myPage-return':
			PageModuleClass = require('./pages/myPage/Return.js');
			break;
		case 'myPage-point':
			PageModuleClass = require('./pages/myPage/Point.js');
			break;
		// [E] myPage 			13-마이홈즈

		case 'livingService':
			PageModuleClass = require('./pages/livingService/livingService.js');
			break;

		// [S] order 			14-주문서 작성
		case 'order-orderService':
			PageModuleClass = require('./pages/order/OrderService.js');
			break;
		// [E] order 			14-주문서 작성


		default:
			PageModuleClass = require('./pages/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init(pageId);
});