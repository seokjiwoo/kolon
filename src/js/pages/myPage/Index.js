/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass();
	
	var controller = require('../../controller/MyPageController.js');
	$(controller).on('myTimeLineResult', myTimeLineHandler);
	
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

		// controller.myTimeLine();
		myTimeLineHandler();
	}

	function myTimeLineHandler(e, status, result) {
		result = {
			"status": "200",
			"message": "ok",
			"data": {
				"myCommons": [{
					"myPageTypeCode": "BM_MYPAGE_TYPE_11",
					"myPageTypeName": "가입 인사",
					"myPageContents": "커먼에 가입하신걸 환영합니다.",
					"registerDateTime": "2014-06-28 00:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2015-06-29 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-01-29 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-01-30 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-02-01 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-02-15 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-02-21 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-05-01 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-06-29 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-07-01 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-07-02 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-07-05 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-07-06 10:00:00.0"
				}, {
					"myPageTypeCode": "BM_MYPAGE_TYPE_15",
					"myPageTypeName": "마이카트",
					"myPageContents": "다이닝 스페이스 상품을 장바구니에 추가하셨습니다.",
					"registerDateTime": "2016-07-06 10:00:00.0"
				} ]
			}
		};
//moment("20160706 10:00:00", "YYYY-MM-DD HH:mm:ss").fromNow();
		var myCommons = result.data.myCommons;

		win.console.log('myCommons', myCommons);
		
		// 최신기록부터..
		myCommons.reverse();

		var exRecordDate = '',
		recordDate = '',
		list = [],
		listIdx;

		$.map(myCommons, function(value) {
			recordDate = win.moment(value.registerDateTime).format('YYYY년 M월');

			if (exRecordDate !== recordDate) {
				list.push({
					'recordDate' : recordDate,
					'records' : []
				});
				listIdx = list.length - 1;
				exRecordDate = recordDate;
			}

			switch(value.myPageTypeCode) {
				case 'BM_MYPAGE_TYPE_11':
					value.recordType = 'recordType';
					break;
				case 'BM_MYPAGE_TYPE_10':
					value.recordType = 'recordType01';
					break;
				default:
					value.recordType = 'recordType01';
					break;
			}

			list[listIdx].records.push(value);
		});

		list[listIdx].records[list[listIdx].records.length - 1].isJoin = true;

		var source = $('#me-timeline-templates').html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(list));

		$('#myTimeline').empty()
						.append(insertElements);

		$('#myTimeline').imagesLoaded()
							.always(function() {
								var list = $('#myTimeline').find('[data-timeline-info]');
								$.each(list, function(index) {
									;(function(target, delay) {
										win.setTimeout(function() {
											target.addClass('has-animate');
										}, delay);
										target.closest('.js-timeline-wrap').addClass('has-animate');
									})($(this),index * 200);
								});
							});
	}
};