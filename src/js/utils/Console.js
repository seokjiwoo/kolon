/* jshint node: true, strict: true */
module.exports = ClassConsole().getInstance();

/**
 * @description
 *  console 과 관련한 Javascript 정의
 * @global
 * @class       ClassConsole
 * @return      {Function}
 * @constructor
 */
function ClassConsole() {
	'use strict';

	var win = window,
	util = require('./Util.js'),
	/**
	 * @description
	 *  console 사용 유무
	 * @type        {Boolean}
	 * @default     true
	 * @private
	 */
	_isDebug = true,
	/**
	 * @description
	 *  url의 debug 모드용 search 값 설정
	 * @type        {string}
	 * @default     'debug'
	 * @private
	 */
	_debugParam = 'debug',
	_debugParamFile = 'debugFiles',
	_debugFiles = 'all',
	_debugComment = ':: vinyl-X ::',
	instance;
	
	return {
		getInstance: function() {
			if (!instance) instance = init();
			return instance;
		}
	};
	
	function init() {
		log('디버깅을 위한 Console.js - 운영시 _isDebug false로 설정.');
		return {
			'debug' : debug,
			'debugParam' : debugParam,
			'isDebugMode' : isDebugMode,
			'log' : log,
			'info' : info,
			'warn' : warn
		};
	}
	
	/**
	 * @description
	 *  debug 유무 flag 설정
	 * @param       {Boolean}   flag    console 사용 유무 설정
	 * @see         _isDebug
	 * @default
	 *  {@param flag}   true
	 */
	function debug(flag) {
		_isDebug = flag;
	}

	/**
	 * @description
	 *  url의 search 값을 이용한 디버깅 설정
	 * @param       {String}   param    체크할 url 의 search 값
	 * @see         _debugParam
	 * @default
	 *  {@param param}  'debug'
	 */
	function debugParam(param) {
		_debugParam = param;
	}

	/**
	 * @description
	 *  debugParam, debugFlag 의 설정에 따른 디버깅 유무를 판단
	 * @example
	 * 	http://localhost:3000/myPage/scrap.html?debug=true&debugFiles=all
	 * @return      {boolean}
	 */
	function isDebugMode() {
		return util.getUrlVar(_debugParam) || _isDebug;
	}

	/**
	 * @description
	 * 	_debugParamFile 에 따른 디버깅 파일항목만 log 노출
	 * @example
	 * 	http://localhost:3000/myPage/scrap.html?debugFiles=events/EventManager.js
	 * @return      {boolean}
	 */
	function isDebugFile(fileName) {
		var debugFiles = util.getUrlVar(_debugParamFile),
		rtnFlag = false;

		if (debugFiles) {
			debugFiles = debugFiles.split(',');

			$.map(debugFiles, function(name) {
				if (fileName === name || 'all' === name) {
					rtnFlag = true;
					return false;
				}
			});
		}

		return rtnFlag;
	}

	/**
	 * @description
	 *  window.console 유무와 debug & debugParam 에 따른 console.log 출력
	 * @example
	 * <code>
		// 기본 사용
		var exConsole1 = require('./Console.js');
		exConsole1.log('test', 5+3, 5*5, 5/2);    // ["test", 8, 25, 2.5]
		
		// console 사용 중지
		var exConsole2 = require('./Console.js');
		exConsole2.debug(false);
		exConsole2.log('test', 5+3, 5*5, 5/2);    // ["test", 8, 25, 2.5]
		
		// url serach 값 이용 - http://localhost:63342/index.html?debug=1
		// console 의 사용을 중지하고도 log를 확인 할 수 있음 - 실서버 반영시 활용 가능
		var exConsole3 = require('./Console.js');
		exConsole3.debug(false);
		exConsole3.debugParam('debug');
		exConsole3.log('test', 5+3, 5*5, 5/2);    // ["test", 8, 25, 2.5]

		// url serach 값 이용 - http://localhost:63342/index.html?viewConsole=1
		var exConsole4 = require('./Console.js');
		exConsole4.debugParam('viewConsole');
		exConsole4.log('test', 5+3, 5*5, 5/2);    // ["test", 8, 25, 2.5]
	 * </code>
	 */
	function log() {
		if((win.console && isDebugMode()) || (win.console && isDebugMode() && isDebugFile(arguments[0]))) {
			var msg = Array.prototype.slice.apply(arguments);
			msg.unshift(_debugComment);
			win.console.log(msg);
		}
	}

	function info() {
		if((win.console && isDebugMode()) || (win.console && isDebugMode() && isDebugFile(arguments[0]))) {
			var msg = Array.prototype.slice.apply(arguments);
			msg.unshift(_debugComment);
			win.console.info(msg);
		}
	}

	function warn() {
		if((win.console && isDebugMode()) || (win.console && isDebugMode() && isDebugFile(arguments[0]))) {
			var msg = Array.prototype.slice.apply(arguments);
			msg.unshift(_debugComment);
			win.console.warn(msg);
		}
	}

}