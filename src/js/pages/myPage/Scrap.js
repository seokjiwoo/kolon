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

	var CardList = require('../../components/CardList.js');
	var cardList;

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
		cardList = CardList();
		cardList.init();

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
			case 'all':
			default:
				cardList.removeAllData();
				controller.scrapList('ALL');
				break;
			case 'product':
				cardList.removeAllData();
				controller.scrapList('PRODUCT');
				break;
			case 'magazine':
				cardList.removeAllData();
				controller.scrapList('MAGAZINE');
				break;
			case 'images':
				cardList.removeAllData();
				// controller.scrapList('IMAGE');
				// controller.scrapImageList(hashVars.folderNumber);
				if (hashVars.folderNumber || hashVars.scrapNumber) {
					controller.scrapImageList(hashVars.folderNumber || hashVars.scrapNumber);
				} else {
					controller.scrapList('IMAGE');
				}
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
		insertElements = $(template(data.data));

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
		result = response;

		switch(eventType) {
			case SCRAP_EVENT.LIST:
				debug.log(result.data.scraps);
				cardList.appendData(result.data.scraps);
				$('.removeScrap').show();
				break;
			case SCRAP_EVENT.DELETE_SCRAP:
				if (status == 200) {
					location.reload(true);
				} else {
					alert(status+': '+response.message);
				}
				break;

			case SCRAP_EVENT.IMAGE_LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData($(self.opts.templates.images), result);
				break;
			case SCRAP_EVENT.EDIT_SCRAP:
				debug.log(fileName, 'onControllerListener', eventType, status, response);

				testResult();
				break;
			case SCRAP_EVENT.ADD_SCRAP_FOLDER:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
			case SCRAP_EVENT.EDIT_SCRAP_FOLDER:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
			case SCRAP_EVENT.DELETE_SCRAP_FOLDER:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				testResult();
				break;
		}
	}

	function testResult() {
		//win.location.reload();
	}

	/**
	 * 스크랩 삭제
	 */
	function onDeleteScrap(e) {
		e.preventDefault();

		debug.log(fileName, 'onDeleteScrap', $(e.target), self.selPopBtnInfo.target.data().scrapNumber);
		controller.deleteScrap(self.selPopBtnInfo.target.data().scrapNumber);
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