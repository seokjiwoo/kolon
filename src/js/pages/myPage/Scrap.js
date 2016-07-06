/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Scrap.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/ScrapController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	SCRAP_EVENT = events.SCRAP,
	COLORBOX_EVENT = events.COLOR_BOX,
	ISOTOPE_EVENT = events.ISOTOPE,
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		container : '.container',
		categoryMenu : '.tabType01 a',
		cardWrap : '#cardWrap',
		templates : {
			wrap : '#scrapAll',
			all : '#scrap-all-templates',
			images : '#scrap-images-templates'
		},
		colorbox : '#colorbox',
		editFolder : {
			wrap : 'scrapFolderEdit',
			inp : '.js-scrapFolderEdit-inp',
			delete : '.js-scrapFolderEdit-delete',
			submit : '.js-scrapFolderEdit-submit'
		},
		newFolder : {
			wrap : 'scrapFolderNew',
			inp : '.js-scrapFolderNew-inp',
			submit : '.js-scrapFolderNew-submit'
		},
		removeFolder : {
			wrap : 'scrapFolderRemove',
			submit : '.js-scrapFolderRemove-submit'
		},
		scrap : {
			wrap : 'scrapRemove',
			submit : '.js-scrapFolderRemove-submit'
		},
		cssClass : {
			isLoading : 'is-loading'
		},
		dataAttr : {
			popBtn : '[data-user-class]',
			scrapFolderInfo : '[data-scrapfolder-info]'
		}
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util, controller);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		// controller Method
		// scrapList(attr) - 스크랩 카드 목록
		// scrapImageList(folderNumber) - 스크랩 이미지 목록
		// addScrap(folderNumber, targetCode, targetNumber) - 스크랩 등록
		// editScrap(scrapNumber, folderNumber) - 스크랩 수정
		// deleteScrap(scrapNumber) - 스크랩 삭제
		// addScrapFolder(folderName) - 스크랩 폴더 등록
		// editScrapFolder(folderNumber, folderName) - 스크랩 폴더 수정
		// deleteScrapFolder(folderNumber) - 스크랩 폴더 삭제
	}

	function setElements() {
		self.container = $(self.opts.container);
		self.templatesWrap = self.container.find(self.opts.templates.wrap);
		self.categoryMenu = self.container.find(self.opts.categoryMenu);
		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}


	function setBindEvents() {
		$(controller).on(SCRAP_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		self.categoryMenu.on('click', onCategoryMenuClick);
		self.templatesWrap.on('click', self.opts.dataAttr.popBtn, onWrapPopBtnClick);

		$(win).on('hashchange', onHashChangeListener);
		$(win).trigger('hashchange');
	}

	function onCategoryMenuClick(e) {
		var target = $(e.currentTarget),
		parent = target.closest('li'),
		href = target.attr('href'),
		category = util.getHashVar('category', href);

		if (href && category) {
			parent.addClass('on')
					.siblings('li').removeClass('on');

			debug.log(fileName, 'onCategoryMenuClick', category);
		}
	}

	function onWrapPopBtnClick(e) {
		var target = $(e.target),
		info = target.closest(self.opts.dataAttr.scrapFolderInfo).data('scrapfolder-info');

		self.selPopBtnInfo = {
			target : target,
			info : info
		};

		debug.log(fileName, 'onWrapPopBtnClick', self.selPopBtnInfo);
	}

	// hash change
	function onHashChangeListener() {
		var hashVars = util.getHashVar();

		debug.log(fileName, 'onHashChangeListener', hashVars, hashVars.category);

		activePageMenu(hashVars.category);

		switch(hashVars.category) {
			// 모든 스크랩
			case 'all':
				controller.scrapList('ALL');
				break;
			// 뉴폼/샵
			case 'product':
				controller.scrapList('PRODUCT');
				break;
			// 메거진
			case 'magazine':
				controller.scrapList('MAGAZINE');
				break;
			// 이미지
			case 'images':
				controller.scrapImageList(hashVars.folderNumber);
				// if (hashVars.folderNumber) {
				// 	controller.scrapImageList(hashVars.folderNumber);
				// } else {
				// 	controller.scrapList('IMAGE');
				// }
				break;
			// 모든 스크랩
			default:
				controller.scrapList('ALL');
				break;
		}
	}

	// tab Active 처리
	function activePageMenu(category) {
		if (category) {
			$('.tabType01 a[href=\'/myPage/scrap.html#category=' + category + '\']').trigger('click');
		} else {
			$('.tabType01 a[href=\'/myPage/scrap.html#category=all\']').trigger('click');
		}
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(templates, data) {
		var source = templates.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		eventManager.triggerHandler(ISOTOPE_EVENT.DESTROY);
		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(ISOTOPE_EVENT.REFRESH);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case SCRAP_EVENT.LIST:
				dummyData={"folders":[{"folderName":"folder0","folderNumber":0,"scrapCount":0,"scrapImages":["string"]},{"folderName":"folder1","folderNumber":1,"scrapCount":0,"scrapImages":["string"]}],"scraps":[{"category":"string","imageUrl":"string","scrapCount":0,"scrapNumber":0,"tags":["string"],"magazine":{"createDate":"string","subTitle":"string","title":"string"}},{"category":"string","imageUrl":"string","scrapCount":0,"scrapNumber":0,"tags":["string"],"product":{"price":0,"productDesc":"string","productName":"string"}},{"category":"string","imageUrl":"string","scrapCount":0,"scrapNumber":0,"tags":["string"],"seller":{"companyName":"string","sellerImageUrl":"string","sellerName":"string"},}]};

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
				displayData($(self.opts.templates.all), result);
				break;
			case SCRAP_EVENT.IMAGE_LIST:
				dummyData = {"folders":[{"folderName":"폴더1","folderNumber":0,"recentImageTitle":"string","recentImageUrl":"string","scrapCount":0,"scrapImages":[]},{"folderName":"폴더2","folderNumber":0,"recentImageTitle":"string","recentImageUrl":"string","scrapCount":5,"scrapImages":[{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"}]},{"folderName":"폴더3","folderNumber":0,"recentImageTitle":"string","recentImageUrl":"string","scrapCount":10,"scrapImages":[{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"}]},{"folderName":"폴더3","folderNumber":0,"recentImageTitle":"string","recentImageUrl":"string","scrapCount":1,"scrapImages":[{"imageTitle":"string","imageUrl":"../images/temp11.jpg"}]}],"scraps":[{"category":"string","imageUrl":"string","magazine":{"createDate":"string","subTitle":"string","title":"string"},"product":{"price":0,"productDesc":"string","productName":"string"},"scrapCount":0,"scrapNumber":0,"seller":{"companyName":"string","sellerImageUrl":"string","sellerName":"string"},"tags":["string"]}]};

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
				displayData($(self.opts.templates.images), result);
				break;
			case SCRAP_EVENT.ADD_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.EDIT_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.DELETE_SCRAP:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				204	No Content
				401	Unauthorized
				403	Forbidden
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.ADD_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.EDIT_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				201	Created
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.DELETE_SCRAP_FOLDER:
				/*
				{
					"status": "string",
					"message": "string",
					"errorCode": "string",
					"data": {}
				}
				204	No Content
				401	Unauthorized
				403	Forbidden
				 */
				switch(status) {
					case 200:
						break;
					default:
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
		}
	}

	function testResult() {
		win.alert('임시처리 결과처리 - location.reload');
		win.location.reload();
	}

	/**
	 * 스크랩 폴더 삭제
	 */
	function onDeleteFolder(e) {
		e.preventDefault();

		var target = $(e.target),
		// 스크랩 유무에 따른 - 문구 처리
		message = (self.selPopBtnInfo.info.scrapCount) ? '해당 폴더를 삭제하실 경우에는\n폴더 안의 모든 이미지도 삭제됩니다!' : '해당 폴더를 삭제하시겠습니까?',
		isAllow = win.confirm(message);

		if (!isAllow) {
			return;
		}

		debug.log(fileName, 'onDeleteFolder', target, self.selPopBtnInfo);
		controller.deleteScrapFolder(self.selPopBtnInfo.info.folderNumber);
	}


	/**
	 * 스크랩 폴더 수정
	 */
	function onEditFolder(e) {
		e.preventDefault();

		var target = $(e.target),
		inp = self.colorbox.find(self.opts.editFolder.inp);

		if (!inp.val() || inp.val() === ' ') {
			win.alert('폴더명을 입력하세요.');
			inp.focus();
			return;
		}
		
		if (inp.val() === self.selPopBtnInfo.info.folderName) {
			debug.log(fileName, 'onEditFolder - 폴더명 동일', target, self.selPopBtnInfo, inp.val());
		} else {
			debug.log(fileName, 'onEditFolder', target, self.selPopBtnInfo, inp.val());	
		}

		controller.editScrapFolder(self.selPopBtnInfo.info.folderNumber, inp.val());
	}

	/**
	 * 스크랩 폴더 등록
	 */
	function onNewFolder(e) {
		e.preventDefault();

		var target = $(e.target),
		inp = self.colorbox.find(self.opts.newFolder.inp);

		if (!inp.val() || inp.val() === ' ') {
			win.alert('폴더명을 입력하세요.');
			inp.focus();
			return;
		}

		debug.log(fileName, 'onNewFolder', target, self.selPopBtnInfo, inp.val());
		controller.addScrapFolder(inp.val());
	}

	/**
	 * 스크랩 삭제
	 */
	function onDeleteScrap(e) {
		e.preventDefault();

		var target = $(e.target),
		// 스크랩 유무에 따른 - 문구 처리
		message = '해당 카드를 삭제하시겠습니까?',
		isAllow = win.confirm(message);

		if (!isAllow) {
			return;
		}

		debug.log(fileName, 'onDeleteScrap', target, self.selPopBtnInfo);
		controller.deleteScrap(self.selPopBtnInfo.info.scrapNumber);
	}

	function setColoboxFolder() {
		if (self.colorbox.hasClass(self.opts.editFolder.wrap)) {
			self.colorbox.find(self.opts.editFolder.inp).attr('placeholder', self.selPopBtnInfo.info.folderName);
			self.colorbox.find(self.opts.editFolder.delete).on('click', onDeleteFolder);
			self.colorbox.find(self.opts.editFolder.submit).on('click', onEditFolder);
		}

		if (self.colorbox.hasClass(self.opts.newFolder.wrap)) {
			self.colorbox.find(self.opts.newFolder.submit).on('click', onNewFolder);
		}

		if (self.colorbox.hasClass(self.opts.removeFolder.wrap)) {
			self.colorbox.find(self.opts.removeFolder.submit).on('click', onDeleteFolder);
		}

		if (self.colorbox.hasClass(self.opts.scrap.wrap)) {
			self.colorbox.find(self.opts.scrap.submit).on('click', onDeleteScrap);
		}

		debug.log(fileName, 'setColoboxFolder');
	}

	function destroyColoboxFolder() {
		if (self.colorbox.hasClass(self.opts.editFolder.wrap)) {
			self.colorbox.find(self.opts.editFolder.delete).off('click', onDeleteFolder);
			self.colorbox.find(self.opts.editFolder.submit).off('click', onEditFolder);
		}

		if (self.colorbox.hasClass(self.opts.newFolder.wrap)) {
			self.colorbox.find(self.opts.newFolder.submit).off('click', onNewFolder);
		}

		if (self.colorbox.hasClass(self.opts.removeFolder.wrap)) {
			self.colorbox.find(self.opts.removeFolder.submit).off('click', onDeleteFolder);
		}

		if (self.colorbox.hasClass(self.opts.scrap.wrap)) {
			self.colorbox.find(self.opts.scrap.submit).off('click', onDeleteScrap);
		}

		debug.log(fileName, 'setColoboxFolder');
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				setColoboxFolder();
				break;
			case COLORBOX_EVENT.CLEANUP:
				destroyColoboxFolder();
				break;
		}
	}
};