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
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');

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
			api_url : APIController().API_URL+'/apis/member/profileImage',
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
		init: init,
		/**
		 * SuperClass 연결
		 */
		Super: Super
	},
	self;
	
	return callerObj;
	
	function init(options) {
		Super.init();
		
		debug.log(fileName, 'init', $, util);

		self = callerObj;

		setElements();
		setBindEvents();
	}

	function setElements() {
		debug.log(fileName, 'setElements');

		self.colorbox = $(opts.colorbox.target);
	}

	function myInfoResultHandler(e) {
		var loginData = loginDataModel.loginData();

		if (loginData == null) {
			$(document).trigger('needLogin');
		} else {
			if (loginData.email != null) {
				$('#myPageHeaderId').text(loginData.email);
				$('#myPageHeaderName').text(loginData.memberName);
			} else {
				$('#myPageHeaderId').text(loginData.memberName);
			}
			
			if (loginData.imageUrl != null) {
				$('#myPageHeaderProfilePic').attr('src', loginData.imageUrl);
			} else {
				$('#myPageHeaderProfilePic').attr('src', '/images/profile180.jpg');
			}

			var activity = loginData.myActivity;
			var notice = activity.noticeNewYn == 'Y' ? '<span class="newBox">'+activity.noticeCount+'<span class="new">N</span></span>' : activity.noticeCount
			$('#myPageHeaderNoticeCount').html(notice);
			$('#myPageHeaderScrapCount').html(activity.scrapCount);
			$('#myPageHeaderLikeCount').html(activity.likeCount);
			$('#myPageHeaderFollowingCount').html(activity.followCount);
			$('#myPageHeaderPointCount').html(loginData.savingPoint);
			$('#myPageHeaderMyCartCount').html(activity.cartCount);
			$('#myCartConstNewCount').html(activity.cartConstNewCount);
			$('#myCartDlvyNewCount').html(activity.cartDlvyNewCount);
		}
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
		alert('프로필 사진 변경이 완료되었습니다');
		location.reload(true);
	}

	function onUploadFailure(e, jqXHR) {
		debug.log(fileName, 'onUploaderFailure', imageUploader.EVENT.UPLOAD_FAILURE, jqXHR);
		alert('프로필 사진 변경에 실패하였습니다');

		///apis/me/profileImage
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