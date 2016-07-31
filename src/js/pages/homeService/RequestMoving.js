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
	$(controller).on('movingDateListResult', movingDateListHandler);
	$(controller).on('movingCompanyListResult', movingCompanyListHandler);
	$(controller).on('requestMovingResult', requestMovingResultHandler);
	$(controller).on('movingServiceAvailableResult', movingServiceAvailableResultHandler);
	$(controller).on('fineDayResult', movingServiceFineDayResultHandler);
	
	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var originAddress;
	var targetAddress;
	var addressBookTarget;
	
	var mCode;
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');

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
			debug.log( $(this).attr('id').substr(5) );
		});
	}

	function myInfoResultHandler() {
		var loginData = loginDataModel.loginData();
		
		if (loginData == null) {
			$(document).trigger('needLogin');
		} else {
			$('#name').val(loginData.memberName);
			$('#phoneNumber').val(loginData.phone);
		}
	}

	function setDatePicker() {
		var datePicker = $('.js-picker');

		DatePicker.init({default:{
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
			dateFormat : 'yy.mm.dd',
			minDate: 2,
			onSelect : $.noop,
			changeYear: true,
			changeMonth: true,
			disabled: true,
			showOn: "off",
			onChangeMonthYear: function(year, month, inst) {
				mCode = String(year);
				mCode += (month < 10 ? '0'+month : month);
				controller.movingDateList(originAddress.regionCode, mCode);
				controller.movingServiceFineDay($('#moveDate').datepicker('getDate').getFullYear(), $('#moveDate').datepicker('getDate').getMonth());
			}
		}});
		$('#moveDate').addClass('disabled');

		$('.js-picker .js-alt,.js-btn').click(function(e) {
			if ($('#moveDate').hasClass('disabled')) {
				e.stopImmediatePropagation();
				alert("이사 출발지를 먼저 선택해주세요");
				$('#moveDate').datepicker("hide");
			} else if ($('#moveDate').hasClass('cal-show')) {
				mCode = moment($('#moveDate').datepicker('getDate')).format('YYYYMM');
				controller.movingDateList(originAddress.regionCode, mCode);
				controller.movingServiceFineDay($('#moveDate').datepicker('getDate').getFullYear(), $('#moveDate').datepicker('getDate').getMonth());
			}
		});
	};

	function movingServiceFineDayResultHandler(e, status, result) {
		$.map(result.nohands, function(each){
			$('.ui-datepicker-calendar').find('a:contains("'+each+'")').addClass('noHands');
		});
	};

	function movingDateListHandler(e, status, result) {
		debug.log(result);
	};

	function movingCompanyListHandler(e, status, result) {
		if (status == 200) {
			if (result.livingCompanyList.length == 0) {
				$('#companyListWrap').text('검색된 이사업체가 없습니다.');
				controller.movingServiceAvailable(originAddress.regionCode);
			} else {
				var template = window.Handlebars.compile($('#moving-company-templates').html());
				var elements = $(template(result.livingCompanyList));
				$('#companyListWrap').empty().append(elements);
				
				$('.tabWrap a').on('click', function(e) {// common tab
					e.preventDefault();
					var tabBtn = $(this);
					$(tabBtn).parent().addClass('on').siblings().removeClass('on');
				});
			}
		} else {
			alert('/apis/living/moving/company/ - '+status+':'+result.message);
		}
	};

	function movingServiceAvailableResultHandler(e, status, result) {
		if (result.movingServiceYn == 'N') {
			alert("이사 출발지를 확인해주세요.");
			$('#companyListWrap').text('이사 출발지를 확인해주세요.');
		}
	};

	function refreshAddressDataHandler(e) {
		addressController.addressList();
	};

	function addressListHandler(e, status, list) {
		if (list.items.length == 0) {
			$('#originAddressDrop').parent().hide();
			$('#targetAddressDrop').parent().hide();
		} else {
			$('#originAddressDrop').parent().show();
			$('#targetAddressDrop').parent().show();

			var tags1 = '<li><a id="originLabel" href="#">이사 출발지 주소를 입력해주세요.</a></li>';
			var tags2 = '<li><a id="targetLabel" href="#">이사 도착지 주소를 입력해주세요.</a></li>';
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
		}
	};

	function setAddress(addressType, seq) {
		var addressObject = addressArray[seq];
		$('#'+addressType+'Address').html('<dt>- 도로명</dt><dd>'+addressObject.roadBaseAddress+'</dd><dt>- 지번</dt><dd>'+addressObject.lotBaseAddress+'</dd><dt>- 상세주소</dt><dd>'+addressObject.detailAddress+'</dd>');
		switch(addressType) {
			case 'origin': 
				originAddress = addressObject;
				$('#moveDate').removeClass('disabled');
				$("#moveDate").datepicker("option", "disabled", false);
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
		
		var requestTargetName = $('#name').pVal();
		var requestTargetContact = $('#phoneNumber').pVal();
		var movingTypeCode = $(':radio[name="hTp"]:checked').pVal();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if (originAddress == undefined) {
			alert('서비스 지역을 선택해 주세요');
		} else if (movingTypeCode == undefined) {
			alert('서비스 종류를 선택해 주세요');
		} else {
			controller.movingCompanyList(moment($('#moveDate').datepicker('getDate')).format('YYYY-MM-DD'), originAddress.regionCode);
		}
	};

	function requestMovingSubmit(e) {
		e.preventDefault();
		var requestTargetName = $('#name').pVal();
		var requestTargetContact = $('#phoneNumber').pVal();
		var movingTypeCode = $(':radio[name="hTp"]:checked').pVal();
		var comment = $('#additionalComments').pVal();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if (movingTypeCode == undefined) {
			alert('서비스 종류를 선택해 주세요');
		} else if ($('#companyListWrap').find('.on').data() == undefined ) {
			alert('서비스 업체를 선택해 주세요');
		} else if (!$('#agree01lb').hasClass('on')) {
			alert('개인정보 제 3자 제공에 동의해 주세요');
		} else {
			originAddress.addressSectionCode = 'LS_ADDR_SECTION_01';
			targetAddress.addressSectionCode = 'LS_ADDR_SECTION_02'; 
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