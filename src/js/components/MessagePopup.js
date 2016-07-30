/* jshint node: true, strict: true */
module.exports = ClassMessagePopup().getInstance();

function ClassMessagePopup() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	APIController = require('../controller/APIController.js'),
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	imageUploader = require('./ImageUploader.js'),
	fileName = 'components/MessagePopup.js';

	var opinionsController = require('../controller/OpinionsController.js'),
	messageController = require('../controller/MessageController.js'),
	eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	MESSAGE_EVENT = events.MESSAGE,
	OPINIONS_EVENT = events.OPINIONS,
	COLORBOX_EVENT = events.COLOR_BOX;
	
	var uploadImageArray = [],
	uploadScrapNumbers = [],
	uploadScrapImageArrary = [],
	uploadFileNumber;
	
	var opts = {
		wrap : '.js-message-popup',
		message : {
			form : '.js-message-form',
			inp : '.js-message-inp',
			submit : '.js-message-submit'
		},
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			popAttachPictures : 'popAttachPictures',
			popScrapAdd : 'popScrapAdd'
		},
		imageUploader : {
			api_url : APIController().API_URL + '/apis/inquiries/images'
		}
	};

	var callerObj = {
		init : init,
		destroy : destroy,
		refresh : refresh
	},
	instance, self;
	
	return {
		getInstance: function() {
			if (!instance) instance = callerObj;
			return instance;
		}
	};
	
	function init(options) {
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = $.extend({}, opts, options);

		self.productNumber = util.getUrlVar().productNumber;
		if (self.productNumber == undefined) self.productNumber = 0;
		self.saleMemberNumber = util.getUrlVar().saleMemberNumber;

		setElements();
		setBindEvents();
	}

	function setElements() {
		self.colorbox = $(self.opts.colorbox.target);
		self.msgForm = $(self.opts.message.form);
		self.msgInp = self.msgForm.find(self.opts.message.inp);
		self.msgSubmit = self.msgForm.find(self.opts.message.submit);
	}

	function setBindEvents() {
		self.msgInp.on('keyup', checkLengthHandler);
		self.msgForm.on('submit', onSubmitPrevent);
		self.msgSubmit.on('click', onSubmitListener);

		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
		$(opinionsController).on(OPINIONS_EVENT.WILD_CARD, onControllerListener);
		$(messageController).on(MESSAGE_EVENT.WILD_CARD, onControllerListener);
	}

	function checkLengthHandler(e) {
		if (self.msgInp.val().length > 1000) {
			alert('내용은 1000자까지 작성할 수 있습니다.');
			self.msgInp.val( self.msgInp.val().substr(0, 1000) );
		}

		$('#messageLength').text(self.msgInp.val().length);
	}

	function onSubmitPrevent(e) {
		e.preventDefault();
	}

	function onSubmitListener(e) {
		e.preventDefault();
		
		if (!self.msgInp.val()) {
			win.alert('자세한 내용을 작성해 주세요.');
			return;
		}
		if (self.msgInp.val().length > 1000) {
			win.alert('내용은 1000자까지 작성할 수 있습니다.');
			return;
		}

		messageController.inquiries(
			self.msgInp.val(),
			uploadImageArray[0],
			uploadScrapImageArrary,
			self.saleMemberNumber,
			self.productNumber
		);
	}

	function destroy() {
	}

	function refresh() {
	}

	/**
	 * 스크랩 북 목록 핸들링
	 */
	function scrapedOpinionsListHandler(e, status, result) {
		switch(status) {
			case 200:
				break;
			default:
				break;
		}

		var groupIdx = -1;
		$.each(result.folders, function(index, folders) {
			folders.scrapImagesGroups = [];
			groupIdx = -1;

			$.each(folders.opinionScrapList, function(index, scraps) {
				if (index%5 === 0) {
					folders.scrapImagesGroups.push([]);
					groupIdx++;
				}
				folders.scrapImagesGroups[groupIdx].push(scraps);
			});
		});

		var template = window.Handlebars.compile($('#scrap-add-template').html());
		var elements = $(template(result));
		self.colorbox.find('.js-scrap-container').empty().append(elements);

		eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
		eventManager.triggerHandler(COLORBOX_EVENT.RESIZE);

		callerObj.selScrapImgs = [];
		setScrapAddEvents();

		debug.log(fileName, 'scrapedOpinionsListHandler', status, result);
	}

	function setScrapAddEvents() {
		var selFolder = self.colorbox.find('.js-sel-folder'),
		scrapList = self.colorbox.find('.js-scrap-list'),
		btnCancel = self.colorbox.find('.js-sel-cancel'),
		btnSubmit = self.colorbox.find('.js-sel-submit');

		selFolder.on('change', onScrapAddSelFolderChange);
		scrapList.find('li').on('click', onScrapAddSelImage);
		btnCancel.on('click', onScrapAddSelCancel);
		btnSubmit.on('click', onScrapAddSelSubmit);
		debug.log(fileName, 'setScrapAddEvents', selFolder);
	}

	function destoryScrapAddEvents() {
		var selFolder = self.colorbox.find('.js-sel-folder'),
		scrapList = self.colorbox.find('.js-scrap-list'),
		btnCancel = self.colorbox.find('.js-sel-cancel'),
		btnSubmit = self.colorbox.find('.js-sel-submit');

		selFolder.off('change', onScrapAddSelFolderChange);
		scrapList.find('li').off('click', onScrapAddSelImage);
		btnCancel.off('click', onScrapAddSelCancel);
		btnSubmit.off('click', onScrapAddSelSubmit);
		debug.log(fileName, 'destoryScrapAddEvents');
	}

	function displayScrapList() {
		var template = window.Handlebars.compile($('#scrapList-template').html());
		var elements = $(template(uploadScrapImageArrary));

		$('#scrapList .js-scrap-del').off('click', onScrapDelClick);
		$('#scrapList').empty().append(elements);

		eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
		eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);

		if (uploadScrapImageArrary.length >= 1) {
			$('#scrapUpButton').hide();
		} else {
			$('#scrapUpButton').show();
		}

		uploadScrapNumbers = [];
		$.each(uploadScrapImageArrary, function(index, info) {
			uploadScrapNumbers.push(info.scrapNumber);
		});

		$('#scrapList .js-scrap-del').on('click', onScrapDelClick);

		debug.log(fileName, 'displayScrapList', uploadScrapImageArrary, uploadScrapNumbers);
	}

	function onScrapDelClick(e) {
		e.preventDefault();

		var target = $(e.currentTarget),
		targetInfo = target.closest('.js-scrap-list'),
		scrapUid = targetInfo.data('scrap-uid'),
		i = uploadScrapImageArrary.length,
		info;

		while (i--) {
			info = uploadScrapImageArrary[i];
			if (info.scrapUid === scrapUid) {
				uploadScrapImageArrary.splice(i, 1);
			}
		}

		debug.log(fileName, 'onScrapDelClick', uploadScrapImageArrary, targetInfo, scrapUid);

		displayScrapList();
	}

	function onScrapAddSelCancel(e) {
		e.preventDefault();

		eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);
		debug.log(fileName, 'onScrapAddSelCancel');
	}

	function onScrapAddSelSubmit(e) {
		e.preventDefault();
		var selecteds = callerObj.selScrapImgs.concat(uploadScrapImageArrary);

		if (selecteds >= 1) {
			win.alert('최대 1장의 이미지를 선택하실 수 있습니다.');
			return;
		}

		uploadScrapImageArrary = callerObj.selScrapImgs.concat(uploadScrapImageArrary);

		debug.log(fileName, 'onScrapAddSelSubmit', uploadScrapImageArrary);
		displayScrapList();
	}

	function onScrapAddSelFolderChange(e) {
		var folderNumber = $(e.currentTarget).val(),
		scrapList = self.colorbox.find('.js-scrap-list');

		scrapList.removeClass('is-show');
		scrapList.filter('[data-folder-number=\'' + folderNumber + '\']').addClass('is-show');

		debug.log(fileName, 'onScrapAddSelFolderChange', folderNumber);
	}

	function onScrapAddSelImage(e) {
		e.preventDefault();
		
		var target = $(e.currentTarget),
		scrapUid = target.data('scrap-uid'),
		selecteds = callerObj.selScrapImgs.concat(uploadScrapImageArrary);

		if (!target.hasClass('active') && selecteds.length >= 1) {
			win.alert('최대 1장의 이미지를 선택하실 수 있습니다.');
			return;
		}

		target.toggleClass('active');

		if (target.hasClass('active')) {
			callerObj.selScrapImgs.push({
				target : target,
				scrapNumber : target.data('scrap-number'),
				scrapUid : target.data('scrap-uid'),
				imgPath : target.data('scrap-imgpath')
			});
		} else {
			var i = callerObj.selScrapImgs.length,
			info;

			while (i--) {
				info = callerObj.selScrapImgs[i];
				if (info.scrapUid === scrapUid) {
					callerObj.selScrapImgs.splice(i, 1);
				}
			}
		}

		onScrapAddSelImageUpdate();
	}

	function onScrapAddSelImageUpdate() {
		$.each(callerObj.selScrapImgs, function(index, info) {
			info.target.find('.js-sel-num').text(index + 1);
		});
	}

	function onUploaderSelectedFiles(e, selectedFiles) {
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.SELECTED_FILES, selectedFiles);
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploadSuccess(e, result) {
		result = result.reviewAttachFile;
		debug.log(fileName, 'onUploaderSuccess', imageUploader.EVENT.UPLOAD_SUCCESS, result);
		
		if (uploadImageArray.length == 1) {
			win.alert('이미지는 1장까지 첨부 가능합니다');
		} else {
			uploadImageArray.push(result);
			$('#fileUpList').append('<div id="con'+uploadFileNumber+'" class="conDel">'+result.attachFileName+' <a href="#" id="deleteFile'+uploadFileNumber+'" data-image-url="'+result.attachFileUrl+'" class="btnDel">삭제</a></div>');
			$('#deleteFile'+uploadFileNumber).click(function(e) {
				e.preventDefault();
				var addr;
				for (var key in uploadImageArray) {
					var eachFile = uploadImageArray[key];
					if (eachFile.attachFileUrl == $(this).data('imageUrl')) addr = key;
				}
				uploadImageArray.splice(addr, 1);
				$('#con'+$(this).attr('id').substr(10)).remove();

				$('#fileUpText').show();
				$('#fileUpButton').show();
			});

			uploadFileNumber++;
			if (uploadImageArray.length == 1) {
				$('#fileUpText').hide();
				$('#fileUpButton').hide();
			}
		}
		$.colorbox.close();
	}

	function onUploadFailure(e, jqXHR) {
		debug.log(fileName, 'onUploaderFailure', imageUploader.EVENT.UPLOAD_FAILURE, jqXHR);
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case OPINIONS_EVENT.SCRAPED_LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				scrapedOpinionsListHandler(e, status, response);
				break;
			case MESSAGE_EVENT.INQUIRIES:
				switch(status) {
					case 200:
						win.alert('메세지를 정상적으로 전송하였습니다.');
						win.close();
						break;
					default:
						win.alert(status + ' , ' + response.errorCode + ' , ' + response.message);
						//win.close();
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				break;
			default:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		debug.log(fileName, 'onColorBoxAreaListener', e.type);

		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				if (self.colorbox.hasClass(self.opts.cssClass.popAttachPictures)) {
					$(imageUploader).on(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.on(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.on(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure);

					imageUploader.init(self.opts.imageUploader);
				}

				if (self.colorbox.hasClass(self.opts.cssClass.popScrapAdd)) {
					opinionsController.scrapedOpinionsList();
				}
				break;
			case COLORBOX_EVENT.CLEANUP:
				if (self.colorbox.hasClass(self.opts.cssClass.popAttachPictures)) {
					$(imageUploader).off(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.off(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.off(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure);

					imageUploader.destory();
				}

				if (self.colorbox.hasClass(self.opts.cssClass.popScrapAdd)) {
					destoryScrapAddEvents();
				}
				break;
		}
	}
}