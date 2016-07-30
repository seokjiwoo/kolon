/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MyQnA.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/OpinionsController.js');
	$(controller).on('opinionsClassResult', opinionsClassHandler);
	$(controller).on('postAnswerResult', postAnswerResultHandler);
	$(controller).on('pollAnswerResult', pollAnswerResultHandler);

	var myPageController = require('../../controller/MyPageController.js');
	$(myPageController).on('myOpinionsResult', myOpinionsHandler);

	var loginController = require('../../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../../model/LoginModel');
	var loginData;

	var opinionsClassArray;
	var pollAnswerId;

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
		
		controller.opinionsClass();
	}

	/**
	 * 의견 주제 목록 핸들링. 이거 받아온 뒤에 의견 리스트 호출해야 함.
	 */
	function opinionsClassHandler(e, status, result) {
		if (status == 200) {
			var tags = '';
			opinionsClassArray = new Array();
			for (var key in result) {
				var eachTheme = result[key];
				tags += '<option value="'+eachTheme.opinionClassNumber+'">'+eachTheme.className+'</option>';
				opinionsClassArray[eachTheme.opinionClassNumber] = eachTheme.className;
			}
			$('#opinionThemes').append(tags);
		}
		
		myPageController.myOpinions();
	}

	function myInfoResultHandler() {
		loginData = loginDataModel.loginData();
		$('.myProfileImage').attr('src', loginData.imageUrl);
	}

	/**
	 * 내 의견묻기 목록 핸들링
	 */
	function myOpinionsHandler(e, status, result) {
		if (status == 200) {
			if (result.length > 0) {
				$.map(result, function(each) {
					each.opinionClass = opinionsClassArray[each.opinionClassNumber];
					each.content = each.content.replace(/\n/, '<br />');
					if (each.answers.length == 0) {
						each.answerCount = '<p>미답변</p>';
					} else {
						each.answerCount = '<p><span class="pointRed">'+each.answers.length+'개</span> 의견</p>';
					}
					$.map(each.answers, function(eachAnswers) {
						eachAnswers.content = eachAnswers.content.replace(/\n/, '<br />');
						if (eachAnswers.expertName == undefined) eachAnswers.expertName = eachAnswers.answererName;
						if (eachAnswers.registeredHelpYn == 'Y') eachAnswers.answerCountClass='on';
					});
					//debug.log(each);
				});
			}

			var template = window.Handlebars.compile($('#opinion-template').html());
			var elements = $(template(result));
			$('#opinionList').empty().append(elements);

			$('.writeCommentButton').click(showCommentForm);
			$('.answerCount').click(pollAnswer);
			$('.answerForm').submit(answerFormSubmitHandler);
			
			$('.except').dotdotdot({
				after: 'a.more',
				watch: 'window',
				callback:function(){
					$('.more').on('click', function(e) { // more slideDown
						e.preventDefault();
						$(this).parent('p').siblings('.slideCon').slideDown();
						$(this).parent('.except').trigger('destroy').css('height','auto').find('a').remove();
					});					
					if (!$('.except').hasClass('is-truncated')) {
						$(this).find('.more').remove();
					}
				}
			});
		}
	};

	function showCommentForm(e) {
		e.preventDefault();
		if (loginData != null) {
			var pId = $(this).attr('id').substr(18);
			$('#commentArea'+pId).addClass('showCommentInput');
		} else {
			if (confirm('로그인이 필요한 페이지입니다. 로그인하시겠습니까?')) location.href='/member/login.html';
		}
	};

	function answerFormSubmitHandler(e) {
		e.preventDefault();
		var opinionNumber = $(this).attr('id').substr(10);

		if ($.trim($('#answerBox'+opinionNumber).pVal()) == '') {
			alert('내용을 작성해 주세요');
		} else {
			controller.postAnswer(opinionNumber, $.trim($('#answerBox'+opinionNumber).pVal()));
		}
	};

	function postAnswerResultHandler(e, status, result) {
		if (status == 200) {
			debug.log(result);
			Super.Super.alertPopup('의견묻기', '의견이 등록되었습니다', '확인', function() {
				location.reload(true);
			});
		}
	};

	function pollAnswer(e){
		pollAnswerId = $(this).attr('id').substr(6);
		if (!$(this).hasClass('on')) {
			controller.pollAnswer(pollAnswerId);
		}
	};

	function pollAnswerResultHandler(e, status, result) {
		if (status == 200) {
			var newCount = Number($('#answerCount'+pollAnswerId).text())+1;
			$('#answerCount'+pollAnswerId).text(newCount);
			$('#answer'+pollAnswerId).addClass('on');
		} else {
			alert(status+': '+result.message);
		}
	};
};