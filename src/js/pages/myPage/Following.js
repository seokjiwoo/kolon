/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Following.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/MyPageController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	FOLLOWING_EVENT = events.FOLLOWING,
	ALERTPOPUP_EVENT = events.ALERT_POPUP;

	// 임시 테스트 구성
	var ApiClass = require('../../controller/APIController.js'),
	Api = ApiClass(),
	controller = Api;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		followBtnWrap : '.js-follow-btn-wrap',
		followBtn : '.js-follow-btn',
		search : {
			form : '.js-search-form',
			inp : '.js-inp',
			btn : '.js-btn'
		},
		templates : {
			wrap : '.recordWrap',
			template : '#follow-list-templates'
		},
		colorbox : '#colorbox',
		followDismiss : {
			wrap : 'followDismiss',
			name : '.js-dismiss-name',
			submit : '.js-dismiss-submit'
		},
		cssClass : {
			isHide : 'is-hide',
			isLoading : 'is-loading',
			isFollow : 'is-follow',
			hasAnimate : 'has-animate'
		},
		dataAttr : {
			followInfo : '[data-follow-info]'
		}
	};
	
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		// 임시 테스트 구성 - 팔로잉 리스트 조회
		Api.callApi('/apis/follows', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(controller).trigger('followsListResult', [status, result]);
			} else {
				Api.handleError('followsList', result);
				$(controller).trigger('followsListResult', [status, result]);
			}
		}, true);
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.searchForm = $(self.opts.search.form);
		self.searchInp = self.searchForm.find(self.opts.search.inp);
		self.searchBtn = self.searchForm.find(self.opts.search.btn);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(controller).on(FOLLOWING_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		self.templatesWrap.on('click', self.opts.followBtn, onWrapFollowBtnClick);
		self.searchForm.on('submit', function(e) {e.preventDefault();});
		self.searchInp.on('keydown', onSearchInpKeydwn);
		self.searchBtn.on('click', onSearchBtnClick);
	}

	function onWrapFollowBtnClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		wrap = target.closest(self.opts.followBtnWrap),
		isFollow = wrap.hasClass(self.opts.cssClass.isFollow),
		info = target.closest(self.opts.dataAttr.followInfo).data('follow-info');

		self.selPopBtnInfo = {
			target : target,
			wrap : wrap,
			info : info
		};

		if (!isFollow) {
			// 임시 테스트 구성 - 팔로우 하기
			Api.callApi('/apis/follows', 'POST', {
				'followTargetCode' : 'string',
				'followTargetNumber' : info.followNumber,
				'followTargetSectionCode' : 'string'
			}, function(status, result) {
				if (status == 200) {
					$(controller).trigger('addFollowsResult', [status, result]);
				} else {
					Api.handleError('addFollows', result);
					$(controller).trigger('addFollowsResult', [status, result]);
				}
			}, true);
			wrap.addClass(self.opts.cssClass.isFollow);

			debug.log(fileName, 'onWrapPopBtnClick', isFollow, info);
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);

								var list = self.templatesWrap.find(self.opts.dataAttr.followInfo);
								$.each(list, function(index) {
									;(function(target, delay) {
										win.setTimeout(function() {
											target.addClass(self.opts.cssClass.hasAnimate);
										}, delay);
									})($(this),index * 100);
								});
							});
	}

	function onAutoCompleteSelect(e, ui) {
		if (ui.value) {
			sortingFollow(ui.value, true);
		}
	}

	function onSearchInpKeydwn(e) {
		if (e.which && e.which === $.ui.keyCode.ENTER) {
			sortingFollow(self.searchInp.val());
		}
	}

	function onSearchBtnClick(e) {
		e.preventDefault();
		sortingFollow(self.searchInp.val());
	}

	function sortingFollow(str, autocomplete) {
		if (!str || str === ' ') {
			eventManager.trigger(ALERTPOPUP_EVENT.OPEN, ['ID 혹은 소속을 입력하세요.', '', '확인']);
			return;
		}

		var list = self.templatesWrap.find(self.opts.dataAttr.followInfo),
		info, isVisible;

		$.each(list, function() {
			info = $(this).data('follow-info');
			isVisible = false;
			if (autocomplete) {
				if (info.coperationName === str || info.memberName === str) {
					isVisible = true;
				}
			} else {
				if (info.coperationName.indexOf(str) != -1 || info.memberName.indexOf(str) != -1) {
					isVisible = true;	
				}
			}

			if (isVisible) {
				$(this).removeClass(self.opts.cssClass.isHide);
			} else {
				$(this).addClass(self.opts.cssClass.isHide);
			}
		});

		self.searchInp.blur();

		list = self.templatesWrap.find(self.opts.dataAttr.followInfo).filter(':not(.' + self.opts.cssClass.isHide + ')');
		if (!list.size()) {
			eventManager.trigger(ALERTPOPUP_EVENT.OPEN, ['해당 항목이 없습니다.', '', '확인', function() {
				self.templatesWrap.find(self.opts.dataAttr.followInfo).removeClass(self.opts.cssClass.isHide);
				self.searchInp.val('');
				$('#cboxClose').triggerHandler('click');
			}]);
		} else {
			$.each(list, function(index) {
				$(this).removeClass(self.opts.cssClass.hasAnimate);
				;(function(target, delay) {
					win.setTimeout(function() {
						target.addClass(self.opts.cssClass.hasAnimate);
					}, delay);
				})($(this),index * 100);
			});
		}
	}

	function displayFilter(data) {
		var availableTags = [];

		$.map(data, function(item) {
			availableTags.push(item.coperationName);
			availableTags.push(item.memberName);
		});

		if (self.searchInp.autocomplete('instance')) {
			self.searchInp.autocomplete('destroy');
		}

		self.searchInp.autocomplete({
			source : util.arrayUnique(availableTags),
			select : onAutoCompleteSelect
		});
	}

	function onFollowDismiss(e) {
		e.preventDefault();

		// 임시 테스트 구성 - 팔로잉 취소
		Api.callApi('/apis/follows/' + self.selPopBtnInfo.info.followNumber, 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(controller).trigger('deleteFollowsResult', [status, result]);
			} else {
				Api.handleError('deleteFollows', result);
				$(controller).trigger('deleteFollowsResult', [status, result]);
			}
		}, true);
	}

	function setFollowDismiss() {
		if (self.colorbox.hasClass(self.opts.followDismiss.wrap)) {
			self.colorbox.find(self.opts.followDismiss.name).html(self.selPopBtnInfo.info.memberName || self.selPopBtnInfo.info.coperationName);
			self.colorbox.find(self.opts.followDismiss.submit).on('click', onFollowDismiss);
		}
	}

	function destroyFollowDismiss() {
		self.selPopBtnInfo = {};

		if (self.colorbox.hasClass(self.opts.followDismiss.wrap)) {
			self.colorbox.find(self.opts.followDismiss.submit).off('click', onFollowDismiss);
		}
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case FOLLOWING_EVENT.LIST:
				dummyData = [{"coperationName":"KOLON GLOBAL0","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName1","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"KOLON GLOBAL2","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName2","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"KOLON GLOBAL3","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName3","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"KOLON GLOBAL0","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName1","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"KOLON GLOBAL2","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName2","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"},{"coperationName":"KOLON GLOBAL3","followNumber":0,"imageFileUrl":"/images/temp01.jpg","memberName":"memberName3","memberNumber":0,"recentImages":[{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"},{"createDateTime":"string","imageRecentUrl":"/images/temp01.jpg"}],"summaryIntro":"string"}];

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					// case 200:
					// 	break;
					default:
						result = dummyData;
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				displayFilter(result);
				break;
			case FOLLOWING_EVENT.ADD_FOLLOW:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
			case FOLLOWING_EVENT.DELETE_FOLLOW:
				self.selPopBtnInfo.wrap.removeClass(self.opts.cssClass.isFollow);
				$('#cboxClose').triggerHandler('click');
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				setFollowDismiss();
				break;
			case COLORBOX_EVENT.CLEANUP:
				destroyFollowDismiss();
				break;
		}
	}

};