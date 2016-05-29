/* global $ */

module.exports = ClassUtils().getInstance();

function ClassUtils() {
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
			 * 이메일 주소 검증
			 * @param {String} value - email address for validation 
			 */
			checkVaildEmail: checkVaildEmail
		}
	};
	
	function checkVaildEmail(value) {
		value = $.trim(value);
		var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
		return ((value != '') && re.test(value));
	}
	
	function getUrlVar(name) {
		return getUrlVars()[name];
	};
	
	function getUrlVars() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?')+1).split('#')[0].split('&');
		
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	};
}