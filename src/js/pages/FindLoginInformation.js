/* global $ */

module.exports = function() {
	var SuperClass = require('./Page.js');
	var Super = SuperClass();
	
	var controller = require('../controller/LoginController');
	$(controller).on('findIdResult', findIdResultHandler);
	$(controller).on('findPwResult', findPwResultHandler);
	var util = require('../utils/Util.js');
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		$('.tabWrap a').click(initForm);
		$('.btnBackToForm').click(initForm);
		$('#pwAuthPhone').click(initPwAuthPhoneForm);
		$('#pwAuthMail').click(requstPwAuthMail);
		$('#findPwAuthPhoneRequestButton').click(requestPhoneAuthNumber);
		$('#findPwAuthPhoneConfirmButton').click(confirmPhoneAuthNumber);
		$('#findPwAuthPhoneCompleteButton').click(completePhoneAuthNumber);
		$('#findPwAuthMailResendButton').click(requstPwAuthMailResend);
		
		$('#findID').submit(findIdFormSubmitHandler);
		$('#findPW').submit(findPwFormSubmitHandler);
		initForm();
	};
	
	/**
	 * ID/비번찾기 폼 초기화
	 */
	function initForm(e) {
		if (e != undefined) e.preventDefault();
		$('#inputPhone').val('');
		$('#inputName').val('');
		$('#inputId').val('');
	
		$('#findInfoForm').show().siblings('div').hide();
		if (e != undefined) e.stopPropagation();
	}
	
	/**
	 * ID찾기 폼 submit 
	 */
	function findIdFormSubmitHandler(e) {
		e.preventDefault();
			
		var phone = $.trim($('#inputPhone').val());
		var name = $.trim($('#inputName').val());
		var phoneNumberRule = /^[0-9]{10,12}$/i;
		
		if (name == '') {
			alert('이름을 입력해주세요');
		} else if (phone == '' || !phoneNumberRule.test(phone)) {
			alert('휴대폰번호를 입력해주세요');
		} else {
			controller.findId(name, phone);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * ID찾기 결과 handling
	 */
	function findIdResultHandler(e, result, name, phone) {
		switch(result.status) {
			case '200':
			case '500':	// 임시.
				$('#idResultName').text('바야바');
				$('#idResultPhone').text('00000000000');
				$('#idResultId').text('ea********@altavista.co.kr');
				$('#idResultJoinDate').text('1994. 04. 20');
				
				var socialTags = '';
				socialTags += '<div class="accountSummary">';
				socialTags += '<p><b>Kol***@gma***.com</b><br>가입일: 2016. 04. 20</p>';
				socialTags += '<a href="" class="btn loginSns facebook btnSizeM btnShadow" id="socialLogin-facebook">페이스북 로그인</a>';
				// socialTags += '<a href="" class="btn loginSns naver btnSizeM btnShadow" id="socialLogin-naver">네이버 로그인</a>';
				// socialTags += '<a href="" class="btn loginSns kakao btnSizeM btnShadow" id="socialLogin-kakao">카카오 로그인</a>';
				socialTags += '</div>';
				$('#socialAccount').html(socialTags);
				
				$('#findIdResult').show().siblings('div').hide();
				break;
				
			case '500':	// 임시.
				alert(name+" / "+phone+"\n\n일치하는 아이디가 없습니다.\n입력하신 정보를 다시 한 번 확인해주세요.");
				break;
		}
	};
	
	/**
	 * 비번찾기 폼 submit 
	 */
	function findPwFormSubmitHandler(e) {
		e.preventDefault();
			
		var id = $.trim($('#inputId').val());
		
		if (id == '' || !util.checkVaildEmail(id)) {
			alert('아이디(이메일)를 정확하게 입력해주세요');
		} else {
			controller.findPassword(id);
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 비번찾기 결과 handling
	 */
	function findPwResultHandler(e, result, id) {
		switch(result.status) {
			case '200':
				$('#pwResultName').text(result.data.site.memberNumber);
				$('#pwResultMail').text(result.data.site.loginId);
				$('#pwResultPhone').text(result.data.site.cellPhoneNumber);
				
				$('#findPwResult').show().siblings('div').hide();
				break;
				
			case '3001':
				// 아이디 없음
				alert(id+"\n\n등록된 정보가 없습니다. 입력하신 정보를 다시 한 번 확인해주세요.");
				break;
		}
	};
	
	/**
	 * 휴대전화 인증 폼 초기화
	 */
	function initPwAuthPhoneForm(e) {
		e.preventDefault();
		$('#findPwAuthPhoneName').val('');
		$('#findPwAuthPhonePhone').val('');
		$('#findPwAuthPhoneConfirm').val('');
		
		$('#findPwAuthPhone').show().siblings('div').hide();
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증번호 요청
	 */
	function requestPhoneAuthNumber(e) {
		e.preventDefault();
		alert('인증번호가 발송되었습니다.'); 
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증번호 검증
	 */
	function confirmPhoneAuthNumber(e) {
		e.preventDefault();
		//alert('휴대폰 인증에 성공하였습니다.');
		alert('휴대폰 인증에 실패하였습니다. 인증번호를 다시 확인해 주세요.'); 
		e.stopPropagation();
	};
	
	/**
	 * 휴대전화 인증 완료
	 */
	function completePhoneAuthNumber(e) {
		if (true) {
			// link
		} else {
			e.preventDefault();
			alert('휴대폰 인증을 진행해 주세요.');
			e.stopPropagation();
		}
	};
	
	/**
	 * 이메일 인증 요청
	 */
	function requstPwAuthMail(e) {
		e.preventDefault();
		$('#findPwAuthMail').show().siblings('div').hide();
		e.stopPropagation();
	};
	
	/**
	 * 이메일 인증 재요청
	 */
	function requstPwAuthMailResend(e) {
		e.preventDefault();
		alert('인증메일이 재발송 되었습니다');
		e.stopPropagation();
	};
}