/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/MyPageController.js'),
	events = require('../../events/events'),
	TIMELINE_EVENT = events.TIMELINE;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		timelineContainer : '.js-timeline-container',
		fromNow : '.js-fromNow',
		templates : {
			wrap : '.js-timeline-list-wrap',
			template : '#my-timeline-templates'
		},
		dateFormat : {
			recordDate : 'YYYY년 M월',
			fromDate : 'YYYY.MM.DD',
			fromNow : 'YYYY-MM-DD HH:mm:ss'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		},
		dataAttr : {
			timelineInfo : '[data-timeline-info]'
		},
		updateTime : 1000 * 60,
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();
		
		controller.myTimeLine();
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(TIMELINE_EVENT.WILD_CARD, onControllerListener);
	}

	function getFromNow(registerDateTime) {
		return win.moment(registerDateTime, self.opts.dateFormat.fromNow).fromNow().split(' ').join('');
	}

	function setFromNowUpdate() {
		var timelines = self.templatesWrap.find(self.opts.dataAttr.timelineInfo),
		info = {},
		fromNow;

		$.each(timelines, function() {
			info = $(this).data('timeline-info');
			fromNow = $(this).find(self.opts.fromNow);
			fromNow.html(getFromNow(info.registerDateTime));
		});

		setTimeout(setFromNowUpdate, self.opts.updateTime);

		debug.log(fileName, 'setFromNowUpdate', 'self.opts.updateTime > ', self.opts.updateTime);
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var myCommons = data.myCommons,
		exRecordDate = '',
		recordDate = '',
		list = [],
		listIdx;

		var source,
		template,
		insertElements;

		// 데이터가 없을 경우
		if (!myCommons.length) {
			source = self.template.html();
			template = win.Handlebars.compile(source);
			insertElements = $(template(list));

			self.templatesWrap.empty()
								.addClass(self.opts.cssClass.isLoading)
								.append(insertElements);

			self.templatesWrap.imagesLoaded()
								.always(function() {
									self.templatesWrap.removeClass(self.opts.cssClass.isLoading);

									var timelines = self.templatesWrap.find(self.opts.dataAttr.timelineInfo);
									$.each(timelines, function(index) {
										;(function(target, delay) {
											win.setTimeout(function() {
												target.addClass(self.opts.cssClass.hasAnimate);
											}, delay);
											target.closest(self.opts.timelineContainer).addClass(self.opts.cssClass.hasAnimate);
										})($(this),index * 200);
									});
								});
			return;
		}
		
		// 최신기록부터..
		myCommons.reverse();

		$.map(myCommons, function(value) {
			recordDate = win.moment(value.registerDateTime).format(self.opts.dateFormat.recordDate);

			if (exRecordDate !== recordDate) {
				list.push({
					'recordDate' : recordDate,
					'records' : []
				});
				listIdx = list.length - 1;
				exRecordDate = recordDate;
			}

			value.fromDate = win.moment(value.registerDateTime).format(self.opts.dateFormat.fromDate);
			value.fromNow = getFromNow(value.registerDateTime);

			list[listIdx].records.push(value);
		});

		list[listIdx].records[list[listIdx].records.length - 1].isJoin = true;

		source = self.template.html();
		template = win.Handlebars.compile(source);
		insertElements = $(template(list));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);

								var timelines = self.templatesWrap.find(self.opts.dataAttr.timelineInfo);
								$.each(timelines, function(index) {
									;(function(target, delay) {
										win.setTimeout(function() {
											target.addClass(self.opts.cssClass.hasAnimate);
										}, delay);
										target.closest(self.opts.timelineContainer).addClass(self.opts.cssClass.hasAnimate);
									})($(this),index * 200);
								});
							});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		result = response;

		switch(eventType) {
			case TIMELINE_EVENT.LIST:
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				$.map(result.data.myCommons, function(each){
					/*
					recordType01 -> 상품 구매 기록
					 -> 스크랩 기록
					recordType03 -> 전문가 기록
					recordType04 -> 문의 등록 기록
																		recordType05 -> 견적 요청 기록
					recordType06 -> 1:1 메시지 기록
																		recordType07 -> 후기/리뷰 등록 기록
					 -> 가입 환영 메시지
					recordType09 -> 배달 기록
					recordType10 -> 상품 구매
																		recordType11 -> 상품 시공 타임라인 등록
					recordType12 -> 상품 시공 시작
					*/
					switch(each.myPageTypeCode) {
						case 'BM_MYPAGE_TYPE_01': // 가입 인사
							each.recordType = 'recordType08';
							break;
						case 'BM_MYPAGE_TYPE_02': // 선금 결제 완료(실측/견적 요청)
							//recordType01
							break;
						case 'BM_MYPAGE_TYPE_03': // 실측/견적 요청 취소
							//recordType01
							break;
						case 'BM_MYPAGE_TYPE_04': // 잔금 결제 완료
							//
							break;
						case 'BM_MYPAGE_TYPE_05': // 잔금 결제 취소
							//
							break;
						case 'BM_MYPAGE_TYPE_06': // 시공 시작
							//recordType12
							break;
						case 'BM_MYPAGE_TYPE_07': // 시공 완료
							//recordType12
							break;
						case 'BM_MYPAGE_TYPE_08': // 결제 완료
							//
							break;
						case 'BM_MYPAGE_TYPE_09': // 상품구매 활동
							//recordType01
							break;
						case 'BM_MYPAGE_TYPE_10': // 구매 확정
							//recordType01
							break;
						case 'BM_MYPAGE_TYPE_11': // 취소 신청
							//
							break;
						case 'BM_MYPAGE_TYPE_12': // 교환 신청
							//
							break;
						case 'BM_MYPAGE_TYPE_13': // 반품 신청
							//
							break;
						case 'BM_MYPAGE_TYPE_14': // 이사 신청
							//
							break;
						case 'BM_MYPAGE_TYPE_15': // 세탁 신청
							//
							break;
						case 'BM_MYPAGE_TYPE_16': // 세탁 결제 완료
							// 
							break;
						case 'BM_MYPAGE_TYPE_17': // 세탁 수거/배달 일시 변경
							//
							break;
						case 'BM_MYPAGE_TYPE_18': // 세탁 취소
							//
							break;
						case 'BM_MYPAGE_TYPE_19': // 1:1메시지 작성
							//recordType06
							break;
						case 'BM_MYPAGE_TYPE_20': // 의견 작성
							//recordType04
							break;
						case 'BM_MYPAGE_TYPE_21': // 스크랩
							//recordType02
							break;
						case 'BM_MYPAGE_TYPE_22': // 좋아요
							//
							break;
						case 'BM_MYPAGE_TYPE_23': // 팔로우
							//recordType03
							break;
						case 'BM_MYPAGE_TYPE_24': // 마이카트
							//recordType10
							break;
					}
				});
				displayData(result.data);
				setFromNowUpdate();
				break;
		}
	}

};