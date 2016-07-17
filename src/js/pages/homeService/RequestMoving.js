/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'homeService/RequestMoving.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	DropDownMenu = require('../../components/DropDownMenu.js'),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass();

	var controller = require('../../controller/HomeServiceController.js');
	//$(controller).on('movingAddressListResult', movingAddressListHandler);
	$(controller).on('movingCompanyListResult', movingCompanyListHandler);
	$(controller).on('requestMovingResult', requestMovingResultHandler);

	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var originAddress;
	var targetAddress;
	var addressBookTarget;

	$(document).on('refreshAddressData', refreshAddressDataHandler);
	$(document).on('selectAddressData', selectAddressDataHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);
	
		setDatePicker();

		refreshAddressDataHandler();
		/*controller.movingAddressList();

		$('#addressDrop1').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			controller.movingAddressList(data.values[0]);
		});

		$('#addressDrop2').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			controller.movingCompanyList(data.values[0]);
		});*/
		$('#getCompanyListButton').click(requestMovingCompany);
		$('#requestMovingForm').submit(requestMovingSubmit);
		$('#originAddressDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			setAddress('origin', data.values[0]);
		});
		$('#targetAddressDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			setAddress('target', data.values[0]);
		});
		$('.openAddressPopup').click(function(e) {
			addressBookTarget = $(this).attr('id').substr(5);
			console.log( $(this).attr('id').substr(5) );
		});
	}

	function setDatePicker() {
		var datePicker = $('.js-picker');
		DatePicker.init({
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
		});
	};

	/*function movingAddressListHandler(e, status, result) {
		if (result.sidoList != undefined) {
			var tags = '<ul class="drop" data-prevent="true"><li><a href="#">시/도</a></li>';
			for (var key in result.sidoList) {
				var each = result.sidoList[key];
				tags += '<li><a href="#" data-value="'+each.regionCode+'">'+each.sidoName+'</a></li>';
			}
			tags += '</ul>';

			$('#addressDrop1').html(tags);
		} else if (result.sigunguList != undefined) {
			console.log(result.sigunguList);

			var tags = '<ul class="drop" data-prevent="true"><li><a href="#">시군구</a></li>';
			for (var key in result.sigunguList) {
				var each = result.sigunguList[key];
				tags += '<li><a href="#" data-value="'+each.regionCode+'">'+each.sigunguName+'</a></li>';
			}
			tags += '</ul>';

			$('#addressDrop2').html(tags);
		}

		DropDownMenu.refresh();
	};*/

	function movingCompanyListHandler(e, status, result) {
		if (status == 200) {
			var template = window.Handlebars.compile($('#moving-company-templates').html());
			var elements = $(template(result.livingCompanyList));
			$('#companyListWrap').empty().append(elements);
			
			$('.tabWrap a').on('click', function(e) {// common tab
				e.preventDefault();
				var tabBtn = $(this);
				$(tabBtn).parent().addClass('on').siblings().removeClass('on');
			});
		} else {
			alert('/apis/living/moving/company/ - '+status+':'+result.message);
		}
	};

	function refreshAddressDataHandler(e) {
		addressController.addressList();
	};

	function addressListHandler(e, status, list) {
		var tags1 = '<li><a id="originLabel" href="#">선택해 주세요</a></li>';
		var tags2 = '<li><a id="targetLabel" href="#">선택해 주세요</a></li>';
		addressArray = new Array();
		$.map(list.items, function(each) {
			addressArray[each.addressSequence] = each;
			tags1 += '<li><a href="#" data-value="'+each.addressSequence+'">'+each.addressManagementName+'</a></li>';
			tags2 += '<li><a href="#" data-value="'+each.addressSequence+'">'+each.addressManagementName+'</a></li>';
		});
		$('#originAddressDrop').html(tags1);
		$('#targetAddressDrop').html(tags2);

		$('#originAddress').html('');
		$('#targetAddress').html(''); 
											
		DropDownMenu.refresh();
	};

	function setAddress(addressType, seq) {
		var addressObject = addressArray[seq];
		$('#'+addressType+'Address').html('<dt>- 도로명</dt><dd>'+addressObject.roadBaseAddress+'</dd><dt>- 지번</dt><dd>'+addressObject.lotBaseAddress+'</dd><dt>- 상세주소</dt><dd>'+addressObject.detailAddress+'</dd>');
		switch(addressType) {
			case 'origin': 
				originAddress = addressObject;
				break;
			case 'target':
				targetAddress = addressObject;
				break; 
		}
	}

	function selectAddressDataHandler(e, seq) {
		setAddress(addressBookTarget, seq);
		$('#'+addressBookTarget+'Label').text(addressArray[seq].addressManagementName);
	};

	function requestMovingCompany(e) {
		e.preventDefault();
		if (originAddress == undefined) {
			alert('서비스 지역을 선택해 주세요');
		} else {
			controller.movingCompanyList(moment($('#moveDate').datepicker('getDate')).format('YYYY-MM-DD'), originAddress.regionCode);
		}
	};

	function requestMovingSubmit(e) {
		e.preventDefault();
		var requestTargetName = $('#name').val();
		var requestTargetContact = $('#phoneNumber').val();
		var movingTypeCode = $(':radio[name="hTp"]:checked').val();
		var comment = $('#additionalComments').val();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if (movingTypeCode == undefined) {
			alert('서비스 종류를 선택해 주세요');
		} else if ($('#companyListWrap').find('.on').data() == undefined ) {
			alert('서비스 업체를 선택해 주세요');
		} else {
			var movingService = {
				"movingDate": moment($('#moveDate').datepicker('getDate')).format('YYYY-MM-DD'),
				"movingTypeCode": movingTypeCode
			}
			var livingService = {
				"addRequestContents": comment,
				"companyNumber": $('#companyListWrap').find('.on').data().companyNumber,
				"requestTargetContact": requestTargetContact,
				"requestTargetName": requestTargetName,
				"serviceSectionCode": "LS_SERVICE_TYPE_01",
				"termsNumber": 0
			}
			controller.requestMoving(originAddress, targetAddress, movingService, livingService);
		}
	}

	function requestMovingResultHandler(e, status, result) {
		if (status == 200) {
			alert('신청이 완료 되었습니다. 업체에서 확인 후 빠른 시간 내에 연락 드리겠습니다.');
			location.href = '/homeService/#move';
		} else {
			alert(status+': '+result.message);
		}
	}
};