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
		var phoneNumber1 = util.mobileNumberFormat(data.cellPhoneNumber).split('-');
		var phoneNumber2 = util.mobileNumberFormat(data.generalPhoneNumber).split('-');
		$('#adrName1').val(data.addressManagementName);
		$('#adrName2').val(data.receiverName);
		$('#zipCode').val(data.zipCode);
		$('#jibunAddress').text(data.lotBaseAddress);
		$('#roadAddress').val(data.roadBaseAddress);
		$('#extraAddress').val(data.detailAddress);
		$('#regionCode').val(data.regionCode);
		$('#phone1').val(phoneNumber1[0]);
		$('#phone2').val(phoneNumber1[1]);
		$('#phone3').val(phoneNumber1[2]);
		$('#phone4').val(phoneNumber2[0]);
		$('#phone5').val(phoneNumber2[1]);
		$('#phone6').val(phoneNumber2[2]);
		$('#extraAddress').removeAttr('disabled');
		
		if (data.addressSectionCode == 'BM_ADDR_SECTION_02') {
			$('#adr1').prop('checked', 'checked');
			$('#basicAddrFlag').addClass('on');
		}
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

		var phoneNumber1 = String($('#phone1').pVal())+$('#phone2').pVal()+$('#phone3').pVal();
		var phoneNumber2 = String($('#phone4').pVal())+$('#phone5').pVal()+$('#phone6').pVal();
		if ($('#phone5').pVal()+$('#phone6').pVal() == '') phoneNumber2 = '';
		var addressSectionCode = $('#basicAddrFlag').hasClass('on') ? 'BM_ADDR_SECTION_02' : 'BM_ADDR_SECTION_03';
		
		var adrName1Val = $.trim($('#adrName1').pVal());
		var adrName2Val = $.trim($('#adrName2').pVal());

	

		if (adrName1Val == '') {
			alert('주소 별칭을 입력해 주세요');
			return;
		} else if (adrName2Val == '') {
			alert('이름을 입력해 주세요');
			return;
		} else if (util.byteLength(adrName1Val) > 100 ||util.byteLength(adrName2Val) > 100) {
			alert('한글 50자, 영문, 숫자 100자까지 가능합니다');
			return;
		} else if (($.trim($('#phone2').pVal()) == '' || $.trim($('#phone3').pVal()) == '') && ($.trim($('#phone5').pVal()) == '' || $.trim($('#phone6').pVal()) == '')) {
			alert('최소 1개의 연락처를 입력하세요');
			return;
		} else if (!util.checkValidPhoneNumber(phoneNumber1)) {
			alert('올바른 연락처를 입력해 주세요');
			return;
		} else if (!util.checkValidPhoneNumber(phoneNumber2) && ($('#phone5').pVal()+$('#phone6').pVal()) != '') {
			alert('올바른 연락처를 입력해 주세요');
			return;
		} else if ($.trim($('#zipCode').pVal()) == '') {
			alert('주소를 입력해 주세요');
			return;
		} else { 
			var addressObject = {
				"addressManagementName": $('#adrName1').pVal(),
				"zipCode": $('#zipCode').pVal(),
				"regionCode": $('#regionCode').pVal(),
				"lotBaseAddress": $('#jibunAddress').text(),
				"roadBaseAddress": $('#roadAddress').pVal(),
				"detailAddress": $('#extraAddress').pVal(),
				"receiverName": $('#adrName2').pVal(),
				"cellPhoneNumber": phoneNumber1,
				"generalPhoneNumber": phoneNumber2,
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