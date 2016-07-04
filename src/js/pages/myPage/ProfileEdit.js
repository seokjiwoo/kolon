/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/ProfileEdit.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/MemberInfoController');
	$(controller).on('myInfoResult', myInfoHandler);
	$(controller).on('checkEmailResult', checkEmailResultHandler);
	$(controller).on('editMemberInfoResult', editInfoResultHandler);
	
	var emailDuplicateFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();

		debug.log(fileName, $, util);
		
		var tags = '';
		for (var i = new Date().getFullYear()-14; i > new Date().getFullYear()-99; i--) {
			tags += ('<option value="'+i+'">'+i+'</option>');
		}
		$('#joinBirth01').html(tags);
		$('#joinBirth02').change(updateDateSelect);
		updateDateSelect();
		
		$('#changeEmailIdForm').submit(submitEmailEditForm);
		$('#changePhoneIdForm').submit(submitMobileEditForm);
		$('#changeInfoForm').submit(submitInfoEditForm);
		/*
		$('#joinId').change(checkEmailField);
		$('#joinPW').change(checkPasswordField);
		$('#joinPW02').change(checkPasswordField);
		$('#joinPhone').change(checkPhoneField);
		*/
		controller.getMyInfo();
	};

	function myInfoHandler(e, infoObject) {
		console.log(infoObject);

		$('#profileID').val(infoObject.email);
		$('#editPhoneID').val(infoObject.cellPhoneNumber);
		$('#profileMobile').text(util.mobileNumberFormat(infoObject.cellPhoneNumber));
		// ( 소셜인증 )
		$('#editName').val(infoObject.memberName);		// memberName
		if (infoObject.birthDate != null && infoObject.birthDate.length == 8) {
			$('#joinBirth01').val(infoObject.birthDate.substr(0, 4));
			$('#joinBirth02').val(infoObject.birthDate.substr(4, 2));
			$('#joinBirth03').val(infoObject.birthDate.substr(6, 2));
		}
		$('#profileHomePhone').val(infoObject.generalPhoneNumber);		// generalPhoneNumber
		
		switch(infoObject.emailReceiveYn) {
			default: 
				$('#agreeReceive01')[0].checked = true;
				$('label[for="agreeReceive01"]').addClass('on');
				break;
			case 'N': 
				$('#disagreeReceive01')[0].checked = true;
				$('label[for="disagreeReceive01"]').addClass('on');
				break;
		}
		switch(infoObject.smsReceiveYn) {
			default: 
				$('#agreeReceive02')[0].checked = true;
				$('label[for="agreeReceive02"]').addClass('on');
				break;
			case 'N':
				$('#disagreeReceive02')[0].checked = true;
				$('label[for="disagreeReceive02"]').addClass('on');
				break;
		}
	};
	
	/**
	 * 이메일 수정 진행 전에 중복검사 요청
	 */
	function submitEmailEditForm(e) {
		e.preventDefault();

		var emailId = $('#profileID').val();

		if (util.checkVaildEmail(emailId) == false) {
			alert('이메일 주소를 정확하게 입력해주세요.');
		} else {
			controller.checkEmail(emailId);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 이메일 중복 체크 결과 핸들링 
	 */
	function checkEmailResultHandler(e, status, response) {
		switch(status) {
			case 200:
				alert('이메일 인증 진행 (예정)');
				break;
			case 409:
			default:
				alert(response.message);
				break;
		}
	};
	
	/**
	 * 전화번호 수정 진행
	 */
	function submitMobileEditForm(e) {
		e.preventDefault();

		var phoneId = $('#editPhoneID').val();

		if (util.checkValidMobileNumber(phoneId) == false) {
			alert('10-12자리의 숫자만 입력해 주세요.');
		} else {
			alert('휴대폰 실명확인 진행 (예정)');
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 정보수정 진행
	 */
	function submitInfoEditForm(e) {
		e.preventDefault();

		var generalPhoneNumberRule = /^[0-9]{8,12}$/i;

		var name = $('#editName').val();
		var birthDate = $('#joinBirth01').val()+$('#joinBirth02').val()+$('#joinBirth03').val();
		var age = util.calculateAge(new Date($('#joinBirth01').val(), $('#joinBirth02').val(), $('#joinBirth03').val()));
		var phone = $('#profileHomePhone').val();
		var agreeMail = $('#agreeReceive01')[0].checked ? 'Y' : 'N';
		var agreeSms = $('#agreeReceive02')[0].checked ? 'Y' : 'N';
		
		$('#joinNameAlert').text('');
		if (age < 14) {
			alert('만 14세 미만은 가입하실 수 없습니다.');
			$('.birth').find('span.note').addClass('alert');
		} else if ($.trim(name) == '') {
			alert('이름을 입력해 주세요.');
			$('#editName').focus();
		} else if ( !generalPhoneNumberRule.test($('#profileHomePhone').val()) ) {
			alert('전화번호를 입력해 주세요.');
			$('#profileHomePhone').focus();
		} else {
			controller.editMemberInfo(name, birthDate, phone, agreeMail, agreeSms);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 정보수정 결과 핸들링
	 */
	function editInfoResultHandler(e, status, response) {
		if (status == 200) {
			switch(response.status) {
				case '201':
					Super.Super.alertPopup('회원정보수정이 완료되었습니다.', response.message, '확인', function() {
						location.reload(true);
					});
					break;
				default:
					Super.Super.alertPopup('회원정보수정에 실패하였습니다.', response.message, '확인');
					break;
			}
		} else {
			Super.Super.alertPopup('회원정보수정에 실패하였습니다.', response.message, '확인');
		}
	};
	
	/**
	 * 한 달의 날짜 수 업데이트
	 */
	function updateDateSelect() {
		var selectedYear = parseInt($('#joinBirth01').val());
		var selectedMonth = parseInt($('#joinBirth02').val());
		var lastDate = new Date(selectedYear, selectedMonth, 0).getDate();
		var tags = '';
		for (var i = 1; i <= lastDate; i++) {
			tags += ('<option value="'+(i<10 ? '0'+i : i)+'">'+i+'</option>');
		}
		$('#joinBirth03').html(tags);
	};
};