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
	MyPage = MyPageClass(),
	eventManger

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

	// 일자별 message 그룹핑
	function getMessageGroup(result) {
		var inquiryMessages = result.inquiryMessages.slice();

		inquiryMessages.reverse();

		var messageGroup = [],
		groupIdx = -1,
		date = '',
		curDate = '';

		$.map(inquiryMessages, function(val) {
			curDate = window.moment(val.createDateTime).format('YYYY.MM.DD');

			val.VX_YYYYMMDD = curDate;
			val.VX_TIME = window.moment(val.createDateTime).format('hh:mm');

			if (date != curDate) {
				date = curDate;
				messageGroup.push([]);
				groupIdx++;
			}

			messageGroup[groupIdx].push(val);
		});

		result.vxMessageGroup = messageGroup;

		return result;
	}

	function messageDetailHandler(e, status, result) {
		inquiryAttachedFile = null;
		if (firstFlag == true) {
			renderData(result.saleMember, '#message-member-templates', '#message-member-wrap', true);

			$("#deleteAllMessageButton").on("click", function() {
				e.preventDefault();
				if (confirm("메시지 내용을 모두 삭제하시겠습니까?\n삭제하실 경우 메시지 내용이 모두 삭제되며 1:1메시지 목록에서도 삭제됩니다.")) {
					controller.messageDelete(saleMemberNumber);
				}
			});

			$('#message-saleMemberName').text(result.saleMember.saleMemberName);
			$('#message-saleMemberName').on('click', function(e) { // common slideToggle
				var btn = $(this);
				e.preventDefault();
				$(this).toggleClass('open');
				$('#message-saleMemeberInfo').slideToggle();
				$('#message-saleMemeberInfo').find('.btnClose').on('click', function(e) {
					e.preventDefault();
					$(this).closest('.slideCon').slideUp();
					$('#message-saleMemberName').removeClass('open')
				})
			});
			
			firstFlag = false;
		}

		renderData(getMessageGroup(result), '#message-detail-list-templates', '#message-detail-list-wrap', true);

		var messageWrap = $('#message-detail-list-wrap');

		messageWrap.height($(window).height() - messageWrap.offset().top - $('.inputMessage').outerHeight());
		messageWrap.imagesLoaded().always(function() {
			messageWrap.scrollTop(messageWrap.prop('scrollHeight') - messageWrap.innerHeight());
		});
	};
	
	function renderData(data, templateSelector, wrapperSelector, clearFlag) {
		var template = window.Handlebars.compile($(templateSelector).html());
		var elements = $(template(data));
		if (clearFlag) $(wrapperSelector).empty();
		$(wrapperSelector).append(elements);
	};

	function quickAttachHandler(e) {
       var fileName = $(this).val();
	   
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
		var content = $('#messageContent').val();

		if ($.trim(content) == '') {
			alert('내용을 입력하세요.');
		} else if (uploadingFlag == true) {
			alert('파일 업로드가 진행중입니다. 잠시 후에 다시 시도해 주세요.');
		} else {
			controller.inquiries(content, inquiryAttachedFile, [], saleMemberNumber, 0);
			$('#messageContent').val('');
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