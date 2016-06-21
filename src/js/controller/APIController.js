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
			var ajaxOptions = {
				url: API_URL+url,
				method: method,
				xhrFields: {
					withCredentials: true
				},
				contentType: "application/json"
			}
			switch(method) {
				case 'POST':
					ajaxOptions.data = JSON.stringify(data);
					break;
				case 'GET':
				case 'PUT':
				case 'DELETE':
					// does nothing yet
					break;
			}
			
			$.ajax(ajaxOptions).done(function(data, textStatus, jqXHR) {
				//console.log(url, data, textStatus, jqXHR);
				loadingFlag = false;
				callback.call(this, jqXHR.status, data);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				//console.log(url, jqXHR, textStatus, errorThrown);
				loadingFlag = false;
				callback.call(this, jqXHR.status, jqXHR.responseJSON);
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

