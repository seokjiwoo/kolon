/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'homeService/Index.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var loginDataModel = require('../../model/LoginModel');
	var loginData;

	var opts = {
		menuTabs : '.js-menu-tab a',
		submitBtns : '[data-submit-role]',
		cssClass : {
			isShow : 'is-show'
		}
	};
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	}, self;
	
	return callerObj;
	
	function init() {
		Super.init();

		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		var hash = win.location.hash;
		if (hash && $(hash)) {
			$('.js-menu-tab a[href=\'' + hash + '\']').trigger('click');
		}
	}

	function setElements() {
		self.htmlBody = $('html, body');
		self.menuTabs = $(self.opts.menuTabs);
		self.submitBtns = $(self.opts.submitBtns);
	}

	function setBindEvents() {
		self.menuTabs.on('click', onActiveTabs);
		self.submitBtns.on('click', onSubmitClick);
	}

	function onSubmitClick(e) {
		var target = $(e.currentTarget),
		role = target.data('submit-role');

		debug.log(fileName, 'onSubmitClick', target, role);

		switch(role) {
			case '#move':
				e.preventDefault();
				onRequestMoving();
				break;
			case '#washing':
				e.preventDefault();
				break;
		}
	}

	function onActiveTabs(e) {
		var target = $(e.currentTarget),
		hash = target.attr('href'),
		scrollTop = $(win).scrollTop();

		win.location.hash = hash;
		$(win).scrollTop(scrollTop);

		if ($(hash).size()) {
			self.htmlBody.animate({scrollTop : $(hash).offset().top - target.outerHeight()});

			self.submitBtns.removeClass(self.opts.cssClass.isShow);
			self.submitBtns.filter('[data-submit-role=\'' + hash + '\']').addClass('is-show');
		}
	}

	function onRequestMoving() {
		loginData = loginDataModel.loginData();
		if (!loginData) {
			win.alert('로그인이 필요합니다.');
			win.location.href = '/member/login.html';
		} else if (loginData.stateCode === 'BM_MEM_STATE_01') {
			$(document).trigger('verifyMember', ['LIVING']);
		} else {
			win.location.href = 'requestMoving.html';
		}
	}
	
};