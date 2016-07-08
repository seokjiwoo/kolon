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
				width : 530,
				height : 302
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
			}
		},
		cssClass : {
			hide : 'is-hide',
			active : 'is-active',
			hasFile : 'has-file',
			noFilereader : 'no-filereader'
		},
		multiple : {
				enabled : false,
				maxSize : 3
		}
	},
	isSupport = (function() {
		return {
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
		destory : destory,
		getSelectedFiles: getSelectedFiles,
		EVENT : {
			SELECTED_FILES : 'IMAGE_UPLOADER-SELECTED_FILES',
			GET_SELECTED_FILES : 'IMAGE_UPLOADER-GET_SELECTED_FILES',
			SUBMIT : 'IMAGE_UPLOADER-SUBMIT',
			UPLOAD_SUCCESS : 'IMAGE_UPLOADER-UPLOAD_SUCCESS',
			UPLOAD_FAILURE : 'IMAGE_UPLOADER-UPLOAD_FAILURE',
			CANCEL : 'IMAGE_UPLOADER-CANCEL'
		}
	},
	EVENT = callerObj.EVENT,
	FB_EVENT = flashAddCallBack.EVENT,
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

		if (!util.isSupport().fileReader) {
			self.wrap.addClass(self.opts.cssClass.noFilereader);
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

		self.selTempFile = null;
		self.imgRotation = 0;
		self.flashVersion = false;
		self.selectedFiles = [];
		self.multiple = false;

		if (self.opts.multiple.enabled) {
			self.inpFile.attr('multiple', 'multiple');
			self.multiple = true;
		}

		self.inpFile.attr('accept', self.opts.acceptedTypes.join(','));
	}

	function setFlashVersion() {
		debug.log(fileName, 'setFlashVersion', self.opts.flashOpts);

		flashAddCallBack.setOptions(self.opts.flashOpts);
		$(flashAddCallBack).on(FB_EVENT.INIT, function(/*e, target*/) {
			flashAddCallBack.callFlash('setFilter', {values: self.opts.flashOpts.filterOpt});
			flashAddCallBack.callFlash('setMultiple', {values: self.opts.multiple});
		});

		$(flashAddCallBack).on(FB_EVENT.SELECTED_FILES, function(e, selectedFile) {
			setSelectedFiles(selectedFile);
		});

		$(flashAddCallBack).on(FB_EVENT.SELECTED_OVER_SIZE, function(e, selectedSize) {
			if (!self.multiple && selectedSize >= 1) {
				win.alert('최대 1개의 이미지를 선택 할 수 있습니다.');
				return;
			}

			if (self.multiple && selectedSize >= self.opts.multiple.maxSize) {
				win.alert('최대 ' + self.opts.multiple.maxSize + '개의 이미지를 선택 할 수 있습니다.');
				return;
			}
		});

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

		$(self).on(EVENT.GET_SELECTED_FILES, function() {
			return getSelectedFiles();
		});
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
		e.stopPropagation();
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

		$(self).trigger(EVENT.CANCEL);
		self.btnExit.trigger('click');
	}
				
	function onBtnSubmitClick(e) {
		debug.log(fileName, 'onBtnSubmitClick', e);

		if (!self.selectedFiles.length) {
			win.alert('이미지를 선택하세요.');
			return;
		}
		var selectedFile = self.selectedFiles[0];
		var formData = util.makeMultipartForm(selectedFile.bs64, selectedFile.file.name);
		console.log(self.opts);
		var ajaxOptions = {
			url: self.opts.api_url,
			method: 'POST',
			xhrFields: {
				withCredentials: true
			},
			data: formData.content,
			headers: formData.headers,
			contentType: "multipart/form-data"
		}

		debug.info(fileName, '전송처리 단계~', getSelectedFiles());
		debug.log(fileName, 'self.imageInfo', self.imageInfo);
		$(self).trigger(EVENT.SUBMIT);

		$.ajax(ajaxOptions).done(function(data, textStatus, jqXHR) {
			$(self).trigger(EVENT.UPLOAD_SUCCESS, data.data);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$(self).trigger(EVENT.UPLOAD_FAILURE, jqXHR);
		});
	}
	
	function setReadFiles(files) {
		var supportFlag = true,
		reader, bs64, file;

		if (!self.multiple && files.length > 1 || !self.multiple && self.selectedFiles.length >= 1) {
			win.alert('최대 1개의 이미지를 선택 할 수 있습니다.');
			return;
		}

		if (self.multiple && files.length > self.opts.multiple.maxSize || self.selectedFiles.length >= self.opts.multiple.maxSize) {
			win.alert('최대 ' + self.opts.multiple.maxSize + '개의 이미지를 선택 할 수 있습니다.');
			return;
		}

		if (!util.isSupport().fileReader) {
			win.alert('fileReader 미지원 브라우저입니다.');
			return;
		}

		$.each(files, function(index, curFile) {
			if (curFile.type && !isSupport.acceptedTypes(curFile.type)) {
				supportFlag = false;
				return false;
			}
		});

		if (!supportFlag) {
			win.alert('지원하지 않는 포맷입니다.');
			return;
		}

		if (!self.multiple) {
			files = [files[0]];
			file = files[0];
		}

		var _self = self;
		self.selFile = file;
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

		// $.each(files, function(index, curFile) {
		// 	(function(idx, loadFile) {
		// 		reader = new FileReader();
		// 		reader.onload = function(e) {
		// 			bs64 = e.target.result;
		// 			setSelectedFiles({ file : loadFile, bs64: bs64 });
		// 		};
		// 		reader.onerror = onError;
		// 		reader.readAsDataURL(loadFile);
		// 	})(index, curFile);
		// });

		// input 정보 초기화
		self.inpFile.val('');
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
			imgOpt = $.extend({}, self.opts.previewOpt, {}),
			imgScale = imgOpt.scale,
			viewPort = imgOpt.viewPort,
			displayWidth, displayHeight,
			tempSize;

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
				// 'margin-left' : (viewPort.width - displayWidth) / 2,
				'margin-top' : (viewPort.height - displayHeight) / 2,
				'transform' : 'rotate(' + self.imgRotation + 'deg)'
			});
			self.holder.append(image);

			if (self.imgRotation === 90 || self.imgRotation === 270) {
				imgWidth = image.width();
				imgHeight = image.height();

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

				displayWidth = imgScale.x * imgWidth;
				displayHeight = imgScale.y * imgHeight;


				if (displayHeight > viewPort.height) {
					imgScale.y = viewPort.height / displayHeight;
					imgScale.x = imgScale.y;

					displayWidth = imgScale.x * displayWidth;
					displayHeight = imgScale.y * displayHeight;
				}

				image.css({
					'width' : displayWidth,
					'height' : displayHeight,
					// 'margin-left' : (viewPort.width - displayWidth) / 2,
					'margin-top' : (viewPort.height - displayHeight) / 2,
					'transform' : 'rotate(' + self.imgRotation + 'deg)'
				});
			}

			setBtnSubmitActive();
			setSelectedFiles({ file : self.selFile, bs64: self.imageInfo });
		}, self);

		imgObj.onerror = onError;
		image.attr('src', self.imageInfo);
		imgObj.src = self.imageInfo;
	}

	function setBtnSubmitActive() {
		self.btnSubmit.addClass(self.opts.cssClass.active);
		self.container.addClass(self.opts.cssClass.hasFile);
	}

	function getSelectedFiles() {
		return self.selectedFiles;
	}

	function setSelectedFiles(info) {
		if (!self.multiple && self.selectedFiles.length >= 1) {
			win.alert('최대 1개의 이미지를 선택 할 수 있습니다.');
			return;
		}

		if (self.multiple && self.selectedFiles.length >= self.opts.multiple.maxSize) {
			win.alert('최대 ' + self.opts.multiple.maxSize + '개의 이미지를 선택 할 수 있습니다.');
			return;
		}

		self.selectedFiles.push(info);

		$(self).trigger(EVENT.SELECTED_FILES, getSelectedFiles());
		setBtnSubmitActive();
	}

	function clearPreviewFile() {
		if (self.holder.find('.js-preview-img').size()) {
			self.holder.find('.js-preview-img').remove();
		}
		// input 정보 초기화
		self.inpFile.val('');
		self.selectedFiles = [];
	}

	function destory() {
		$(flashAddCallBack).off(FB_EVENT.INIT);
		$(flashAddCallBack).off(FB_EVENT.SELECTED_FILES);
		$(flashAddCallBack).off(FB_EVENT.SELECTED_OVER_SIZE);
		$(self).off(EVENT.GET_SELECTED_FILES);
		debug.log(fileName, 'destory');
	}

}