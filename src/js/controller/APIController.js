/* global $ */

module.exports = function() {
	var localFlag = (/localhost/).test(document.URL);
	var API_URL = localFlag ? 'http://uppp.oneplat.co/' : document.URL.split('/')[0]+'//'+document.URL.split('/')[2]+'/';
	var CDN_URL = localFlag ? 'http://cdn.oneplat.co/' : document.URL.split('/')[0]+'//'+document.URL.split('/')[2]+'/';
	
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
				contentType: "application/json"
			}
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
		if (result != undefined) {
			if (result.status == '401' && result.errorCode == '1603') {
				alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
				location.href = '/member/logout.html';
			}
		}
	};
}

