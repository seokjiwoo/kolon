/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'homeService/RequestWashing.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	DropDownMenu = require('../../components/DropDownMenu.js'),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass();

	var controller = require('../../controller/HomeServiceController.js');
	$(controller).on('washingTimeResult', washingTimeHandler);
	$(controller).on('washingCompanyResult', washingCompanyListHandler);
	//$(controller).on('requestWashingResult', requestWashingResultHandler);

	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var timeArray;
	var serviceAddress;
	
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
		$('.washCompany').hide();

		$('#getCompanyListButton').click(requestWashingCompany);
		$('#requestWashingForm').submit(requestWashingSubmit);
		$('#addressDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			setAddress(data.values[0]);
		});
		$('#buttonPop').on('click', function(e) {
			Super.Super.htmlPopup('../../_popup/priceChart.html', 590, 'popEdge', {
				onOpen: function() {
					$('.tabBox a').on('click focusin',function(){
						var idx = $('.tabBox a').index(this);
						$('.tabBox a').removeClass('on').eq(idx).addClass('on');
						$('.tabCont').removeClass('on').eq(idx).addClass('on');
					});
				}
			});
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
		DatePicker.init({
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
			changeYear: true,
			changeMonth: true,
			disabled: true,
			minDate: 0,
			showOn: "off"
		});

		$('#washDate').datepicker("option", "maxDate", new Date(moment().add(7, 'day')));
		$('#washDate').addClass('disabled');
	};

	function refreshAddressDataHandler(e) {
		addressController.addressList();
	};

	function selectAddressDataHandler(e, seq) {
		$('#addressLabel').text(addressArray[seq].addressManagementName);
	};

	function addressListHandler(e, status, list) {
		if (list.items.length == 0) {
			$('#addressDrop').parent().hide();
		} else {
			$('#addressDrop').parent().show();

			var tags1 = '<li><a id="addressLabel" href="#">주소를 입력해주세요.</a></li>';
			addressArray = new Array();
			$.map(list.items, function(each) {
				addressArray[each.addressSequence] = each;
				tags1 += '<li><a href="#" data-value="'+each.addressSequence+'">'+each.addressManagementName+'</a></li>';
			});
			$('#addressDrop').html(tags1);

			//$('#address').html('');
			DropDownMenu.refresh();
		}
	};

	function setAddress(seq) {
		var addressObject = addressArray[seq];
		$('#washingAddress').html('<dt>- 도로명</dt><dd>'+addressObject.roadBaseAddress+'</dd><dt>- 지번</dt><dd>'+addressObject.lotBaseAddress+'</dd><dt>- 상세주소</dt><dd>'+addressObject.detailAddress+'</dd>');
		serviceAddress = addressObject;

		controller.washingCompanyList(serviceAddress.roadBaseAddress+' '+serviceAddress.detailAddress);
		controller.washingTimeList(serviceAddress.roadBaseAddress+' '+serviceAddress.detailAddress);
	};

	function washingCompanyListHandler(e, status, result) {
		if (result.status != 200) {
			$('#availableMessage').html('<b>'+result.message+'</b>');
			$('#washDate').addClass('disabled');
			$("#washDate").datepicker("option", "disabled", true);
		} else {
			$('#availableMessage').html(result.message);
			$('#washDate').removeClass('disabled');
			$("#washDate").datepicker("option", "disabled", false);
		}
	};

	function washingTimeHandler(e, status, result) {
		timeArray = result.data.availableDateTime;
	};

	function requestWashingCompany(e) {
		e.preventDefault();
		
		var requestTargetName = $('#name').val();
		var requestTargetContact = $('#phoneNumber').val();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if (serviceAddress == undefined) {
			alert('서비스 지역을 선택해 주세요');
		} else if ($('#timeDrop').val() == '') {
			alert('희망 서비스 시각을 선택해 주세요');
		} else {
			$('#selectMessage').hide();
			$('.washCompany').hide();

			var requestDate = moment($('#moveDate').datepicker('getDate')).format('YYYY-MM-DD');
			var requestTime = $('#timeDrop').val()[0];
			if (timeArray[requestDate][requestTime].washOnYn == 'Y') {
				$('#washCompany_washOn').show();
			}
			if (timeArray[requestDate][requestTime].washSwatYn == 'Y') {
				$('#washCompany_washSwat').show();
			}
			
			//controller.movingCompanyList(moment(, originAddress.regionCode);
		}
	};

	function requestWashingSubmit(e) {
		e.preventDefault();
		var requestTargetName = $('#name').val();
		var requestTargetContact = $('#phoneNumber').val();
		var comment = $('#additionalComments').val();
		/*
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
		}*/
	};

	function requestWashingResultHandler(e, status, result) {
		if (status == 200) {
			alert('신청이 완료 되었습니다. 업체에서 확인 후 빠른 시간 내에 연락 드리겠습니다.');
			location.href = '/homeService/#move';
		} else {
			alert(status+': '+result.message);
		}
	}
};