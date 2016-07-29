/* global $ */

module.exports = ClassMyPageController().getInstance();

function ClassMyPageController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = MyPageController();
			return instance;
		}
	};
	
	function MyPageController() {
		callerObj = {
			/**
			 * 내 정보 확인
			 */
			myInfo: myInfo,
			/**
			 * 마이커먼 타임라인
			 */
			myTimeLine: myTimeLine,
			/**
			 * 내 의견 묻기 목록
			 */
			myOpinions: myOpinions,
			/**
			 * 최근 본 상품 목록
			 */
			recentViewItems: recentViewItems,
			/**
			 * 좋아요 목록
			 */
			likes: likes,

			/**
			 * 포인트 조회
			 */
			myPoints: myPoints,
			/**
			 * 포인트 상세
			 */
			pointsHistory: pointsHistory,

			/**
			 * 알림 유형 코드
			 */
			noticeTypeCode: noticeTypeCode,
			/**
			 * 알림 리스트 조회
			 */
			noticeList: noticeList,
			/**
			 * 알림 삭제
			 */
			noticeDelete: noticeDelete
		}
		
		return callerObj;	
	};
	
	function myInfo() {
		Super.callApi('/apis/me', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myInfoResult', [200, result]);
			} else {
				Super.handleError('myInfo', result);
				$(callerObj).trigger('myInfoResult', [status, result]);
			}
		}, true);
	};
	
	function myTimeLine() {
		Super.callApi('/apis/me/timeline', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myTimeLineResult', [200, result]);
			} else {
				Super.handleError('myTimeLine', result);
			}
		}, true);
	}

	function myOpinions() {
		Super.callApi('/apis/me/opinions', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myOpinionsResult', [200, result.data.myOpinions]);
			} else {
				Super.handleError('myOpinions', result);
				$(callerObj).trigger('myOpinionsResult', [status, result.data.myOpinions]);
			}
		}, true);
	};
	
	function recentViewItems() {
		Super.callApi('/apis/me/recent', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('recentViewItemsResult', [200, result]);
			} else {
				Super.handleError('recentViewItems', result);
				$(callerObj).trigger('recentViewItemsResult', [status, result]);
			}
		}, true);
	};

	function likes() {
		Super.callApi('/apis/me/like', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('likeItemsResult', [200, result]);
			} else {
				Super.handleError('likeItems', result);
				$(callerObj).trigger('likeItemsResult', [status, result]);
			}
		}, true);
	}

	
	function myPoints() {
		Super.callApi('/apis/me/point', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('myPointsResult', [200, result.data]);
			} else {
				Super.handleError('myPoints', result);
				$(callerObj).trigger('myPointsResult', [status, result]);
			}
		}, true);
	};
	
	function pointsHistory(fromDate, toDate, code) {
		Super.callApi('/apis/me/point/history', 'GET', {
			startDate: fromDate,
			endDate: toDate,
			filter: code
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('pointsHistoryResult', [200, result.data]);
			} else {
				Super.handleError('pointsHistory', result);
				$(callerObj).trigger('pointsHistoryResult', [status, result]);
			}
		}, true);
	};





	/**
	 * 알림 리스트 타입 코드 받아오기
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/common-code-controller/listCommonCodeUsingGET ? groupCode=BM_NOTICE_TYPE
	 */
	function noticeTypeCode() {
		Super.callApi('/apis/codes/BM_NOTICE_TYPE', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('noticeTypeCodeResult', [status, result.data.commonCodes]);
			} else {
				Super.handleError('noticeTypeCode', result);
				$(callerObj).trigger('noticeTypeCodeResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 알림 리스트
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/notice-controller/getNoticeListUsingGET
	 */
	function noticeList(page, qty) {
		Super.callApi('/apis/notices', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('noticeListResult', [status, result.data]);
			} else {
				Super.handleError('noticeList', result);
				$(callerObj).trigger('noticeListResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 알림 삭제
	 * @see http://dev.koloncommon.com/swagger/swagger-ui.html#!/notice-controller/removeNoticeUsingDELETE
	 */
	function noticeDelete() {
		Super.callApi('/apis/notices', 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('noticeDeleteResult', [status, result]);
			} else {
				Super.handleError('noticeDelete', result);
				$(callerObj).trigger('noticeDeleteResult', [status, result]);
			}
		}, true);
	};


	

}

