/* global $ */

module.exports = function() {
	var API_URL = 'http://uppp.oneplat.co/';
	var CDN_URL = 'http://cdn.oneplat.co/';
	
	$.ajaxSetup({
		type: "POST"
	});
	
	var callerObj;
	
	var loadingFlag = false;
	
	var callerObj = {
		/**
		 * 소셜 로그인 URL 목록 요청
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
			var ajaxOptions;
			if (method == 'GET') {
				ajaxOptions = {
					url: API_URL+url,
					method: method
				}
			} else {
				ajaxOptions = {
					url: API_URL+url,
					method: method,
					data: JSON.stringify(data),
					contentType: "application/json"
				}
			}
			
			$.ajax(ajaxOptions).done(function(data, textStatus, jqXHR) {
				loadingFlag = false;
				callback.call(this, jqXHR.status, data);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				loadingFlag = false;
				callback.call(this, {
					status: jqXHR.status,
					message: errorThrown
				});
			});
		}
	};
	
	/**
	 * Error Handler
	 */
	function handleError(callerId, result) {
		console.log('ERROR ON', callerId, result);
	};
}

