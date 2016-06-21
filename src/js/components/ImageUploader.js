/* jshint node: true, strict: true */
module.exports = ClassImageUploader().getInstance();

function ClassImageUploader() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	flashAddCallBack = require('./FlashAddCallBack.js'),
	fileName = 'compoents/ImageUploader.js';

	var opts = {
		wrap : '.js-upload-wrap',
		container : '.js-upload-container',
		holder : '.js-holder',
		inpFile : '.js-inp',
		btnCancel : '.js-cancel',
		btnSubmit : '.js-submit',
		btnExit : '#cboxClose',
		acceptedTypes : [
			'image/jpg',
			'image/jpeg',
			'image/png'
		],
		previewOpt : {
			scale : {
				x : 1,
				y : 1
			},
			viewPort : {
				width : 835,
				height : 500
			}
		},
		flashOpts : {
			swf : '/images/swf/imagePreview.swf',
			id : 'imageUpoader',
			width : '100%',
			height : '100%',
			wmode : 'transparent',
			filterOpt : {
				filter : 'images (*.jpg, *.jpeg, *.png)',
				type : '*.jpg;*.jpeg;*.png'
			},
			upload : {
				url : '',
				jsCallBack : true
			}
		},
		cssClass : {
			hide : 'is-hide',
			active : 'is-active'
		}
	},
	isSupport = (function() {
		return {
			fileReader : function() {
				return window.FileReader;
			},
			acceptedTypes : function(type) {
				type = type.toLowerCase();

				var flag = false;
				$.map(self.opts.acceptedTypes, function(val) {
					if (val === type) {
						flag = true;
						return false;
					}
				});
				return flag;
			}
		};
	})();

	var callerObj = {
		init : init,
		destory : destory
	},
	instance, self;
	
	return {
		getInstance: function() {
			if (!instance) instance = callerObj;
			return instance;
		}
	};
	
	function init(options) {
		self = callerObj;
		self.opts = $.extend(true, opts, options);

		debug.log(fileName, 'init', self.opts);

		setElements();

		if (!isSupport.fileReader()) {
			setFlashVersion();
		} else {
			setHtmlVersion();
		}
		
		setBindEvents();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.container = self.wrap.find(self.opts.container);
		self.holder = self.wrap.find(self.opts.holder);
		self.inpFile = self.wrap.find(self.opts.inpFile);
		self.btnCancel = self.wrap.find(self.opts.btnCancel);
		self.btnSubmit = self.wrap.find(self.opts.btnSubmit);
		self.btnExit = $(self.opts.btnExit);
		self.imageInfo = null;
		self.imgRotation = 0;
		self.flashVersion = false;
	}

	function setFlashVersion() {
		debug.log(fileName, 'setFlashVersion', self.opts.flashOpts);

		flashAddCallBack.setOptions(self.opts.flashOpts);
		flashAddCallBack.event.on('eventCallback.init', function() {
			flashAddCallBack.callFlash('setFilter', {values: self.opts.flashOpts.filterOpt});
			flashAddCallBack.callFlash('setUpload', {values: self.opts.flashOpts.upload});
		});
		flashAddCallBack.event.on('eventCallback.bs64', function() {
			setBtnSubmitActive();
		});
		win.FLASH = flashAddCallBack;

		self.flashVersion = true;

		self.inpFile.addClass(self.opts.cssClass.hide);
		self.holder.flash(self.opts.flashOpts);
	}

	function setHtmlVersion() {
		debug.log(fileName, 'setHtmlVersion');

		self.inpFile.removeClass(self.opts.cssClass.hide);
	}

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');
		self.inpFile.on('change', onInpFileChange);
		self.holder.on('dragover', onHolderDrapOver)
					.on('dragend', onHolderDrapEnd)
					.on('drop', onHolderDrop)
					.on('click', onHolderClick);
		self.btnCancel.on('click', onBtnCancelClick);
		self.btnSubmit.on('click', onBtnSubmitClick);
	}

	function onHolderDrapOver(e) {
		e.preventDefault();
		var target = $(e.currentTarget);
		target.addClass('hover');
	}


	function onHolderDrapEnd(e) {
		e.preventDefault();
		var target = $(e.currentTarget);
		target.removeClass('hover');
	}

	function onHolderDrop(e) {
		e.preventDefault();
		var target = $(e.currentTarget),
		event = e.originalEvent;

		target.removeClass('hover');

		if (event.dataTransfer.files.length) {
			setReadFiles(event.dataTransfer.files);
		}
	}

	function onHolderClick(e) {
		e.preventDefault();

		self.inpFile.trigger('click');
	}

	function onInpFileChange(e) {
		var target = $(e.currentTarget),
		inp = target.get(0);

		if (inp.files && inp.files.length) {
			setReadFiles(inp.files);
		} else {
			var val = target.val(),
			name = val.split('\\').pop(),
			files = [];

			files.push({
				name : name,
				size : 0,
				type : name.split('.')[1]
			});

			setReadFiles(files);
		}
	}

	function onBtnCancelClick(e) {
		debug.log(fileName, 'onBtnCancelClick', e);

		if (self.flashVersion) {
			flashAddCallBack.callFlash('cancel');
		} else {
			clearPreviewFile();
		}

		self.btnExit.trigger('click');
	}
				
	function onBtnSubmitClick(e) {
		debug.log(fileName, 'onBtnSubmitClick', e);

		if (self.flashVersion) {
			flashAddCallBack.callFlash('upload', { callback: function(bs64, type) {
				self.imageInfo = bs64;
				debug.info(fileName, '전송처리 단계~');
				debug.log(fileName, 'self.imageInfo', self.imageInfo);
			}});
			return;
		}

		if (!self.imageInfo) {
			win.alert('이미지를 선택하세요.');
			return;
		}
		debug.info(fileName, '전송처리 단계~');
		debug.log(fileName, 'self.imageInfo', self.imageInfo);
	}
	
	function setReadFiles(file) {
		file = file[0];

		if (!isSupport.fileReader()) {
			win.alert('fileReader 미지원 브라우저입니다.');
			return;
		}

		if (file.type && !isSupport.acceptedTypes(file.type)) {
			win.alert('지원하지 않는 포맷입니다.');
			return;
		}

		var _self = self;
		win.EXIF.getData(file, function() {
			var exif = win.EXIF.getAllTags(this);
			switch(exif.Orientation) {
				case 3:
					//동
					_self.imgRotation = 180;
					break;
				case 6:
					//북
					_self.imgRotation = 90;
					break;
				case 8:
					//남
					_self.imgRotation = 270;
					break;
				default:
					//서
					_self.imgRotation = 0;
					break;
			}

			var reader = new FileReader();
			reader.onload = setPreviewFile;
			reader.onerror = onError;
			reader.readAsDataURL(file);
		});
	}
	
	function onError(e) {
		win.console.warn('일시적인 장애가 발생했습니다.\n다시 시도해주세요.', e);
	}

	function setPreviewFile(e) {
		clearPreviewFile();

		self.imageInfo = e.target.result;

		var imgObj = new Image(),
		image = $('<image class=\'js-preview-img\'>');

		imgObj.onload = $.proxy(function() {
			var imgWidth = imgObj.width,
			imgHeight = imgObj.height,
			imgOpt = self.opts.previewOpt,
			imgScale = imgOpt.scale,
			viewPort = imgOpt.viewPort,
			displayWidth, displayHeight;

			if (imgWidth > imgHeight) {
				// 가로형 - landscape
				imgScale.x = viewPort.width / imgWidth;
				imgScale.y = imgScale.x;
				debug.log(fileName, '가로형 ', viewPort, imgScale);
			} else if (imgHeight > imgWidth) {
				// 세로형 - portrait
				imgScale.y = viewPort.height / imgHeight;
				imgScale.x = imgScale.y;
				debug.log(fileName, '세로형 ', imgScale);
			} else {
				// 정방형
				imgScale.y = viewPort.height / imgHeight;
				imgScale.x = imgScale.y;
				debug.log(fileName, '정방형 ', imgScale);
			}

			displayWidth = imgScale.x * imgWidth;
			displayHeight = imgScale.y * imgHeight;

			if (displayHeight > viewPort.height) {
				imgScale.y = viewPort.height / displayHeight;
				imgScale.x = imgScale.y;

				displayWidth = imgScale.x * displayWidth;
				displayHeight = imgScale.y * displayHeight;
			}

			debug.log(fileName, 'self.imgRotation', self.imgRotation);

			image.css({
				'width' : displayWidth,
				'height' : displayHeight,
				'margin-left' : (viewPort.width - displayWidth) / 2,
				'margin-top' : (viewPort.height - displayHeight) / 2,
				'transform' : 'rotate(' + self.imgRotation + 'deg)'
			});
			self.holder.append(image);

			setBtnSubmitActive();
		}, self);

		imgObj.onerror = onError;
		image.attr('src', self.imageInfo);
		imgObj.src = self.imageInfo;
	}

	function setBtnSubmitActive() {
		self.btnSubmit.addClass(self.opts.cssClass.active);
	}

	function clearPreviewFile() {
		if (self.holder.find('.js-preview-img').size()) {
			self.holder.find('.js-preview-img').remove();
		}
		// input 정보 초기화
		self.inpFile.val('');
		self.imageInfo = null;
	}

	function destory() {
		flashAddCallBack.event.off('eventCallback.init');
		win.FLASH = null;
		debug.log(fileName, 'destory');
	}

}