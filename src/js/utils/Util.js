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
			 * @param {String} name query var
			 */
			getUrlVar: getUrlVar
		}
	};
	
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