/* global $ */

module.exports = function() {
	var localFlag = (/localhost/).test(document.URL) || (location.host.indexOf('192.168.') > -1 && location.port === '3000');
	var API_URL = localFlag ? 'https://dev.koloncommon.com/' : document.URL.split('/')[0]+'//'+document.URL.split('/')[2]+'/';
	var CDN_URL = localFlag ? 'https://dev.koloncommon.com/' : document.URL.split('/')[0]+'//'+document.URL.split('/')[2]+'/';
	
	var debug = require('../utils/Console.js');
	
	$.ajaxSetup({
		type: "POST"
	});
	
	var callerObj;
	
	var loadingFlag = false;
	
	var callerObj = {
		API_URL: API_URL,
		/**
		 * Request AJAX call
		 */
		callApi: callApi,
		/**
		 * 에러 핸들링
		 */
		handleError: handleError
	};
	
	return callerObj;
	
	/**
	 * Request AJAX call
	 */
	function callApi(url, method, data, callback, forceFlag) {
		if (loadingFlag == false || forceFlag == true) {
			loadingFlag = true;
			var ajaxOptions = {
				url: API_URL+url,
				method: method,
				xhrFields: {
					withCredentials: true
				},
				headers: {
					"uppp_screen_width": $(window).width()
				},
				contentType: "application/json"
			}
			/*
			
			*/
			switch(method) {
				case 'POST':
				case 'PUT':
				case 'DELETE':
					ajaxOptions.data = JSON.stringify(data);
					break;
				case 'GET':
					if (data !== {}) {
						ajaxOptions.data = data;
					}
					break;
			}
			
			$.ajax(ajaxOptions).done(function(data, textStatus, jqXHR) {
				//debug.log(url, data, textStatus, jqXHR);
				loadingFlag = false;
				callback.call(this, jqXHR.status, data);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				//debug.log(url, jqXHR, textStatus, errorThrown);
				loadingFlag = false;
				callback.call(this, jqXHR.status, jqXHR.responseJSON);
			});
		}
	};
	
	/**
	 * Error Handler
	 */
	function handleError(callerId, result) {
		debug.log('ERROR ON', callerId, result);
		if (result != undefined) {
			/* if (result.status == '401' && result.errorCode == '1603') {
				alert('로그인이 필요한 페이지입니다.');
				location.href = '/member/logout.html';
			} */
		}
	};
}

