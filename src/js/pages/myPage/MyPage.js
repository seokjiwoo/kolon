/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	APIController = require('../../controller/APIController.js'),
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	imageUploader = require('../../components/ImageUploader.js'),
	fileName = 'myPage/Index.js';

	var opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			popProfilePic : 'popProfilePic'
		},
		imageUploader : {
			api_url : APIController().API_URL+'/apis/opinions/images',
			flashOpts : {
				swf : '../images/swf/imagePreview.swf',
				id : 'imageUpoader',
				width : '100%',
				height : '100%',
				wmode : 'transparent',
				filterOpt : {
					filter : 'images (*.jpg, *.jpeg, *.png)',
					type : '*.jpg;*.jpeg;*.png'
				}
			}
		}
	};

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;
	
	return callerObj;
	
	function init(options) {
		Super.init();
		if (Super.Super.loginData == null) {
			alert('로그인이 필요한 페이지입니다');
			location.href = '/member/login.html';
		} else {
			debug.log(fileName, 'init', $, util);

			self = callerObj;

			setElements();
			setBindEvents();
		}
	}

	function setElements() {
		debug.log(fileName, 'setElements');

		$('#myPageHeaderName').text(Super.Super.loginData.memberName);
		$('#myPageHeaderId').text(Super.Super.loginData.email);

		if (Super.Super.loginData.imageUrl != null) $('#myPageHeaderProfilePic').attr('src', Super.Super.loginData.imageUrl);
		$('#myPageHeaderNoticeCount').html('0'); // <!-- <span class="newBox">0<span class="new">N</span></span> -->
		$('#myPageHeaderScrapCount').html('0');
		$('#myPageHeaderLikeCount').html('0');
		$('#myPageHeaderFollowingCount').html('0');
		$('#myPageHeaderPointCount').html('0');
		$('#myPageHeaderMyCartCount').html('0');

		self.colorbox = $(opts.colorbox.target);
	}

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);
	}

	function onUploaderSelectedFiles(e, selectedFiles) {
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.SELECTED_FILES, selectedFiles);
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploaderSubmit(e) {
		debug.log(fileName, 'onUploaderSubmit', imageUploader.EVENT.SUBMIT);
		debug.log(fileName, 'onUploaderSubmit', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploadSuccess(e, result) {
		debug.log(fileName, 'onUploaderSuccess', imageUploader.EVENT.UPLOAD_SUCCESS, result);
	}

	function onUploadFailure(e, jqXHR) {
		debug.log(fileName, 'onUploaderFailure', imageUploader.EVENT.UPLOAD_FAILURE, jqXHR);
	}

	function onUploaderCancel(e) {
		debug.log(fileName, 'onUploaderCancel', imageUploader.EVENT.CANCEL);
		debug.log(fileName, 'onUploaderCancel', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.popProfilePic)) {
					$(imageUploader).on(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.on(imageUploader.EVENT.SUBMIT, onUploaderSubmit)
									.on(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.on(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure)
									.on(imageUploader.EVENT.CANCEL, onUploaderCancel);

					imageUploader.init(opts.imageUploader);
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.popProfilePic)) {
					$(imageUploader).off(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.off(imageUploader.EVENT.SUBMIT, onUploaderSubmit)
									.off(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.off(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure)
									.off(imageUploader.EVENT.CANCEL, onUploaderCancel);

					imageUploader.destory();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}
};