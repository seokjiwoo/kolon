/* jshint node: true, strict: true */
/* global $ */

module.exports = function() {
	'use strict';
	
	var util = require('../../utils/Util.js');
	var controller = require('../../controller/AddressController.js'); 
	$(controller).on('addressResult', addressHandler);
	$(controller).on('addAddressResult', addAddressResultHandler);
	$(controller).on('editAddressResult', editAddressResultHandler); 
	
	var SuperClass = require('../../pagesCommon/PageCommon.js'),
	Super = SuperClass();

	var seq;

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();

		if (util.getUrlVar('seq') != undefined) {
			seq = util.getUrlVar('seq');
			controller.getAddress(seq);
		} else {
			seq = -1;
		}
		$('#findZipCodeButton').click(findZipCode);
		$('#addressForm').submit(addressSubmitHandler);
	};

	function addressHandler(e, status, data) {
		var phoneNumber = util.mobileNumberFormat(data.cellPhoneNumber).split('-');
		$('#adrName1').val(data.addressManagementName);
		$('#adrName2').val(data.receiverName);
		$('#zipCode').val(data.zipCode);
		$('#jibunAddress').text(data.lotBaseAddress);
		$('#roadAddress').val(data.roadBaseAddress);
		$('#extraAddress').val(data.detailAddress);
		$('#regionCode').val(data.regionCode);
		$('#phone1').val(phoneNumber[0]);
		$('#phone2').val(phoneNumber[1]);
		$('#phone3').val(phoneNumber[2]);
		$('#extraAddress').removeAttr('disabled');
	};

	function findZipCode(e) {
		new daum.Postcode({
			oncomplete: function(data) {
				var extraRoadAddr = ''; // 도로명 조합형 주소 변수

				if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) extraRoadAddr += data.bname;
				if (data.buildingName !== '' && data.apartment === 'Y') extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
				if (extraRoadAddr !== '') extraRoadAddr = ' (' + extraRoadAddr + ')';

				$('#zipCode').val(data.zonecode);
				$('#roadAddress').val(data.roadAddress);
				$('#extraAddress').val(extraRoadAddr);
				$('#jibunAddress').text(data.jibunAddress);
				$('#regionCode').val(data.bcode.substr(0, 5)+'00000');	// 구까지만 필요함. 동은 짤라버리는 걸로.

				$('#extraAddress').removeAttr('disabled');
				$('#findZipCode').hide();
			},
            width : '100%',
            height : '100%'
		}).embed(document.getElementById('findZipCode'));
		$('#findZipCode').css({
			position:'fixed',
			top:0, left:0, width:'90%', height:'90%', padding:'5%', zIndex:2, background:'rgba(0,0,0,0.5)'
		}).show();
	};

	function addressSubmitHandler(e) {
		e.preventDefault();

		var phoneNumber = String($('#phone1').val())+$('#phone2').val()+$('#phone3').val();
		var addressSectionCode = $('#basicAddrFlag').hasClass('on') ? 'BM_ADDR_SECTION_02' : 'BM_ADDR_SECTION_03';
		
		var adrName1Val = $.trim($('#adrName1').val());
		var adrName2Val = $.trim($('#adrName2').val());

		if (adrName1Val == '' || true == adrName1Val.contains('주소 별칭을 입력해 주세요')) {
			alert('주소 별칭을 입력해 주세요');
			return;
		} else if (adrName2Val == '' || true == adrName2Val.contains('이름을 입력해 주세요')) {
			alert('이름을 입력해 주세요');
			return;
		} else if ($.trim($('#phone2').val()) == '' || $.trim($('#phone3').val()) == '') {
			alert('연락처를 입력해 주세요');
			return;
		} else if (!util.checkValidMobileNumber(phoneNumber)) {
			alert('올바른 연락처를 입력해 주세요');
			return;
		} else if ($.trim($('#zipCode').val()) == '') {
			alert('주소를 입력해 주세요');
			return;
		} else { 
			var addressObject = {
				"addressManagementName": $('#adrName1').val(),
				"zipCode": $('#zipCode').val(),
				"regionCode": $('#regionCode').val(),
				"lotBaseAddress": $('#jibunAddress').text(),
				"roadBaseAddress": $('#roadAddress').val(),
				"detailAddress": $('#extraAddress').val(),
				"receiverName": $('#adrName2').val(),
				"cellPhoneNumber": phoneNumber,
				"addressSectionCode": addressSectionCode
			}

			if (seq == -1) {
				controller.addAddress(addressObject);
			} else {
				controller.editAddress(seq, addressObject);
			}
		}
	};

	function addAddressResultHandler(e, status, result) {
		if (status == 200) {
			alert('완료되었습니다');
		} else {
			alert(result.message);
		}
		window.opener.refreshAddressData();
		location.href = 'addressBook.html';
	};

	function editAddressResultHandler(e, status, result) {
		if (status == 200) {
			alert('완료되었습니다');
		} else {
			alert(result.message);
		}
		window.opener.refreshAddressData();
		location.href = 'addressBook.html';
	};
}