/* global $ */

module.exports = ClassAddressController().getInstance();

function ClassAddressController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = AddressController();
			return instance;
		}
	};
	
	function AddressController() {
		callerObj = {
			/**
			 * 주소록 목록
			 */
			addressList: addressList,
			/**
			 * 주소록 단건조회
			 */
			getAddress: getAddress,
			/**
			 * 주소록 추가
			 */
			addAddress: addAddress,
			/**
			 * 주소록 수정
			 */
			editAddress: editAddress,
			/**
			 * 주소록 삭제
			 */
			deleteAddress: deleteAddress
		}
		
		return callerObj;	
	};
	
	function addressList() {
		Super.callApi('/apis/order/addresses', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addressListResult', [200, result.data]);
			} else {
				Super.handleError('addressList', result);
				$(callerObj).trigger('addressListResult', [status, result]);
			}
		}, false);
	};
	
	function getAddress(seq) {
		Super.callApi('/apis/order/addresses/'+seq, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addressResult', [200]);
			} else {
				Super.handleError('addressList', result);
				$(callerObj).trigger('addressResult', [status, result]);
			}
		}, false);
	};
	
	function addAddress(managementName, zipCode, lotBaseAddress, streetAddress, detailAddress, receiverName, cellPhoneNumber, fixedPhoneNumber) {
		Super.callApi('/apis/order/addresses', 'POST', {
			"addressSectionCode": "BM_ADDR_SECTION_01",
			"addressManagementName": managementName,
			"zipCode": zipCode,
			"lotBaseAddress": lotBaseAddress,
			"roadBaseAddress": streetAddress,
			"detailAddress": detailAddress,
			"receiverName": receiverName,
			"cellPhoneNumber": cellPhoneNumber,
			"generalPhoneNumber": fixedPhoneNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addressResult', [200]);
			} else {
				Super.handleError('addressList', result);
				$(callerObj).trigger('addressResult', [status, result]);
			}
		}, false);
	};
	
	function editAddress(seq, managementName, zipCode, lotBaseAddress, streetAddress, detailAddress, receiverName, cellPhoneNumber, fixedPhoneNumber) {
		Super.callApi('/apis/order/addresses/'+seq, 'PUT', {
			"addressSectionCode": "BM_ADDR_SECTION_01",
			"addressManagementName": managementName,
			"zipCode": zipCode,
			"lotBaseAddress": lotBaseAddress,
			"roadBaseAddress": streetAddress,
			"detailAddress": detailAddress,
			"receiverName": receiverName,
			"cellPhoneNumber": cellPhoneNumber,
			"generalPhoneNumber": fixedPhoneNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addressResult', [200]);
			} else {
				Super.handleError('addressList', result);
				$(callerObj).trigger('addressResult', [status, result]);
			}
		}, false);
	};
	
	function deleteAddress(seq) {
		Super.callApi('/apis/order/addresses/'+seq, 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('deleteAddressResult', [200]);
			} else {
				Super.handleError('deleteAddress', result);
				$(callerObj).trigger('deleteAddressResult', [status, result]);
			}
		}, false);
	};
}

