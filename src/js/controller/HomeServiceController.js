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
			 * 세탁 서비스 주소검색
			 */
			washingCompanyList: washingCompanyList,
			/**
			 * 세탁 서비스 시간검색
			 */
			washingTimeList: washingTimeList,
			/**
			 * 세탁 서비스 신청
			 */
			requestWashing: requestWashing,
			/**
			 * 세탁 서비스 픽업 변경 가능 시간대 조회
			 */
			changeWashingPickupTimeList: changeWashingPickupTimeList,
			/**
			 * 세탁 서비스 픽업 변경
			 */
			changeWashingPickupTime: changeWashingPickupTime,
			/**
			 * 세탁 서비스 배달 변경 가능 시간대 조회
			 */
			changeWashingDeliveryTimeList: changeWashingDeliveryTimeList,
			/**
			 * 세탁 서비스 배달 변경
			 */
			changeWashingDeliveryTime: changeWashingDeliveryTime,
			/**
			 * 세탁 서비스 취소
			 */
			cancelWashing: cancelWashing,
			/**
			 * 홈서비스 신청 리스트
			 */
			homeServiceOrderList: homeServiceOrderList,
			/**
			 * 홈서비스 취소 리스트
			 */
			homeServiceCancelList: homeServiceCancelList,
			/**
			 * 홈서비스 상세
			 */
			homeServiceDetailMoving: homeServiceDetailMoving,
			homeServiceDetailWashing: homeServiceDetailWashing
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
	 * 세탁서비스 가능여부 검색
	 */
	function washingCompanyList(address) {
		Super.callApi('/apis/living/wash/address', 'POST', {
			"address": address
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('washingCompanyResult', [status, result]);
			} else {
				Super.handleError('washingCompanyList', result);
				$(callerObj).trigger('washingCompanyResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 세탁서비스 가능시각 검색
	 */
	function washingTimeList(address) {
		Super.callApi('/apis/living/wash/dateTime', 'POST', {
			"address": address
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('washingTimeResult', [status, result]);
			} else {
				Super.handleError('washingTimeList', result);
				$(callerObj).trigger('washingTimeResult', [status, result]);
			}
		}, true);
	}

	/**
	 * 세탁서비스 신청
	 */
	function requestWashing(companyCode, addressRequest, livingService, washServiceRequest) {
		Super.callApi('/apis/living/wash/'+companyCode, 'POST', {
			"addressRequest": addressRequest,
			"livingService": livingService,
			"washServiceRequest": washServiceRequest
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('requestWashingResult', [status, result.data]);
			} else {
				Super.handleError('requestWashing', result);
				$(callerObj).trigger('requestWashingResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 세탁서비스 수거시간 변경 날짜 조회
	 */
	function changeWashingPickupTimeList(companyCode, orderNumber) {
		Super.callApi('/apis/living/wash/pickupTime/'+companyCode+'/'+orderNumber, 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('changeWashingPickupTimeListResult', [status, result.data]);
			} else {
				Super.handleError('changeWashingPickupTimeList', result);
				$(callerObj).trigger('changeWashingPickupTimeListResult', [status, result]);
			}
		}, false);
	}
	
	/**
	 * 세탁서비스 수거시간 변경
	 */
	function changeWashingPickupTime(companyCode, orderNumber, dateTime, serviceDateTimeRequest) {
		Super.callApi('/apis/living/wash/pickupTime/'+companyCode+'/'+orderNumber, 'PUT', {
			"dateTime": dateTime,
			"serviceDateTimeRequest": serviceDateTimeRequest
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('changeWashingPickupTimeResult', [status, result.data]);
			} else {
				Super.handleError('changeWashingPickupTime', result);
				$(callerObj).trigger('changeWashingPickupTimeResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 세탁서비스 배달시간 변경 날짜 조회
	 */
	function changeWashingDeliveryTimeList(companyCode, orderNumber) {
		Super.callApi('/apis/living/wash/pickupTime/'+companyCode+'/'+orderNumber, 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('changeWashingDeliveryTimeListResult', [status, result.data]);
			} else {
				Super.handleError('changeWashingDeliveryTimeList', result);
				$(callerObj).trigger('changeWashingDeliveryTimeListResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 세탁서비스 배달시간 변경
	 */
	function changeWashingDeliveryTime(companyCode, orderNumber, dateTime, serviceDateTimeRequest) {
		Super.callApi('/apis/living/wash/pickupTime/'+companyCode+'/'+orderNumber, 'PUT', {
			"dateTime": dateTime,
			"serviceDateTimeRequest": serviceDateTimeRequest
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('changeWashingDeliveryTimeResult', [status, result.data]);
			} else {
				Super.handleError('changeWashingDeliveryTime', result);
				$(callerObj).trigger('changeWashingDeliveryTimeResult', [status, result]);
			}
		}, false);
	}

	/**
	 * 세탁서비스 취소
	 */
	function cancelWashing(companyCode, orderNumber, reason) {
		Super.callApi('/apis/living/wash/'+companyCode+'/'+orderNumber, 'DELETE', {
			"washStateReason": reason
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('cancelWashingResult', [status, result.data]);
			} else {
				Super.handleError('cancelWashing', result);
				$(callerObj).trigger('cancelWashingResult', [status, result]);
			}
		}, false);
	}
	
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

	/**
	 * 홈서비스 디테일 (세탁)
	 */
	function homeServiceDetailWashing(serviceRequestNumber) {
		Super.callApi('/apis/living/'+serviceRequestNumber, 'GET', {
			"serviceRequestNumber": serviceRequestNumber,
			"serviceSectionCode": "LS_SERVICE_TYPE_02"
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