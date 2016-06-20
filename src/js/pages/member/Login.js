/* global $ */

module.exports = function() {
	var SuperClass = require('../Page.js');
	var Super = SuperClass();

	var controller = require('../../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	$(controller).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	var memberInfoController = require('../../controller/MemberInfoController');
	$(memberInfoController).on('termsListResult', termsListHandler);
	$(memberInfoController).on('termsResult', termsContentHandler);
	var util = require('../../utils/Util.js');

	var enteredEmailAdress;
	var forceLoginFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		controller.getSocialLoginUrl();
		memberInfoController.getMemberTermsList();
		
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		$('#loginForm').submit(loginHandler);
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
		memberInfoController.getMemberTermsContent($(this).data('termsNumber'));
	};
	
	/**
	 * 회원 이용약관 본문 핸들링
	 */
	function termsContentHandler(e, term) {
		Super.Super.messagePopup(term.termsName, term.termsName, term.termsContents, 590, 'popEdge');
	};
	
	/**
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialLogin-'+eachService.socialName).attr('href', eachService.authUrl);
		}
	};

	/**
	 * 로그인 or 회원가입 요청
	 */
	function loginHandler(e) {
		e.preventDefault();

		if (util.checkVaildEmail($('#inputName').val()) == false || $.trim($('#inputPW').val()) == '') {
			Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', '올바른 아이디와 비밀번호를 입력해주세요.', '확인');
		} else {
			if (enteredEmailAdress != $('#inputName').val()) forceLoginFlag = false;
			enteredEmailAdress = $('#inputName').val();
			Mailcheck.run({
				email: enteredEmailAdress,
				suggested: function(suggestion) {
					if (!forceLoginFlag) {
						forceLoginFlag = true;
						var enteredMail = enteredEmailAdress.split('@');
						Super.Super.alertPopup('메일 주소를 다시 확인해 주세요.', '입력하신 메일 주소가 혹시 '+enteredMail[0]+'@<strong>'+suggestion.domain+'</strong> 아닌가요?', '확인');
					} else {
						controller.login(enteredEmailAdress, $('#inputPW').val());
					}
				},
				empty: function() {
					controller.login(enteredEmailAdress, $('#inputPW').val());
				}
			});
		}
		
		e.stopPropagation();
	};
	
	/**
	 * 로그인 or 회원가입 완료 이벤트 핸들링
	 */
	function loginCompleteHandler(e, status, response) {
		console.log(response);
		switch(status) {
			case 200:
				//alert('로그인 성공');
				location.href = '/';
				break;
			default:
				Super.Super.alertPopup('로그인/회원가입에 실패하였습니다.', response.message, '확인');
				break;
		}
	};
}