/* jshint node: true, strict: true */
module.exports = FlashAddCallBack().getInstance();

function FlashAddCallBack() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/FlashAddCallBack.js';

	var FLASH = {},
	instance;

	FLASH = (function() {
		var defParams = {
			id : '#imageUpoader',
			filterOpt : {
				filter : 'images (*.jpg, *.png, *.bmp)',
				type : '*.jpg;*.png;*.bmp'
			}
		};
		return {
			init : function() {
				debug.log(fileName, 'init');
				this.event = $('<div data-flash-event>');
				return this;
			},
			setOptions : function(opts) {
				this.opts = $.extend(true, defParams, opts);
				debug.log(fileName, 'setOptions', this.opts, opts);
			},
			eventInit : function() {
				debug.log(fileName, 'eventInit', arguments);
			},
			trace : function() {
				debug.log(fileName, 'trace', arguments);
			},
			eventCallback : function(type, values) {
				debug.log(fileName, 'eventCallback', arguments);
				switch(type) {
					case 'init':
						this.imageUpoader = $('#' + this.opts.id).get(0);
						debug.warn(fileName, 'init', this.imageUpoader);
						this.event.trigger('eventCallback.init', this.imageUpoader);
						break;
					case 'uploadDone':
						debug.log(fileName, 'uploadDone', values);
						this.event.trigger('eventCallback.uploadDone', values);
						break;
					case 'bs64':
						//'data:image/'+ values.type + ';base64,' + values.base64;
						debug.log(fileName, 'bs64', values);
						this.event.trigger('eventCallback.bs64', values);
						break;
					case 'selectedFile':
						debug.log(fileName, 'selectedFile', values);
						this.event.trigger('eventCallback.selectedFile', values);
						break;
				}
			},
			callFlash : function(type, opts) {
				var params = {
					callback : $.noop,
					values : {}
				},
				callback;

				opts = $.extend(true, params, opts);
				callback = opts.callback;
				
				switch(type) {
					case 'setFilter':
						/*
						opts.values = {
							filter : 'images (*.jpg, *.png)',
							type : '*.jpg;*.png'
						}
						*/
						callback(this.imageUpoader.callFlash('setFilter', opts.values));
						break;
					case 'setUpload':
						/*
						opts.values = {
							url : '',
							jsCallBack : true
						}
						*/
						callback(this.imageUpoader.callFlash('setUpload', opts.values));
						break;
					case 'isSelected':
						callback(this.imageUpoader.callFlash('isSelected', opts.values));
						break;
					case 'cancel':
						callback(this.imageUpoader.callFlash('cancel', opts.values));
						break;
					case 'upload':
						callback(this.imageUpoader.callFlash('upload', opts.values));
						break;
				}
			}
		};
	})();
	
	return {
		getInstance: function() {
			if (!instance) instance = FLASH.init();
			return instance;
		}
	};

}