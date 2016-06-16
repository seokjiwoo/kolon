/* global $ */

module.exports = function() {
	var SuperClass = require('./Page.js');
	var Super = SuperClass();

	var controller = require('../controller/LoginController');
	$(controller).on('loginResult', loginCompleteHandler);
	$(controller).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	var memberInfoController = require('../controller/MemberInfoController');
	$(memberInfoController).on('termsListResult', termsListHandler);
	$(memberInfoController).on('termsResult', termsContentHandler);
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
		
		controller.getSocialLoginUrl();
		memberInfoController.getMemberTermsList();
		
		$('#popAgree01').click(getTermsContent);
		$('#popAgree02').click(getTermsContent);
		
		$('#loginForm').submit(function(e) {
			e.preventDefault();
			if (util.checkVaildEmail($('#inputName').val()) == false) {
				alert('아이디를 입력하세요');
			} else {
				controller.login($('#inputName').val(), $('#inputPW').val());
			}
			
			e.stopPropagation();
		});
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
		Super.Super.messagePopup(term.termsName, term.termsName, term.termsContents, 540);
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
	 * 로그인 완료 이벤트 핸들링
	 */
	function loginCompleteHandler(e, status) {
		switch(status) {
			case 200:
				//alert('로그인 성공');
				location.href = '/';
				break;
			default:
				alert('로그인 실패, code: '+status);
				break;
		}
	};
}