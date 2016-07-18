/* global $ */

module.exports = ClassHomeServiceController().getInstance();

function ClassHomeServiceController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = HomeServiceController();
			return instance;
		}
	};
	
	function HomeServiceController() {
		callerObj = {
			/**
			 * 이사 서비스 주소검색
			 */
			movingAddressList: movingAddressList,
			/**
			 * 이사 서비스 가능날짜 검색
			 */
			movingDateList: movingDateList,
			/**
			 * 이사 서비스 업체검색
			 */
			movingCompanyList: movingCompanyList,
			/**
			 * 이사 서비스 신청
			 */
			requestMoving: requestMoving,
			/**
			 * 홈서비스 신청 리스트
			 */
			homeServiceOrderList: homeServiceOrderList,
			homeServiceCancelList: homeServiceCancelList,
			homeServiceDetailMoving: homeServiceDetailMoving
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
	 * 이사 서비스 가능날짜 검색
	 */
	function movingDateList(regionCode, yearMonth) {
		Super.callApi('/apis/living/moving/'+regionCode+'/availableDate', 'GET', {
			"searchDate": yearMonth
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('movingDateListResult', [status, result.data]);
			} else {
				Super.handleError('movingDateList', result);
				$(callerObj).trigger('movingDateListResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 이사 서비스 업체검색
	 */
	function movingCompanyList(date, regionCode) {
		Super.callApi('/apis/living/moving/'+regionCode+'/company/', 'GET', {
			movingDate: date
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('movingCompanyListResult', [status, result.data]);
			} else {
				Super.handleError('movingCompanyList', result);
				$(callerObj).trigger('movingCompanyListResult', [status, result]);
			}
		}, false);
	};

	/**
	 * 이사 서비스 신청
	 */
	function requestMoving(startAddress, arriveAddress, movingService, livingService) {
		Super.callApi('/apis/living/moving', 'POST', {
			"startAddress": startAddress,
			"arriveAddress": arriveAddress,
			"movingService": movingService,
			"livingService": livingService
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('requestMovingResult', [status, result.data]);
			} else {
				Super.handleError('requestMoving', result);
				$(callerObj).trigger('requestMovingResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 홈서비스 신청 리스트
	 */
	function homeServiceOrderList(searchRequest, startDate, endDate, page, size) {
		Super.callApi('/apis/living/', 'GET', {
			"searchRequest": searchRequest,
			"startDate": startDate,
			"endDate": endDate,
			"status": "REQUEST"
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('homeServiceOrderListResult', [status, result.data]);
			} else {
				Super.handleError('homeServiceOrderList', result);
				$(callerObj).trigger('homeServiceOrderListResult', [status, result]);
			}
		}, false);
	};

	/**
	 * 홈서비스 취소 리스트
	 */
	function homeServiceCancelList(searchRequest, startDate, endDate, page, size) {
		Super.callApi('/apis/living/', 'GET', {
			"searchRequest": searchRequest,
			"startDate": startDate,
			"endDate": endDate,
			"status": "CANCEL"
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('homeServiceOrderListResult', [status, result.data]);
			} else {
				Super.handleError('homeServiceOrderList', result);
				$(callerObj).trigger('homeServiceOrderListResult', [status, result]);
			}
		}, false);
	};
	
	/**
	 * 홈서비스 디테일 (이사)
	 */
	function homeServiceDetailMoving(serviceRequestNumber) {
		Super.callApi('/apis/living/'+serviceRequestNumber, 'GET', {
			"serviceRequestNumber": serviceRequestNumber,
			"serviceSectionCode": "LS_SERVICE_TYPE_01"
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('homeServiceDetailResult', [status, result.data]);
			} else {
				Super.handleError('homeServiceDetail', result);
				$(callerObj).trigger('homeServiceDetailResult', [status, result]);
			}
		}, false);
	};
};