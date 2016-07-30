/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/ScrapImage.js';

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
		cardWrap : '#cardWrap',
		templates : {
			imagesWrap : '#scrapImg',
			images : '#scrap-images-templates',
			carouselWrap : '.js-scrapCarousel-container',
			carousel : '#scrap-carousel-templates'
		},
		colorbox : '#colorbox',
		imagesFolder : {
			wrap : 'scrapFolderImages'
		},
		removeFolder : {
			wrap : 'scrapFolderRemove',
			submit : '.js-scrapFolderRemove-submit'
		},
		editScrap: {
			wrap : 'scrapEdit',
			removeButton: '#removeCardButton',
			submit : '#scrapEditForm'
		},
		removeScrap : {
			wrap : 'scrapRemove',
			submit : '.js-scrapFolderRemove-submit'
		},
		cssClass : {
			isLoading : 'is-loading'
		},
		carousel : {
			wrap : '.js-slider-wrap',
			area : '.js-slider-area',
			pager : '.js-slider-pager',
			bxSliderOpts : {
			},
			cssClass : {
				isCustomPager : 'is-custom-pager'
			}
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

		cardList = CardList();
		cardList.init();

		setElements();
		setBindEvents();
		controller.scrapImageList(util.getUrlVar('folderNumber'));

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
		self.templatesWrap = self.container.find(self.opts.templates.imagesWrap);
		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
		self.isCarouselMode = false;
		self.carousels = [];
	}


	function setBindEvents() {
		$(controller).on(SCRAP_EVENT.WILD_CARD, onScrapControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);

		self.templatesWrap.on('click', self.opts.dataAttr.popBtn, onWrapPopBtnClick);
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

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var templates,
		wrap;

		if (self.isCarouselMode) {
			templates = $(self.opts.templates.carousel);
			wrap = $(self.opts.templates.carouselWrap);
		} else {
			templates = $(self.opts.templates.images);
			wrap = $(self.opts.templates.imagesWrap);
		}

		var source = templates.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		if (self.isCarouselMode) {
			wrap.empty()
				.addClass(self.opts.cssClass.isLoading)
				.append(insertElements);

			setCarousel();

			wrap.imagesLoaded()
					.always(function() {
						wrap.removeClass(self.opts.cssClass.isLoading);
						reloadCarousel();
						eventManager.triggerHandler(ISOTOPE_EVENT.REFRESH);
						eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
						eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
					})
					.progress(function(instance, image) {
						var item = $(image.img).closest('.js-slider-list');

						if (image.isLoaded) {
							item.removeClass('is-loading');	
						} else {
							item.removeClass('is-loading').addClass('is-broken');
						}
					});
		} else {
			eventManager.triggerHandler(ISOTOPE_EVENT.DESTROY);
			wrap.empty()
				.addClass(self.opts.cssClass.isLoading)
				.append(insertElements);

			wrap.imagesLoaded()
				.always(function() {
					wrap.removeClass(self.opts.cssClass.isLoading);
					eventManager.triggerHandler(ISOTOPE_EVENT.REFRESH);
					eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
				});
		}
	}

	function setCarousel() {
		var wrap, pager, bxSliderOpts, carousel;

		$.each(self.colorbox.find(self.opts.carousel.area), function() {
			wrap = $(this).closest(self.opts.carousel.wrap);
			pager = wrap.find(self.opts.carousel.pager);

			if (pager.size()) {
				bxSliderOpts = $.extend({}, self.opts.carousel.bxSliderOpts, {
					pagerCustom : pager
				});

				wrap.addClass(self.opts.carousel.cssClass.isCustomPager);
			} else {
				bxSliderOpts = self.opts.carousel.bxSliderOpts;

				wrap.removeClass(self.opts.carousel.cssClass.isCustomPager);
			}

			carousel = $(this).bxSlider(bxSliderOpts);
			self.carousels.push(carousel);
			eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);
		});
	}

	function reloadCarousel() {
		$.map(self.carousels, function(carousel) {
			carousel.reloadSlider();
		});
	}

	function destroyCarousel() {
		$.map(self.carousels, function(carousel) {
			carousel.destroySlider();
		});
	}

	function onScrapControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case SCRAP_EVENT.LIST:
				var tags = '<option value="" selected="selected">폴더 이동</option>';
				$.each(result.data.scraps, function(key, each) {
					tags += '<option value="'+each.folderNumber+'">'+each.folderName+'</option>';
				});
				$('#scrapTargetFolderSelect').html(tags);
				break;
			case SCRAP_EVENT.IMAGE_LIST:
				result.data.folderName = util.getUrlVar('folderName');
				result.data.folderNumber = util.getUrlVar('folderNumber');
				result.data.scrapCount = result.data.scrapImages.length;

				if (self.isCarouselMode) {
					//result = {"folders":[{"folderName":"폴더1","folderNumber":0,"recentImageTitle":"string","recentImageUrl":"string","scrapCount":6,"scrapImages":[{"imageTitle":"string","imageUrl":"https://pixabay.com/static/uploads/photo/2016/06/10/22/25/ortler-1449018_960_720.jpg"},{"imageTitle":"string","imageUrl":"https://pixabay.com/static/uploads/photo/2014/03/23/12/19/solda-293200_960_720.jpg"},{"imageTitle":"string","imageUrl":"https://pixabay.com/static/uploads/photo/2014/02/18/23/31/mountain-269547_960_720.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp11.jpg"},{"imageTitle":"string","imageUrl":"../images/temp111.jpg"}]}],"scraps":[{"category":"string","imageUrl":"string","magazine":{"createDate":"string","subTitle":"string","title":"string"},"product":{"price":0,"productDesc":"string","productName":"string"},"scrapCount":0,"scrapNumber":0,"seller":{"companyName":"string","sellerImageUrl":"string","sellerName":"string"},"tags":["string"]}]};
				}

				displayData(result.data);
				if (!self.isCarouselMode) $('.editScrap').show();
				break;
			case SCRAP_EVENT.DELETE_SCRAP:
				if (status == 200) {
					location.reload(true);
				} else {
					alert(status+': '+response.message);
				}
				break;
			case SCRAP_EVENT.EDIT_SCRAP:
				if (status == 200) {
					location.reload(true);
				} else {
					alert(status+': '+response.message);
				}
				break;
			case SCRAP_EVENT.DELETE_SCRAP_FOLDER:
				debug.log(fileName, 'onScrapControllerListener', eventType, status, response);
				location.reload(true);
				break;
		}
	}

	/**
	 * 스크랩 폴더 삭제
	 */
	function onDeleteFolder(e) {
		e.preventDefault();

		var target = $(e.target),
		// 스크랩 유무에 따른 - 문구 처리
		message = (self.selPopBtnInfo.info.scrapCount) ? '해당 폴더를 삭제하실 경우에는\n폴더 안의 모든 이미지도 삭제됩니다!' : '해당 폴더를 삭제하시겠습니까?',
		isAllow;

		// 카드 타입 - 문구 처리
		message = (self.colorbox.hasClass(self.opts.removeFolder.wrap)) ? '해당 카드를 삭제하시겠습니까?' : message;
		
		isAllow = win.confirm(message);

		if (!isAllow) {
			return;
		}

		debug.log(fileName, 'onDeleteFolder', target, self.selPopBtnInfo);
		controller.deleteScrapFolder(self.selPopBtnInfo.info.folderNumber);
	}

	function setColoboxFolder() {
		if (self.colorbox.hasClass(self.opts.imagesFolder.wrap)) {
			self.isCarouselMode = true;
			self.carousels = [];
			controller.scrapImageList(self.selPopBtnInfo.info.folderNumber);
		}

		if (self.colorbox.hasClass(self.opts.removeFolder.wrap)) {
			self.colorbox.find(self.opts.removeFolder.submit).on('click', onDeleteFolder);
		}

		if (self.colorbox.hasClass(self.opts.editScrap.wrap)) {
			self.colorbox.find(self.opts.editScrap.removeButton).on('click', function(e){
				e.preventDefault();
				MyPage.Super.Super.htmlPopup('/_popup/popScrapDel.html', 540, 'popEdge scrapRemove');
			});
			self.colorbox.find(self.opts.editScrap.submit).on('submit', function(e){
				e.preventDefault();
				controller.editScrap(self.selPopBtnInfo.target.data().scrapNumber, $('#scrapTargetFolderSelect').pVal());
			});
			controller.scrapList('IMAGE');
		}
		
		if (self.colorbox.hasClass(self.opts.removeScrap.wrap)) {
			self.colorbox.find(self.opts.removeScrap.submit).on('click', onDeleteScrap);
		}

		debug.log(fileName, 'setColoboxFolder');
	}

	function destroyColoboxFolder() {
		if (self.colorbox.hasClass(self.opts.imagesFolder.wrap)) {
			self.isCarouselMode = false;
			destroyCarousel();
			self.carousels = [];
		}

		debug.log(fileName, 'setColoboxFolder');
	}

	/**
	 * 스크랩 삭제
	 */
	function onDeleteScrap(e) {
		e.preventDefault();
		debug.log(fileName, 'onDeleteScrap', $(e.target), self.selPopBtnInfo.target.data().scrapNumber);
		controller.deleteScrap(self.selPopBtnInfo.target.data().scrapNumber);
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