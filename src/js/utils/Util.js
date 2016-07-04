/* global $ */
/* jshint node: true, strict: true */

module.exports = ClassUtils().getInstance();

function ClassUtils() {
	'use strict';

	var instance;
	
	return {
		getInstance: function() {
			if (!instance) instance = init();
			return instance;
		}
	};
	
	function init() {
		return {
			/**
			 * GET query 추출
			 * @param {String} name - query var
			 */
			getUrlVar: getUrlVar,
			/**
			 * GET hash query 추출
			 * @param {String} name - query var
			 */
			getHashVar: getHashVar,
			/**
			 * 이메일 주소 검증
			 * @param {String} value - email address for validation 
			 */
			checkVaildEmail: checkVaildEmail,
			/**
			 * 패스워드 검증
			 * @param {String} value - user password for validation 
			 */
			checkValidPassword: checkValidPassword,
			/**
			 * 핸드폰 번호 검증
			 * @param {String} value - mobile phone number for validation 
			 */
			checkValidMobileNumber: checkValidMobileNumber,
			/**
			 * 생일 기준으로 만 나이 구하기
			 * @param {Date} birthday - birthday
			 */
			calculateAge: calculateAge,
			/**
			 * @description
			 * 	값을 '원' 단위로 변환하여 반환
			 * @param   {Number|String}     num     변환할 값
			 */
			currencyFormat: currencyFormat,
			/**
			 * 값을 핸드폰 번호 양식 (xxx-xxx(x)-xxxx)으로 변환하여 반환
			 * @param   {Number|String} enteredId - 변환할 값
			 */
			mobileNumberFormat: mobileNumberFormat,
			/**
			 * @description
			 *  값에 comma를 찍어서 String으로 반환
			 * @param   {Number|String} num         변환할 값
			 * @param   {Number}        splitNum    콤마 단위
			 * @return  {String}
			 */
			comma: comma,
			/**
			 * @description
			 * 	시작일 ~ 종료일 D-day 반환
			 * @return {Object}  {startTime: Number, endTime: Number, diffTime: Number, diffDay: Number}
			 */
			diffDay: diffDay,
			/**
			 * @description
			 * 	window width, height 값 반환
			 * @type {Object}
			 */
			winSize: winSize,
			/**
			 * @description
			 * 	문자값이 'true' 인지 체크하여 반환
			 * @type {Boolean}
			 */
			strToBoolean : strToBoolean,
			/**
			 * 브라우저 기능 지원여부 체크
			 * @type {Function}
			 */
			isSupport : isSupport
		};
	}
	
	function checkVaildEmail(value) {
		value = $.trim(value);
		var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
		return ((value !== '') && re.test(value));
	}

	function checkValidPassword(value) {
		value = $.trim(value);
		var re = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]).{9,16}$/i;
		return ((value !== '') && re.test(value));
	}

	function checkValidMobileNumber(value) {
		var re = /^[0-9]{10,12}$/i;
		return (($.trim(value) !== '') && re.test(value));
	}
	
	function calculateAge(birthday) {
		var ageDifMs = Date.now() - birthday.getTime();
		var ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	}
	
	function getUrlVar(name, href) {
		return getUrlVars(href)[name];
	}
	
	function getUrlVars(href) {
		href = href || window.location.href;
		var vars = [], hash;
		var hashes = href.slice(href.indexOf('?')+1).split('#')[0].split('&');
		
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}

	function getHashVar(name, href) {
		return getHashVars(href)[name];
	}
	
	function getHashVars(href) {
		href = href || window.location.href;
		var vars = [], hash;
		var hashes = href.slice(href.indexOf('#')+1).split('&');
		
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}

	function comma(num, splitNum) {
		splitNum = splitNum || 3;
		var arr = ('' + num).split(''),
		tlen = arr.length,
		clen = Math.ceil(tlen / splitNum),
		i;

		for(i = 1; i < clen; i++) {
			arr.splice( tlen - i * splitNum, 0, ',' );
		}
		return arr.join('');
	}

	function currencyFormat(num) {
		return comma(num, 3);
	}

	function mobileNumberFormat(enteredId) {
		return enteredId.substr(0, 3)+'-'+enteredId.substr(3, enteredId.length-7)+'-'+enteredId.substr(-4, 4);
	}

	function diffDay(data) {
		var dayMS = data.dayMS || (1000 * 60 * 60 * 24),
		startTime = +new Date(data.startDate),
		endTime = +new Date(data.endDate),
		diffTime = +new Date(endTime-startTime),
		diffDay = parseInt(Math.ceil(diffTime/(dayMS)), 10);

		return {
			'startTime' : startTime,
			'endTime' : endTime,
			'diffTime' : diffTime,
			'diffDay' : diffDay
		};
	}

	function winSize() {
		var win_wh = {
			w : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			h : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		};
		return win_wh;
	}

	function strToBoolean(str) {
		return 'true' === str.toLowerCase();
	}

	function isSupport() {
		return {
			svg : (function() {
				return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
			})(),
			fileReader : (function() {
				return window.FileReader;
			})()
		};
	}

}