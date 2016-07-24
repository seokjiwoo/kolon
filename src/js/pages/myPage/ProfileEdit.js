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
	$(controller).on('changeEmailIdResult', changeEmailIdResultHandler);
	$(controller).on('editMemberInfoResult', editInfoResultHandler);
	$(controller).on('refundBankListResult', refundBankListResultHandler);
	$(controller).on('refundDataResult', refundDataResultHandler);
	
	var loginController = require('../../controller/LoginController');
	$(loginController).on('loginResult', socialConnectFailHandler);
	$(loginController).on('socialLoginUrlResult', socialLoginUrlResultHandler);
	$(loginController).on('socialConnectResult', socialConnectResultHandler);
	$(loginController).on('socialDisconnectResult', socialDisconnectResultHandler);
	
	var eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	DROPDOWNSCROLL_EVENT = events.DROPDOWN_SCROLL;

	var myInfoObject;
	var emailDuplicateFlag = false;
	var emailCertCode = null;
	var enteredId;
	var authNumberResendFlag = false;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		if (Cookies.get('profileEditAuth') == 'auth') {
			MyPage.init();

			controller.getMyInfo();
			loginController.getSocialLoginUrl();
			
			var tags = '';
			for (var i = new Date().getFullYear()-14; i > new Date().getFullYear()-99; i--) {
				tags += ('<option value="'+i+'">'+i+'</option>');
			}
			$('#joinBirth01').html(tags);
			$('#joinBirth02').change(updateDateSelect);
			updateDateSelect();

			$(window).on('beforeunload', function(){
				if (confirm("이 페이지를 벗어나면 변경하신 내용이 저장되지 않습니다.\n이전 화면으로 이동하시려면 [확인]을 누르시고, 현재 페이지에 있으시려면 [취소]를 눌러주세요.")) {
					Cookies.set('profileEditAuth', 'auth', { expires: 1/2880 });
				} else {
					return false;
				}
				//return 'bye';
			});
			
			$('#changeEmailIdForm').submit(submitEmailEditForm);
			$('#changeInfoForm').submit(submitInfoEditForm);
			$('.verifyMemberPopup').click(submitMobileEditForm);
		} else {
			alert('잘못된 접근입니다');
			location.href = '/';
		}
	};

	function myInfoHandler(e, infoObject) {
		myInfoObject = infoObject;
		debug.log(infoObject);

		if (Cookies.get('profileEditAuth') == 'auth' || infoObject.joinSectionCode == "BM_JOIN_SECTION_02") {
			if (infoObject.joinSectionCode == "BM_JOIN_SECTION_02") $('#changePwRow').remove();

			$('#profileID').val(infoObject.email || '');
			$('#changeEmailField').hide();
			if (infoObject.email != null) {
				$('#profileID').attr('disabled', 'disabled');
				$('#changeIdButton').text('변경하기');
			} else {
				$('#changeIdButton').text('등록하기');
			}
			$('#editPhoneID').val(infoObject.cellPhoneNumber);
			if (infoObject.cellPhoneNumber == null) {
				$('#changePhoneButton').text('등록하기');
			} else {
				$('#changePhoneButton').text('변경하기');
			}
			$('#profileMobile').text(util.mobileNumberFormat(infoObject.cellPhoneNumber));
			for (var key in infoObject.socials) {
				var eachSocialData = infoObject.socials[key];
				switch(eachSocialData.socialName) {
					case 'facebook':	// facebook
					case 'naver':	// naver
					case 'kakao':	// kakao
						$('#socialRow_'+eachSocialData.socialName).addClass('active');
						$('#socialInfo_'+eachSocialData.socialName).text('연결되었습니다. (이메일 : '+eachSocialData.socialEmail+')');
						$('#socialButton_'+eachSocialData.socialName).text('연결해제');
						break;
				}
			}
			$('#editName').val(infoObject.memberName);		// memberName
			if (infoObject.birthDate != null && infoObject.birthDate.length == 8) {
				$('#joinBirth01').val(infoObject.birthDate.substr(0, 4));
				$('#joinBirth02').val(infoObject.birthDate.substr(4, 2));
				$('#joinBirth03').val(infoObject.birthDate.substr(6, 2));
			}
			$('#profileHomePhone').val(infoObject.generalPhoneNumber);		// generalPhoneNumber
		
			if (infoObject.memberRefundAccount != null) {
				$('#refundBankName').text(infoObject.memberRefundAccount.bankName);  
				$('#refundAccount').html(infoObject.memberRefundAccount.accountNumber+" <button id='changeRefundInfoButton' class='btn btnSizeS btnColor03'>계좌 수정</button>");
				$('#refundName').text(infoObject.memberRefundAccount.depositorName);
			} else {
				$('#refundInfoRow').html('<td colspan="3" style="padding: 25px"><button id="changeRefundInfoButton" class="btn btnSizeM btnColor01">계좌 등록</button></td>')
			}
			$('#changeRefundInfoButton').click(popRefundAccount);

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

			switch(infoObject.memberStateCode) {
				case 'BM_MEM_STATE_01': // 일반 회원
					$('#certficateMessage').text('본인확인을 해주세요! 본인확인을 하지 않으시면 서비스 이용에 제한이 있을 수 있습니다.');
					break;
				case 'BM_MEM_STATE_02': // 본인인증 완료 회원
					$('#certficateMessage').text('본인확인이 완료되었습니다.');
					$('#certficateButton').remove();
					$('#editName').attr('disabled', 'disabled');
					$('#joinBirth01').attr('disabled', 'disabled');
					$('#joinBirth02').attr('disabled', 'disabled');
					$('#joinBirth03').attr('disabled', 'disabled');
					break; 
			}
			
			$('.socialButton').click(socialButtonClickHandler);
		} else {
			alert('잘못된 접근입니다');
			location.href = '/';
		}
	};
	
	/**
	 * 소셜 로그인 URL 목록처리
	 */
	function socialLoginUrlResultHandler(e, status, socialAuthLoginUrl) {
		for (var key in socialAuthLoginUrl) {
			var eachService = socialAuthLoginUrl[key];
			$('#socialButton_'+eachService.socialName).data('href', eachService.authUrl);
		}
	};

	/**
	 * 소셜연결/연결해제 클릭 핸들링 
	 */
	function socialButtonClickHandler(e) {
		var socialName = $(this).attr('id').substr(13);

		if ($('#socialRow_'+socialName).hasClass('active')) {
			if (myInfoObject.joinSectionCode == "BM_JOIN_SECTION_02" && myInfoObject.socials.length < 2) {
				MyPage.Super.Super.alertPopup('', '최소 1개의 로그인 계정을 유지하셔야 합니다.', '확인');
			} else {
				// 소셜해제
				loginController.socialDisconnect(socialName);
			}
		} else {
			// 소셜연결
			window.open($(this).data('href'), 'socialLoginPopup', 'width=600,height=550,menubar=no,status=no,toolbar=no,resizable=yes,fullscreen=no');
		}
	};

	/**
	 * 소셜연결 결과 핸들링 
	 */
	function socialConnectResultHandler(e, status, result, socialName) {
		switch(socialName) {
			case 'facebook':	// facebook
			case 'naver':	// naver
			case 'kakao':	// kakao
				$('#socialRow_'+socialName).addClass('active');
				$('#socialInfo_'+socialName).text('연결되었습니다.');
				$('#socialButton_'+socialName).text('연결해제');
				break;
		}
	};

	/**
	 * 소셜연결 실패 핸들링 
	 */
	function socialConnectFailHandler(e, status, result) {
		if (status == 401) MyPage.Super.Super.alertPopup('', result.message, '확인');
	};

	/**
	 * 소셜 연결해제 결과 핸들링
	 */
	function socialDisconnectResultHandler(e, status, result, socialName) {
		switch(socialName) {
			case 'facebook':	// facebook
			case 'naver':	// naver
			case 'kakao':	// kakao
				$('#socialRow_'+socialName).removeClass('active');
				$('#socialInfo_'+socialName).text('연결된 정보가 없습니다.');
				$('#socialButton_'+socialName).text('계정연결');
				break;
		}
	};
	
	/**
	 * 환불정보 팝업 호출 (1) - 은행 목록 요청
	 */
	function popRefundAccount(e) {
		e.preventDefault();
		controller.refundBankList();
		e.stopPropagation();
	};

	/**
	 * 환불정보 팝업 호출 (2) - 팝업 열기
	 */
	function refundBankListResultHandler(e, status, result) {
		if (status == 200) {
			MyPage.Super.Super.htmlPopup('../../_popup/popRefundAccount.html', 590, 'popEdge', {
				onOpen: function() {
					var tags = '';
					for (var key in result.bankCodes) {
						tags += '<li><a href="#" data-value="'+result.bankCodes[key].code+'">'+result.bankCodes[key].bankName+'</a></li>';
					}
					$('#refundBankDrop').html(tags);
					eventManager.triggerHandler(DROPDOWNSCROLL_EVENT.REFRESH);
					$('#refundAccountForm').submit(submitChangeRefundAccount);
				},
				onSubmit: function() {
					$('#refundAccountForm').submit();
				}
			});
		} else {
			alert(status);
		}
	};
	
	/**
	 * 환불정보 변경요청  
	 */
	function submitChangeRefundAccount(e) {
		e.preventDefault();

		var bankCode = $('#refundBankDrop').closest('.js-drop-scroll').val();
		var accountNumber = $('#accountNumber').val();
		var depositorName = $('#depositorName').val();

		if (bankCode == '') {
			alert('은행을 선택해 주세요');
		} else if (!(/[0-9]+/g).test(accountNumber)) {
			alert('계좌번호는 숫자만 입력해 주세요');
		} else if ($.trim(depositorName) == '') {
			alert('예금주명을 입력해 주세요');
		} else {
			controller.refundData(String(bankCode), String(accountNumber), String(depositorName));
		} 
		
		e.stopPropagation();
	};
	
	/**
	 * 환불정보 변경요청 결과 핸들링
	 */
	function refundDataResultHandler(e, status, result) {
		e.preventDefault();
		if (status == 200) {
			alert('등록이 완료되었습니다');
			$.colorbox.close();
			$(window).off('beforeunload');
			Cookies.set('profileEditAuth', 'auth', { expires: 1/2880 });
			location.reload(true);
		} else {
			alert(result.message);
		}
		e.stopPropagation();
	};

	

	/**
	 * 이메일 아이디 변경요청
	 */
	function submitEmailEditForm(e) {
		e.preventDefault();

		var emailId = '';
		if ($('#profileID').attr('disabled') == 'disabled') {
			if ($('#changeEmailField').is(':visible')) emailId = $('#profileNewID').val();
		} else {
			emailId = $('#profileID').val();
		}

		if (emailId == '') {
			$('#changeEmailField').show();
		} else {
			if (util.checkVaildEmail(emailId) == false) {
				alert('이메일 주소를 정확하게 입력해주세요.');
			} else {
				enteredId = emailId;
				emailCertCode = null;
				controller.changeEmailId(enteredId);
			}
		}
		e.stopPropagation();
	};
	
	/**
	 * 이메일 아이디 변경 결과 핸들링
	 */
	function changeEmailIdResultHandler(e, status, response) {
		switch(status) {
			case 200:	// 인증메일 발송 완료
				MyPage.Super.Super.htmlPopup('../../_popup/popAuthorizeEmail.html', 590, 'popEdge', {
					onOpen: function() {
						$('#emailAuthNumber').val('');
						$('#sendedAddress').text(enteredId);
						$('#resendButton').click(function(e) {
							authNumberResendFlag = true;
							controller.changeEmailId(enteredId);
						});
						authNumberResendFlag = false;
					},
					onSubmit: function() {
						controller.changeEmailId(enteredId, $('#emailAuthNumber').val());
					}
				});
				break;
			case 201:	// 인증성공
				$.colorbox.close();
				alert(response.message);
				$('#myPageHeaderId').text(enteredId);
				$('#profileID').val(enteredId).attr('disabled', 'disabled');
				$('#changeEmailField').hide();
				
				$(window).off('beforeunload');
				Cookies.set('profileEditAuth', 'auth', { expires: 1/2880 });
				location.reload(true);
				break;
			case 400:	// 인증실패
			default:
				debug.log(response);
				alert(response.message);
				break;
		}
	};
	
	/**
	 * 휴대폰 수정(=실명인증) 진행
	 */
	function submitMobileEditForm(e) {
		e.preventDefault();
		$(document).trigger('verifyMember', ['IDENTITY']);
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
					MyPage.Super.Super.alertPopup('회원정보수정이 완료되었습니다.', response.message, '확인', function() {
						$(window).off('beforeunload');
						Cookies.set('profileEditAuth', 'auth', { expires: 1/2880 });
						location.reload(true);
					});
					break;
				default:
					MyPage.Super.Super.alertPopup('회원정보수정에 실패하였습니다.', response.message, '확인');
					break;
			}
		} else {
			MyPage.Super.Super.alertPopup('회원정보수정에 실패하였습니다.', response.message, '확인');
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