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
			},
			base64Format : 'data:image/{{TYPE}};base64,'
		};
		return {
			EVENT : {
				INIT : 'eventCallback.init',
				SELECTED_FILES : 'eventCallback.selectedFile',
				SELECTED_OVER_SIZE : 'eventCallback.overMaxSize'
			},
			init : function() {
				win.FLASH = this;
				return this;
			},
			setOptions : function(opts) {
				this.opts = $.extend(true, defParams, opts);
			},
			eventInit : function() {
				debug.log(fileName, 'eventInit', arguments);
			},
			trace : function() {
				debug.log(fileName, 'trace', arguments);
			},
			eventCallback : function(type, values) {
				switch(type) {
					case 'init':
						this.imageUpoader = $('#' + this.opts.id).get(0);
						debug.warn(fileName, 'init', this.imageUpoader);
						$(this).trigger(this.EVENT.INIT, this.imageUpoader);
						break;
					case 'selectedFile':
						values.bs64 = this.opts.base64Format.replace('{{TYPE}}', values.file.type.replace('.','')) + values.bs64;
						$(this).trigger(this.EVENT.SELECTED_FILES, values);
						break;
					case 'overMaxSize':
						$(this).trigger(this.EVENT.SELECTED_OVER_SIZE, values);
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
					case 'setMultiple':
						/*
						opts.values = {
							enabled : false,
							maxSize : 3
						}
						*/
						callback(this.imageUpoader.callFlash('setMultiple', opts.values));
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