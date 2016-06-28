/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/ProfileEdit.js';

	var MyPageClass = require('./Index.js'),
	MyPage = MyPageClass();

	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var controller = require('../../controller/MemberInfoController');
	$(controller).on('checkEmailResult', checkEmailResultHandler);
	$(controller).on('myInfoResult', myInfoHandler);
	
	var emailDuplicateFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		// Super.init();
		MyPage.init();

		debug.log(fileName, $, util);
		
		var tags = '';
		for (var i = new Date().getFullYear()-14; i > new Date().getFullYear()-99; i--) {
			tags += ('<option value="'+i+'">'+i+'</option>');
		}
		$('#joinBirth01').html(tags);
		$('#joinBirth02').change(updateDateSelect);
		updateDateSelect();
		
		$('#profileEditApplyButton').click(submitEditForm);
		/*
		$('#joinId').change(checkEmailField);
		$('#joinPW').change(checkPasswordField);
		$('#joinPW02').change(checkPasswordField);
		$('#joinPhone').change(checkPhoneField);
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		$('#joinForm').submit(submitJoinForm);
		
		controller.getMemberTermsList();
		*/
		controller.getMyInfo();
	}

	function myInfoHandler(e, infoObject) {
		console.log(infoObject);

		$('#profileID').val(infoObject.email);		// email / loginId
		$('#editPhoneID').val(infoObject.cellPhoneNumber);		// cellPhoneNumber
		// ( 소셜인증 )
		$('#editName').val(infoObject.memberName);		// memberName
		if (infoObject.birthDate.length == 8) {
			$('#joinBirth01').val(infoObject.birthDate.substr(0, 4));
			$('#joinBirth02').val(infoObject.birthDate.substr(4, 2));
			$('#joinBirth03').val(infoObject.birthDate.substr(6, 2));
		}
		$('#profileMobile').val(infoObject.cellPhoneNumber);	// cellPhoneNumber
		$('#profileHomePhone').val(infoObject.generalPhoneNumber);		// generalPhoneNumber
		
		switch(infoObject.emailReceiveYn) {
			case 'Y': 
				$('#agreeReceive01')[0].checked = true;
				$('label[for="agreeReceive01"]').addClass('on');
				break;
			case 'N': 
				$('#disagreeReceive01')[0].checked = true;
				$('label[for="disagreeReceive01"]').addClass('on');
				break;
		}
		switch(infoObject.smsReceiveYn) {
			case 'Y':
				$('#agreeReceive02')[0].checked = true;
				$('label[for="agreeReceive02"]').addClass('on');
				break;
			case 'N':
				$('#disagreeReceive02')[0].checked = true;
				$('label[for="disgreeReceive02"]').addClass('on');
				break;
		}
	}
	
	/**
	 * 정보수정 진행
	 */
	function submitEditForm(e) {
		e.preventDefault();

		var emailId = $('#profileID').val();
		var phoneId = $('#editPhoneID').val();

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
		} else if (util.checkVaildEmail(emailId) == false) {
			alert('이메일 주소를 정확하게 입력해주세요.');
		} else if ($.trim(name) == '') {
			alert('이름을 입력해 주세요.');
		} else {
			//controller.joinMember(id, pw1, joinName, phone, birthDate);
			/*
			{
			"birthDate": "19881122",
			"cellPhoneNumber": "01012123434",
			"generalPhoneNumber": "01012123434",
			"memberName": "홍길동"
			}
			*/
			//console.log(emailId, phoneId, name, birthDate, mobile, phone, agreeMail, agreeSms);
		}
		
		e.stopPropagation();
	}
	
	/**
	 * 이메일 필드 검사
	 */
	function checkEmailField(e) {
		var inputValue = $('#joinId').val();
		if (util.checkVaildEmail(inputValue) == false) {
			$('#joinIdAlert').text('이메일 주소를 정확하게 입력해주세요.');
		} else {
			$('#joinIdAlert').text('');
			controller.checkEmail(inputValue);
		}
	}
	
	/**
	 * 이메일 중복 체크 결과 핸들링 
	 */
	function checkEmailResultHandler(e, status, message) {
		switch(status) {
			case '200':
				$('#joinIdAlert').text('');
				emailDuplicateFlag = false;
				break;
			case '409':
				$('#joinIdAlert').text('해당 커먼 계정이 이미 존재합니다.');
				emailDuplicateFlag = true;
				break;
			default:
				$('#joinIdAlert').text(message);
				emailDuplicateFlag = true;
				break;
		}
	}
	
	/**
	 * 회원가입 결과 핸들링
	 */
	function joinResultHandler(e, status) {
		switch(status) {
			case '200':
				location.href = 'joinComplete.html';
				break;
			case '409':
				alert('해당 커먼 계정이 이미 존재합니다.');
				$('#joinIdAlert').text('해당 커먼 계정이 이미 존재합니다.');
				emailDuplicateFlag = true;
				break;
		}
	}
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#joinPW').val();
		var inputValue2 = $('#joinPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#joinPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!util.checkValidPassword(inputValue1)) {
			$('#joinPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#joinPWAlert').text('');
		}
	}
	
	/**
	 * 전화번호 필드 검사 
	 */
	function checkPhoneField(e) {
		var inputValue = $('#joinPhone').val();
		if (!util.checkValidMobileNumber(inputValue)) {
			$('#joinPhoneAlert').text('10-12자리의 숫자만 입력해 주세요.');
		} else {
			$('#joinPhoneAlert').text('');
		}
	}
	
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
	}

};