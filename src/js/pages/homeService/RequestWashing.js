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
	$(controller).on('requestWashingResult', requestWashingResultHandler);

	var addressController = require('../../controller/AddressController.js');
	$(addressController).on('addressListResult', addressListHandler);
	var addressArray;
	var timeArray;
	var serviceAddress;
	var selectedTimeObject;

	var companyNumberObject;

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

		companyNumberObject = {};
		
		$('.washCompany').hide();

		$('#getCompanyListButton').click(requestWashingCompany);
		$('#requestWashingForm').submit(requestWashingSubmit);
		$('#addressDrop').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			setAddress(data.values[0]);
		});

		$('.priceChart').on('click', function(e) {
			e.preventDefault();
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
		var datePicker = $('.calendar.js-picker');
		
		DatePicker.init({default:{
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
			dateFormat : 'yy.mm.dd',
			minDate: 0,
			onSelect : $.noop,
			changeYear: true,
			changeMonth: true,
			disabled: true,
			showOn: "off"
		}});
		$('#washDate').on('onSelect', function(){
			refreshTimeDropStatus();
		});
		$('#washDate').addClass('disabled');

		datePicker.find('.js-alt,.js-btn').click(function(e) {
			if ($('#washDate').hasClass('disabled')) {
				e.stopImmediatePropagation();
				alert("서비스 주소를 확인해주세요");
				$('#washDate').datepicker("hide");
			} else if ($('#washDate').hasClass('cal-show')) {
				//
			}
		});
	};

	function refreshAddressDataHandler(e) {
		addressController.addressList();
	};

	function selectAddressDataHandler(e, seq) {
		$('#addressLabel').text(addressArray[seq].addressManagementName);
		setAddress(seq);
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

		controller.washingCompanyList(serviceAddress.roadBaseAddress);
	};

	function washingCompanyListHandler(e, status, result) {
		if (result.status != 200) {
			$('#availableMessage').html('<b>'+result.message+'</b>');
			$('#washDate').addClass('disabled');
			$("#washDate").datepicker("option", "disabled");
		} else {
			$('#availableMessage').html(result.message);
			companyNumberObject = {
				"washOn": result.data.washOn.companyNumber,
				"washSwat": result.data.washSwat.companyNumber
			}
			$('#washDate').removeClass('disabled');
			$("#washDate").datepicker("option", "disabled", false);
			$('#washDate').datepicker("option", "maxDate", new Date(moment().add(7, 'day')));
		}
		controller.washingTimeList(serviceAddress.roadBaseAddress);
	};

	function washingTimeHandler(e, status, result) {
		timeArray = result.data.availableDateTime;
		refreshTimeDropStatus();
	};

	function refreshTimeDropStatus() {
		var requestDate = moment($('#washDate').datepicker('getDate')).format('YYYY-MM-DD');
		if (timeArray[requestDate] == undefined) {
			//
		} else {
			$.each(timeArray[requestDate], function(key, each){
				$('#availableLabel'+key.substr(0, 2)).text(each.washOnYn == 'N' && each.washSwatYn == 'N' ? '(신청불가)' : '');
			})
		}
	};

	function requestWashingCompany(e) {
		e.preventDefault();
	
		$('.washCompany').hide();
		$('.washCompany').removeClass('on');
		
		var requestTargetName = $('#name').pVal();
		var requestTargetContact = $('#phoneNumber').pVal();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if (serviceAddress == undefined) {
			alert('서비스 지역을 선택해 주세요');
		} else if ($('#timeDrop').pVal() == '') {
			alert('희망 서비스 시각을 선택해 주세요');
		} else {
			var requestDate = moment($('#washDate').datepicker('getDate')).format('YYYY-MM-DD');
			var requestTime = $('#timeDrop').pVal()[0];
			
			if (timeArray[requestDate] == undefined) {
				alert('서비스 불가능 지역입니다');
				$('#selectMessage').text('서비스 불가능 지역입니다.').show();
			} else {
				selectedTimeObject = timeArray[requestDate][requestTime];

				if (selectedTimeObject.washOnYn != 'Y' && selectedTimeObject.washSwatYn != 'Y') {
					alert('해당 일시에 서비스 가능한 세탁업체가 없습니다.\n일시를 변경 후 다시 시도해 주세요.')
					$('#selectMessage').html('해당 일시에 서비스 가능한 세탁업체가 없습니다.<br>일시를 변경 후 다시 시도해 주세요.').show();
				} else {
					$('#selectMessage').hide();

					if (selectedTimeObject.washOnYn == 'Y') {
						$('#washCompany_washOn').show();
					}
					if (selectedTimeObject.washSwatYn == 'Y') {
						$('#washCompany_washSwat').show();
					}
				}
			}
		}
	};

	function requestWashingSubmit(e) {
		e.preventDefault();
		var requestTargetName = $('#name').pVal();
		var requestTargetContact = $('#phoneNumber').pVal();
		var comment = $('#additionalComments').pVal();
		
		if (requestTargetName == '') {
			alert('이름을 입력해 주세요');
		} else if (requestTargetContact == '') {
			alert('연락처를 입력해 주세요');
		} else if ($('#companyListWrap').find('.on').data() == undefined ) {
			alert('서비스 업체를 선택해 주세요');
		} else if (!$('#agree01lb').hasClass('on')) {
			alert('개인정보 제 3자 제공에 동의해 주세요');
		} else {
			var companyCode = $('#companyListWrap').find('.on').data().companyCode;
			var requestDate = moment($('#washDate').datepicker('getDate')).format('YYYY-MM-DD');
			var requestTime = $('#timeDrop').pVal()[0];

			switch(companyCode) {
				case 'LS_COMPANY_SECTION_01':
					var companyNumber = companyNumberObject.washOn;
					var serviceDateTimeRequest = timeArray[requestDate][requestTime].washOnDateTime;
					break;
				case 'LS_COMPANY_SECTION_02':
					var companyNumber = companyNumberObject.washSwat;
					var serviceDateTimeRequest = timeArray[requestDate][requestTime].washSwatDateTime;
					break;
			}

			serviceAddress.addressSectionCode = 'LS_ADDR_SECTION_01';
			var livingService = {
				"addRequestContents": comment,
				"companyNumber": companyNumber,
				"requestTargetContact": requestTargetContact,
				"requestTargetName": requestTargetName,
				"serviceSectionCode": "LS_SERVICE_TYPE_02",
				"termsNumber": 0
			};
			var washServiceRequest = {
				"dateTime": timeArray[requestDate][requestTime].dateTime,
				"serviceDateTimeRequest": serviceDateTimeRequest
			};
			
			controller.requestWashing(companyCode, serviceAddress, livingService, washServiceRequest);
		}
	};

	function requestWashingResultHandler(e, status, result) {
		if (status == 200) {
			alert('신청이 완료 되었습니다. 업체에서 확인 후 빠른 시간 내에 연락 드리겠습니다.');
			location.href = '/homeService/#washing';
		} else {
			alert(status+': '+result.message);
		}
	}
};