/* jshint node: true, strict: true */
module.exports = DropDownMenu().getInstance();

function DropDownMenu() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/DropDownMenu.js';

	var opts = {
		wrap : 'body',
		menus : '.js-dropdown',
	};

	var callerObj = {
		init : init
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
		self.opts = $.extend({}, opts, options);

		debug.log(fileName, 'init', self.opts);

		setElements();
		setBindEvents();
	}

	function setElements() {
	}

	function setBindEvents() {
	}

}