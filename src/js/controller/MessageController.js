/* jshint node: true, strict: true */
module.exports = ClassMessageController().getInstance();

function ClassMessageController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = MessageController();
			return instance;
		}
	};
	
	function MessageController() {
		callerObj = {
			/**
			 * 메시지 목록
			 */
			messageList : messageList,
			/**
			 * 1:1 메세지 등록
			 */
			inquiries : inquiries,
			/**
			 * 1:1 메세지 파일 업로드
			 */
			inquiriesImages : inquiriesImages,
			/**
			 * 1:1 메세지 상세
			 */
			inquiriesDetail : inquiriesDetail
		};
		
		return callerObj;	
	}
	
	// 1:1 메세지 리스트
	function messageList() {
		Super.callApi('/apis/inquiries', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('messageListResult', [status, result]);
			} else {
				Super.handleError('messageList', result);
				$(callerObj).trigger('messageListResult', [status, result]);
			}
		}, true);
	}


	//	1:1 메세지 등록
	//	POST /apis/inquiries
	/*
		-. request
		{
			'contents': 'string',
			'inquiryAttachFileRequest': {
				'attachFileName': 'string',
				'attachFileSize': 'string',
				'attachFileUrl': 'string'
			},
			'productNumber': 1,
			'saleMemberNumber': 1
		}
	 */
	function inquiries(contents, inquiryAttachFileRequest, productNumber, saleMemberNumber) {
		Super.callApi('/apis/inquiries', 'POST', {
			'contents': 'string',
			'inquiryAttachFileRequest': inquiryAttachFileRequest,
			'productNumber': productNumber,
			'saleMemberNumber': saleMemberNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('messageInquiriesResult', [status, result]);
			} else {
				Super.handleError('messageInquiries', result);
				$(callerObj).trigger('messageInquiriesResult', [status, result]);
			}
		}, true);
	}


	//	1:1 메세지 파일 업로드
	//	POST /apis/inquiries/images
	function inquiriesImages(file) {
		Super.callApi('/apis/inquiries', 'POST', {
			'file' : file
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('messageInquiriesImagesResult', [status, result]);
			} else {
				Super.handleError('messageInquiriesImages', result);
				$(callerObj).trigger('messageInquiriesImagesResult', [status, result]);
			}
		}, true);
	}


	//	1:1 메세지 상세
	//	GET /apis/inquiries/{saleMemberNumber}
	function inquiriesDetail(saleMemberNumber) {
		Super.callApi('/apis/inquiries/' + saleMemberNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('messageInquiriesDetailResult', [status, result]);
			} else {
				Super.handleError('messageInquiriesDetail', result);
				$(callerObj).trigger('messageInquiriesDetailResult', [status, result]);
			}
		}, true);
	}
}

