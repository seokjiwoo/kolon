/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();
	
	var controller = require('../../controller/MemberInfoController');
	$(controller).on('termsListResult', termsListHandler);
	$(controller).on('termsResult', termsContentHandler);
	$(controller).on('checkEmailResult', checkEmailResultHandler);
	$(controller).on('joinResult', joinResultHandler);
	var util = require('../../utils/Util.js');
	
	var passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]).{9,16}$/i;
	var phoneNumberRule = /^[0-9]{10,12}$/i;
	
	var emailDuplicateFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		var tags = '';
		for (var i = new Date().getFullYear()-14; i > new Date().getFullYear()-99; i--) {
			tags += ('<option value="'+i+'">'+i+'</option>');
		}
		$('#joinBirth01').html(tags);
		$('#joinBirth02').change(updateDateSelect);
		updateDateSelect();
		
		$('#joinId').change(checkEmailField);
		$('#joinPW').change(checkPasswordField);
		$('#joinPW02').change(checkPasswordField);
		$('#joinPhone').change(checkPhoneField);
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		$('#joinForm').submit(submitJoinForm);
		
		controller.getMemberTermsList();
	};
	
	/**
	 * 회원 이용약관 목록 핸들링
	 */
	function termsListHandler(e, termsList) {
		for (var key in termsList) {
			var eachTerms = termsList[key];
			switch(eachTerms.termsName) {
				case '플랫폼이용약관':
					$('#popAgree01').data('termsNumber', eachTerms.termsNumber);
					break;
				case '개인정보 취급방침':
					$('#popAgree02').data('termsNumber', eachTerms.termsNumber);
					break;
			}
		}
	};
	
	/**
	 * 회원 이용약관 본문 요청
	 */
	function getTermsContent(e) {
		controller.getMemberTermsContent($(this).data('termsNumber'));
	};
	
	/**
	 * 회원 이용약관 본문 핸들링
	 */
	function termsContentHandler(e, term) {
		Super.Super.messagePopup(term.termsName, term.termsName, term.termsContents, 540);
	};
	
	/**
	 * 회원가입 절차 진행
	 */
	function submitJoinForm(e) {
		e.preventDefault();
		
		var id = $('#joinId').val();
		var pw1 = $('#joinPW').val();
		var pw2 = $('#joinPW02').val();
		var joinName = $('#joinName').val();
		var phone = $('#joinPhone').val();
		var birthDate = $('#joinBirth01').val()+$('#joinBirth02').val()+$('#joinBirth03').val();
		var age = util.calculateAge(new Date($('#joinBirth01').val(), $('#joinBirth02').val(), $('#joinBirth03').val()));
		
		$('#joinNameAlert').text('');
		
		if (age < 14) {
			alert('만 14세 미만은 가입하실 수 없습니다.');
			$('.birth').find('span.note').addClass('alert');
		} else if (util.checkVaildEmail(id) == false) {
			alert('이메일 주소를 정확하게 입력해주세요.');
			$('#joinIdAlert').text('이메일 주소를 정확하게 입력해주세요.');
		} else if (pw1 == '' || pw2 == '') {
			alert('비밀번호를 입력해 주세요.');
			$('#joinPWAlert').text('비밀번호를 입력해 주세요.');
		} else if (pw1 != pw2) {
			alert('비밀번호가 일치하지 않습니다.');
			$('#joinPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!passwordRule.test(pw1)) {
			alert('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
			$('#joinPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else if ($.trim(joinName) == '') {
			alert('이름을 입력해 주세요.');
			$('#joinNameAlert').text('이름을 입력해 주세요.');
		} else if (!passwordRule.test(phone)) {
			alert('휴대폰번호는 10-12자리의 숫자만 입력해 주세요.');
			$('#joinPhoneAlert').text('10-12자리의 숫자만 입력해 주세요.');
		} else {
			controller.joinMember(id, pw1, joinName, phone, birthDate);
		}
		
		e.stopPropagation();
	};
	
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
	};
	
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
	};
	
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
	};
	
	/**
	 * 패스워드 필드 검사 
	 */
	function checkPasswordField(e) {
		var inputValue1 = $('#joinPW').val();
		var inputValue2 = $('#joinPW02').val();
		
		if (inputValue2 != '' && inputValue1 != inputValue2) {
			$('#joinPWAlert').text('비밀번호가 일치하지 않습니다.');
		} else if (!passwordRule.test(inputValue1)) {
			$('#joinPWAlert').text('비밀번호는 영문, 숫자, 특수문자 조합한 9~16자리입니다.');
		} else {
			$('#joinPWAlert').text('');
		}
	};
	
	/**
	 * 전화번호 필드 검사 
	 */
	function checkPhoneField(e) {
		var inputValue = $('#joinPhone').val();
		if (!phoneNumberRule.test(inputValue)) {
			$('#joinPhoneAlert').text('10-12자리의 숫자만 입력해 주세요.');
		} else {
			$('#joinPhoneAlert').text('');
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
}