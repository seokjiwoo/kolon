/* global $ */

module.exports = ClassLivingServiceController().getInstance();

function ClassLivingServiceController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = LivingServiceController();
			return instance;
		}
	};
	
	function LivingServiceController() {
		callerObj = {
			/**
			 * 이사 서비스 주소검색
			 */
			movingAddressList: movingAddressList,
			/**
			 * 이사 서비스 업체검색
			 */
			movingCompanyList: movingCompanyList
		}
		
		return callerObj;	
	};
	
	/**
	 * 이사 서비스 주소검색
	 */
	function movingAddressList(sido) {
		if (sido == undefined) sido = '';

		Super.callApi('/apis/living/moving/address/'+sido, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('movingAddressListResult', [status, result.data]);
			} else {
				Super.handleError('movingAddressList', result);
				$(callerObj).trigger('movingAddressListResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 이사 서비스 업체검색
	 */
	function movingCompanyList(regionCode) {
		Super.callApi('/apis/living/moving/company/'+regionCode, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('movingCompanyListResult', [status, result.data]);
			} else {
				Super.handleError('movingCompanyList', result);
				$(callerObj).trigger('movingCompanyListResult', [status, result]);
			}
		}, false);
	};
}
