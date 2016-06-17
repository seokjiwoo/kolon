/* global $ */
/* jshint node: true, strict: true */

var pageId;
var pageModule;

$(document).ready(function() {
	'use strict';

	var PageModuleClass;
	pageId = $('body').data('pageId');
	
	switch(pageId) {
		case 'member-login':
			PageModuleClass = require('./pages/Login.js');
			break;
		case 'member-logout':
			PageModuleClass = require('./pages/Logout.js');
			break;
		case 'member-join':
			PageModuleClass = require('./pages/Join.js');
			break;
		case 'member-findLoginInformation':
			PageModuleClass = require('./pages/FindLoginInformation.js');
			break;
		case 'member-findLoginPwReset':
			PageModuleClass = require('./pages/ResetPassword.js');
			break;


		// [S] living
			// 4-카테고리
			case 'living-category':
				PageModuleClass = require('./pages/living/Category.js');
				break;
		// [E] living
		

		// [S] myPage 			13-마이홈즈
		case 'mypage':
			PageModuleClass = require('./pages/myPage/MyPage.js');
			break;
		case 'myServiceDetail':
			PageModuleClass = require('./pages/myPage/MyServiceDetail.js');
			break;
		// [E] myPage 			 - 마이홈즈


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
	pageModule.init();
});