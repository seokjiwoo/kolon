/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MessageDetail.js';

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);

		$("#deleteAllMessageButton").on("click", function(){
			confirm("메시지내용을모두삭제하시겠습니까?\n삭제하실경우메시지내용이모두삭제되며1:1메시지목록에서도삭제됩니다.");
		});
	}
};