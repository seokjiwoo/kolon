/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/ProfilePreview.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	memberInfoController = require('../../controller/MemberInfoController'),
	loginController = require('../../controller/LoginController'),
	loginDataModel = require('../../model/LoginModel'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	MEMBERINFO_EVENT = events.MEMBER_INFO,
	LOGIN_EVENT = events.LOGIN,
	HTMLPOPUP_EVENT = events.HTML_POPUP,
	COLORBOX_EVENT = events.COLOR_BOX,
	WINDOWOPENER_EVENT = events.WINDOW_OPENER;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.js-profile-preview-wrap',
			template : '#profile-preview-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		if (Cookies.get('profileEditAuth') !== 'auth') {
			win.alert('잘못된 접근입니다');
			location.href = '/';
			return;
		}

		debug.log(fileName, 'init');

		MyPage.init();

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();

		memberInfoController.getMyInfo();
		// loginController.getSocialLoginUrl();
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(memberInfoController).on(MEMBERINFO_EVENT.WILD_CARD, onControllerListener);
		// $(loginController).on(MEMBERINFO_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	/**
	 * 환불정보 팝업 호출 (1) - 은행 목록 요청
	 */
	function popRefundAccount(e) {
		e.preventDefault();
		memberInfoController.refundBankList();
		e.stopPropagation();
	};

	/**
	 * 환불정보 팝업 호출 (2) - 팝업 열기
	 */
	function refundBankListResultHandler(e, status, result) {
		if (status == 200) {
			eventManager.trigger(HTMLPOPUP_EVENT.OPEN, [
				'../../_popup/popRefundAccount.html',
				'100%',
				'popEdge',
				{
					onOpen: function() {
						var tags = '<option value="">선택하세요</option>';
						for (var key in result.bankCodes) {
							tags += '<option value="'+result.bankCodes[key].code+'">'+result.bankCodes[key].bankName+'</option>';
						}
						$('#refundBankDrop').html(tags);
						$('#refundAccountForm').submit(submitChangeRefundAccount);
					},
					onSubmit: function() {
						$('#refundAccountForm').submit();
					}
				}
			]);
		} else {
			win.alert(status);
		}
	};

	/**
	 * 환불정보 변경요청 결과 핸들링
	 */
	function refundDataResultHandler(e, status, result) {
		var loginData = loginDataModel.loginData();

		e.preventDefault();
		if (status == 200) {
			win.alert('등록이 완료되었습니다');
			eventManager.triggerHandler(COLORBOX_EVENT.CLOSE);
			win.location.reload();
		} else {
			win.alert(result.message);
			
			// 인증처리 단계
			// if (status === 401 && result.errorCode === '1609' && loginData.stateCode === 'BM_MEM_STATE_01') {
			// 	$(document).trigger('verifyMember', ['LIVING']);
			// 	return;
			// }
		}
		e.stopPropagation();
	};

	/**
	 * 환불정보 변경요청  
	 */
	function submitChangeRefundAccount(e) {
		e.preventDefault();

		var bankCode = $('#refundBankDrop').val();
		var accountNumber = $('#accountNumber').val();
		var depositorName = $('#depositorName').val();

		if (bankCode == '') {
			win.alert('은행을 선택해 주세요');
		} else if (!(/[0-9]+/g).test(accountNumber)) {
			win.alert('계좌번호는 숫자만 입력해 주세요');
		} else if ($.trim(depositorName) == '') {
			win.alert('예금주명을 입력해 주세요');
		} else {
			memberInfoController.refundData(bankCode[0], accountNumber, depositorName);
		} 
		
		e.stopPropagation();
	};

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
								eventManager.triggerHandler(WINDOWOPENER_EVENT.REFRESH);

								$('#changeRefundInfoButton').off('click', popRefundAccount)
															.on('click', popRefundAccount);
							});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case MEMBERINFO_EVENT.INFO:
				result = status;
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				break;
			case MEMBERINFO_EVENT.REFUND_BANK_LIST:
				refundBankListResultHandler(e, status, result);
				break;
			case MEMBERINFO_EVENT.REFUND_DATA:
				refundDataResultHandler(e, status, result);
				break;
			default:
				debug.log(fileName, 'onControllerListener', eventType, status, response);
				break;
			case 999:
				dummyData = [];

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					case 200:
						break;
					default:
						win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
						result = dummyData;
						break;
				}

				debug.log(fileName, 'onControllerListener', eventType, status, response);
				displayData(result);
				break;
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}
};