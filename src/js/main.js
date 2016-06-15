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
		case 'order-orderService':
			PageModuleClass = require('./pages/OdOrderService.js');
			break;
		case 'living-category':
			PageModuleClass = require('./pages/LivingCategory.js');
			break;
		default:
			PageModuleClass = require('./pages/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init();
});