/* jshint node: true, strict: true */
module.exports = ClassImageUploader().getInstance();

function ClassImageUploader() {
	'use strict';

	var win = window,
	debug = require('../utils/Console.js'),
	util = require('../utils/Util.js'),
	fileName = 'compoents/ImageUploader.js';
	
	return {
		getInstance: function() {
			if (!instance) instance = init();
			return instance;
		}
	};
	
	function init() {
		debug.log(fileName, 'init');
	}

}