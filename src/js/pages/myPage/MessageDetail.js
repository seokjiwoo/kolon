/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	APIController = require('../../controller/APIController.js'),
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/MessageDetail.js';

	var controller = require('../../controller/MessageController.js');
	$(controller).on('messageDetailResult', messageDetailHandler);
	$(controller).on('messageInquiriesResult', messageWriteHandler);
	$(controller).on('messageDeleteResult', messageDeleteHandler);

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();

	var saleMemberNumber;
	var firstFlag = true;
	var uploadingFlag = false;
	var inquiryAttachedFile;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		saleMemberNumber = util.getUrlVar().saleMemberNumber;

		$('#attach').change(quickAttachHandler);
		$('#quickMessageButton').click(quickMessageHandler);
		
		controller.inquiriesDetail(saleMemberNumber);
	};

	function messageDeleteHandler(e, status, result) {
		if (status == 200) {
			location.href = '/myPage/message.html'; 
		} else {
			alert(result.message);
		}
	}

	function messageDetailHandler(e, status, result) {
		if (firstFlag == true) {
			renderData(result.saleMember, '#message-member-templates', '#message-member-wrap', true);

			$("#deleteAllMessageButton").on("click", function() {
				e.preventDefault();
				if (confirm("메시지 내용을 모두 삭제하시겠습니까?\n삭제하실 경우 메시지 내용이 모두 삭제되며 1:1메시지 목록에서도 삭제됩니다.")) {
					controller.messageDelete(saleMemberNumber);
				}
			});
			
			firstFlag = false;
		}

		renderData(result, '#message-detail-list-templates', '#message-detail-list-wrap', true);

		$('.talkList').imagesLoaded().always(function() {
			$('.talkList').scrollTop($('.talkList').prop('scrollHeight')-$('.talkList').innerHeight());
		});
	};
	
	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};

	function quickAttachHandler(e) {
       var fileName = $(this).pVal();
	   
	   $('#quickMessageAttachForm').ajaxSubmit({
			url: APIController().API_URL + '/apis/inquiries/images',
			method: 'POST',
			xhrFields: {
				withCredentials: true
			},
			beforeSubmit: function(data, form, option) {
				uploadingFlag = true;
				return true;
			}, success: function(response, status) {
				inquiryAttachedFile = response.data.reviewAttachFile;
				uploadingFlag = false;
			}, error: function() {
				alert('파일 첨부에 실패하였습니다. 다시 시도해 주세요.');
				uploadingFlag = false;
			}                               
		});
	};

	function quickMessageHandler(e) {
		e.preventDefault();
		var content = $('#messageContent').pVal();

		if ($.trim(content) == '') {
			alert('내용을 입력하세요.');
		} else if (uploadingFlag == true) {
			alert('파일 업로드가 진행중입니다. 잠시 후에 다시 시도해 주세요.');
		} else {
			controller.inquiries(content, inquiryAttachedFile, [], saleMemberNumber, 0);
		}
		e.stopPropagation();
	};

	function messageWriteHandler(e, status, result) {
		if (status == 200) {
			controller.inquiriesDetail(saleMemberNumber);
		} else {
			alert(result.message);
		}
	};
};