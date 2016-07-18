/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'member/AccountInformation.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();

	var controller = require('../../controller/MemberInfoController');

	var memberNumber;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		memberNumber = util.getUrlVar().memberNumber;
		
	};

	function getMemberInformationHandler(e, status, result) {
		console.log(result);

		//renderData(magazineData, '#description-templates', '#description-wrap', true);
	};

	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};
};