/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	APIController = require('../../controller/APIController.js'),
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	imageUploader = require('../../components/ImageUploader.js'),
	fileName = 'qna/Index.js';

	var controller = require('../../controller/OpinionsController.js');
	$(controller).on('opinionsClassResult', opinionsClassHandler);
	$(controller).on('opinionsListResult', opinionsListHandler);
	$(controller).on('opinionsExpertsListResult', opinionsExpertsListHandler);

	$(controller).on('postOpinionResult', postOpinionResultHandler);
	$(controller).on('postAnswerResult', postAnswerResultHandler);
	$(controller).on('pollAnswerResult', pollAnswerResultHandler);

	var expertController = require('../../controller/ExpertController.js');
	$(expertController).on('expertListResult', expertListHandler);

	var myPageController = require('../../controller/MyPageController.js');
	$(myPageController).on('myOpinionsResult', myOpinionsHandler);
	
	var uploadFileNumber;
	var uploadImageArray;
	var opinionsClassArray;

	var pollAnswerId;
	
	var opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			popAttachPictures : 'popAttachPictures'
		},
		imageUploader : {
			api_url : APIController().API_URL+'/apis/opinions/images',
			flashOpts : {
				swf : '../images/swf/imagePreview.swf',
				id : 'imageUpoader',
				width : '100%',
				height : '100%',
				wmode : 'transparent',
				filterOpt : {
					filter : 'images (*.jpg, *.jpeg, *.png)',
					type : '*.jpg;*.jpeg;*.png'
				}
			}
		}
	};

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init(options) {
		Super.init();

		callerObj.colorbox = $(opts.colorbox.target);
		$(document).on(opts.colorbox.event.COMPLETE, onCboxEventListener)
		$(document).on(opts.colorbox.event.CLEANUP, onCboxEventListener)
		$(document).on(opts.colorbox.event.CLOSED, onCboxEventListener);

		$(".opinionwrite > .toggleBtn").on("click", showWriteForm);
		$('#opinionWriteForm').submit(writeFormSubmitHandler);

		controller.opinionsClass();
		if (Super.Super.loginData != null) {
			$('#myOpinion').show();
			$('#expertRank').css('margin-top', '20px');
			myPageController.myOpinions();
		}
		controller.opinionsExpertList();
		expertController.expertList();
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
		
		controller.opinionsList();
	}

	/**
	 * 의견 리스트 핸들링
	 */
	function opinionsListHandler(e, status, result) {
		if (status == 200) {
			var key = 0;
			$.map(result, function(each) {
				each.opinionClass = opinionsClassArray[each.opinionClassNumber];
				if (each.answers.length == 0) {
					each.answerCount = '<p>미답변</p>';
				} else {
					each.answerCount = '<p><span class="pointRed">'+each.answers.length+'개</span> 의견</p>';
				}
				each.key = key;
				console.log(each);

				key++;
			});

			var template = window.Handlebars.compile($('#opinion-template').html());
			var elements = $(template(result));
			$('#opinionList').empty().append(elements);

			$('.myProfileImage').attr('src', Super.Super.loginData.imageUrl);

			$('.writeCommentButton').click(showCommentForm);
			$('.answerCount').click(pollAnswer);
			$('.answerForm').submit(answerFormSubmitHandler);
			
			$('.except').dotdotdot({watch:'window'});
		}
	};

	/**
	 * 상단 전문가 리스트 핸들링
	 */
	function expertListHandler(e, status, result) {
		if (status == 200) {
			var template = window.Handlebars.compile($('#experts-template').html());
			var elements = $(template(result));
			$('#expertList').empty().append(elements);

			$('#expertList').bxSlider({
				minSlides: 6,
				maxSlides: 6,
				responsive: false,
				pager: false,
				controls: false,
				slideWidth: 166,
				slideMargin: 7,
				auto: true
			});
		}
	};

	/**
	 * 가장 많은 도움을 준 전문가 리스트 핸들링
	 */
	function opinionsExpertsListHandler(e, status, result) {
		if (status == 200) {
			var template = window.Handlebars.compile($('#expert-rank-template').html());
			var elements = $(template(result));
			$('#expertRank').empty().append(elements);
		}
	};

	/**
	 * 내 의견묻기 목록 핸들링
	 */
	function myOpinionsHandler(e, status, result) {
		if (status == 200) {
			console.log(result);
			var template = window.Handlebars.compile($('#my-opinion-template').html());
			var elements = $(template(result));
			$('#myOpinion').empty().append(elements);
		}
	};

	function showCommentForm(e) {
		e.preventDefault();
		if (Super.Super.loginData != null) {
			var pId = $(this).attr('id').substr(18);
			$('#commentArea'+pId).addClass('showCommentInput');
		} else {
			if (confirm('로그인이 필요한 페이지입니다. 로그인하시겠습니까?')) location.href='/member/login.html';
		}
	};

	function showWriteForm(e) {
		e.preventDefault();

		if (Super.Super.loginData != null) {
			if (!$(this).hasClass("active")) {
				uploadFileNumber = 0;
				uploadImageArray = new Array();
				$('#fileUpList').html('');
				$('#opinionThemes').val('-');
				$('#opinionTitle').val('');
				$('#opinionContent').val('');

				$(this).addClass("active").find("span").text("접기");
				$(".opinionInput").stop().slideDown();
			} else {
				$(this).removeClass("active").find("span").text("의견 묻기");
				$(".opinionInput").stop().slideUp();
			};
		} else {
			if (confirm('로그인이 필요한 페이지입니다. 로그인하시겠습니까?')) location.href='/member/login.html';
		}
	};

	function writeFormSubmitHandler(e) {
		e.preventDefault();

		if ($('#opinionThemes').val() == '-') {
			alert('주제를 선택해주세요');
		} else if ($.trim($('#opinionTitle').val()) == '') {
			alert('제목을 입력해주세요');
		} else if ($.trim($('#opinionContent').val()) == '') {
			alert('자세한 내용을 작성해 주세요');
		} else {
			controller.postOpinion($('#opinionThemes').val(), $.trim($('#opinionTitle').val()), $.trim($('#opinionContent').val()), uploadImageArray);
		}
	};

	function postOpinionResultHandler(e, status, result) {
		if (status == 200) {
			Super.Super.alertPopup('의견묻기', '등록이 완료되었습니다', '확인', function() {
				location.reload(true);
			});
		}
	};

	function answerFormSubmitHandler(e) {
		e.preventDefault();
		var opinionNumber = $(this).attr('id').substr(10);

		if ($.trim($('#answerBox'+opinionNumber).val()) == '') {
			alert('내용을 작성해 주세요');
		} else {
			controller.postAnswer(opinionNumber, $.trim($('#answerBox'+opinionNumber).val()));
		}
	};

	function postAnswerResultHandler(e, status, result) {
		if (status == 200) {
			console.log(result);
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

	function onUploaderSelectedFiles(e, selectedFiles) {
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.SELECTED_FILES, selectedFiles);
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploadSuccess(e, result) {
		result = result.opinionAttachFile;
		debug.log(fileName, 'onUploaderSuccess', imageUploader.EVENT.UPLOAD_SUCCESS, result);
		
		if (uploadImageArray.length == 3) {
			alert('이미지는 3장까지 첨부 가능합니다');
		} else {
			uploadImageArray.push(result);
			$('#fileUpList').append('<div id="con'+uploadFileNumber+'" class="conDel">'+result.attachFileName+' <a href="#" id="deleteFile'+uploadFileNumber+'" data-image-url="'+result.attachFileUrl+'" class="btnDel">삭제</a></div>');
			$('#deleteFile'+uploadFileNumber).click(function(e) {
				e.preventDefault();
				for (var key in uploadImageArray) {
					var eachFile = uploadImageArray[key];
					if (eachFile.attachFileUrl == $(this).data('imageUrl')) addr = key;
				}
				uploadImageArray.splice(addr, 1);
				$('#con'+$(this).attr('id').substr(10)).remove();

				$('#fileUpText').show();
				$('#fileUpButton').show();
			});

			uploadFileNumber++;
			if (uploadImageArray.length == 3) {
				$('#fileUpText').hide();
				$('#fileUpButton').hide();
			}
		}
		$.colorbox.close();
	}

	function onUploadFailure(e, jqXHR) {
		debug.log(fileName, 'onUploaderFailure', imageUploader.EVENT.UPLOAD_FAILURE, jqXHR);
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (callerObj.colorbox.hasClass(opts.cssClass.popAttachPictures)) {
					$(imageUploader).on(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.on(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.on(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure);

					imageUploader.init(opts.imageUploader);
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (callerObj.colorbox.hasClass(opts.cssClass.popAttachPictures)) {
					$(imageUploader).off(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.off(imageUploader.EVENT.UPLOAD_SUCCESS, onUploadSuccess)
									.off(imageUploader.EVENT.UPLOAD_FAILURE, onUploadFailure);

					imageUploader.destory();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}
};