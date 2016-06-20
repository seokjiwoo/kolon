/* global $ */

var pageId;
var pageModule;

$(document).ready(function() {
	var PageModuleClass;
	pageId = $('body').data('pageId');
	
	switch(pageId) {
	
		default:
			PageModuleClass = require('./pagesMobile/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init(pageId);
});