/* global $ */

module.exports = ClassHelpController().getInstance();

function ClassHelpController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = HelpController();
			return instance;
		}
	};
	
	function HelpController() {
		callerObj = {
			/**
			 * 도움말 리스트
			 */
			helpList: helpList,
			/**
			 * 도움말 상세
			 */
			helpDetail: helpDetail,
			/**
			 * 전화상담 신청
			 */
			applyCounsel: applyCounsel
		}
		
		return callerObj;	
	};
	
	function helpList() {
		Super.callApi('/apis/help', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('helpListResult', [200, result]);
			} else {
				Super.handleError('helpList', result);
			}
		}, true);
	};
	
	function helpDetail(id) {
		Super.callApi('/apis/help/'+id, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('helpDetailResult', [200, result]);
			} else {
				Super.handleError('helpDetail', result);
			}
		}, true);
	};
	
	function applyCounsel(productNumber, phoneNumber) {
		Super.callApi('/apis/apply/counsel', 'POST', {
			"customerPhoneNumber": phoneNumber,
			"productNumber": productNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('applyCounselResult', [200, result.data]);
			} else {
				Super.handleError('applyCounsel', result);
				$(callerObj).trigger('applyCounselResult', [result.status]);
			}
		}, false);
	};
}

