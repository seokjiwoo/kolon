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
			 * IE 여부 검사
			 */
			isIe: isIe,
			/**
			 * 모바일 여부 검사
			 */
			isMobile: isMobile,
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
			 *  값의 comma 제거
			 * @param   {String} num         변환할 값
			 * @return  {Number}
			 */
			removeComma: removeComma,
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
			isSupport : isSupport,
			/**
			 * base64 image를 multipart formdata로 변환
			 * @param   {String} image  - base64 데이터
			 * @param   {String} filename - 파일 이름
			 * @param   {String} format - mime type (optional)
			 * @return  {Object|Boolean} {content:String, headers: {'Content-Type': 'multipart/form-data; boundary='+String, 'Content-Length': Number} }
			 */
			makeMultipartForm: makeMultipartForm,
			/**
			 * @description
			 * 	array 의 unique 값만 반환
			 * @type {Array}
			 */
			arrayUnique : arrayUnique,
			/**
			 * @description
			 * 	로컬 환경 체크 : localhost || 192.168 ~ && :3000
			 * @type {Boolean}
			 */
			isLocal : isLocal,
			/**
			 * @description
			 * 	레퍼러 체크 - 유효 레퍼러(kolocommon내 url) 일시 url 반환
			 * @type {String}
			 */
			getReferrer : getReferrer,
			/**
			 * @description 
			 * 	IE Detection
			 * @type {Boolean}
			 */
			isIE : isIE
		};
	}

	function isIe() {
		return (navigator.userAgent.indexOf("Trident") != -1);
	}

	function isMobile() {
		var UserAgent = navigator.userAgent;
		return (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null);
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
		return (name) ? getUrlVars(href)[name] : getUrlVars(href);
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
		return (name) ? getHashVars(href)[name] : getHashVars(href);
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
	
	function removeComma(num) {
		return Number(String(num).replace(/,/, ''));
	}

	function currencyFormat(num) {
		return comma(num, 3);
	}

	function mobileNumberFormat(enteredId) {
		if (enteredId == undefined || enteredId == null) {
			return '';
		} else {
			return enteredId.substr(0, 3)+'-'+enteredId.substr(3, enteredId.length-7)+'-'+enteredId.substr(-4, 4);
		}
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

	function makeMultipartForm(image, filename, format) {
		if (format == undefined) {
			var extension =  filename.toLowerCase().substr(-3);
			switch(extension) {
				case 'peg':
				case 'jpg':
					format = 'image/jpg';
					break;
				case 'png':
					format = 'image/png';
					break;
				case 'gif':
					format = 'image/gif';
					break;
			}
		} else if (filename == undefined) {
			var extension = '';
			switch(format) {
				case 'image/jpeg':
				case 'image/jpg':
					extension = 'jpg';
					break;
				case 'image/png':
					extension = 'png';
					break;
				case 'image/gif':
					extension = 'gif';
					break;
			}
			if (extension != '') filename = 'img'+(new Date()).getTime()+'-'+Math.floor(Math.random()*10000)+'.'+extension;
		}

		if (filename != undefined) {
			var boundary = '----'+(new Date()).getTime();
			var bodyString = [];
			bodyString.push(
				'--' + boundary,
				'Content-Disposition: form-data; name="' + "file" + '"; ' + 'filename="' + filename + '"',
				'Content-Type: ' + format,
				'Content-Transfer-Encoding: base64', '',
				image.substring(image.indexOf('base64,')+7)
			);  
			bodyString.push('--' + boundary + '--','');
			var content = bodyString.join('\r\n');

			return {
				content: content,
				headers: {
					'Content-Type': 'multipart/form-data; boundary='+boundary,
					'Content-Length': content.length
				}
			};
		} else {
			return false;
		}
	}

	// @see http://stackoverflow.com/questions/1960473/unique-values-in-an-array#answer-18262186
	function arrayUnique(arr, keepLast) {
		return arr.filter(function(value, index, array) {
			return keepLast ? array.indexOf(value, index + 1) < 0 : array.indexOf(value) === index;
		});
	}

	function isLocal() {
		return (/localhost/).test(location.host) || (location.host.indexOf('192.168.') > -1 && location.port === '3000');
	}

	function getReferrer() {
		var referrer = window.document.referrer;

		if (!referrer) {
			return '';
		}

		if (isLocal() || (/koloncommon/).test(referrer)) {
			return (referrer.indexOf('/member/') === -1) ? referrer : '';
		} else {
			return '';
		}
	}

	function isIE(userAgent) {
		userAgent = userAgent || navigator.userAgent;
		return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge/") > -1;
	}

}