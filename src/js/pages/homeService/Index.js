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

	var defParams = {
		minWidth : 1240,
		navi : '#hmNav'
	};
	var opts;
	var navi;
	var naviMarginLeft;
	
	var loginController = require('../../controller/LoginController');
	var loginDataModel = require('../../model/LoginModel');
	var loginData;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		debug.log(fileName, $, util);

		$('#fullpage').fullpage({
			anchors: ['intro', 'move', 'cleaning', 'washing'],
			menu: '#hmNavLi',
			css3: true,
			scrollBar: true,
			onLeave : function(index, nextIndex, direction){
				if(index != 2){
					//moving the nav
					$('#hmNav').find('ul').removeClass('moveCenter').addClass('moveCenter');
				} else if (index == 2 && direction == 'up') {
					$('#hmNav').find('ul').removeClass('moveCenter');
				} $('.textBox').hide();
			},
			afterLoad: function(anchorLink/*, index*/){
				// var loadedSection = $(this);
				//using anchorLink
				if(anchorLink != 'intro'){
					$('.textBox').delay(200).fadeIn();
				} 
			}
		});

		opts = $.extend(true, defParams, window.jQuery);
		navi = $('body').find(opts.navi);
		naviMarginLeft = parseInt(navi.css('margin-left').split('px')[0]);

		onScrollListener();
		$(window).on('scroll resize', onScrollListener);

		$('#requestMoving').click(function(e){
			e.preventDefault();
			loginData = loginDataModel.loginData();
			if (loginData.stateCode == 'BM_MEM_STATE_01') {
				$(document).trigger('verifyMember', ['LIVING']);
			} else {
				location.href = 'requestMoving.html';
			}
		});
	}

	function onScrollListener() {
		var winWidth = util.winSize().w,
		scrLeft = $(document).scrollLeft();

		if (winWidth <= opts.minWidth) {
			navi.css({
				'left': opts.minWidth/2,
				'margin-left': naviMarginLeft + (scrLeft*-1)
			});
		} else {
			navi.css({
				'left': '',
				'margin-left': ''
			});
		}
	}
	
};