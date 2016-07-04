/* global $ */

module.exports = ClassScrapController().getInstance();

function ClassScrapController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = ScrapController();
			return instance;
		}
	};
	
	function ScrapController() {
		callerObj = {
			SCRAP_TARGET_CODE_CARD_GOODS: "BM_SCRAP_TARGET_01",
			SCRAP_TARGET_CODE_CARD_MAGAZINE: "BM_SCRAP_TARGET_02",
			SCRAP_TARGET_CODE_IMAGE_GOODS: "BM_SCRAP_TARGET_03",
			SCRAP_TARGET_CODE_IMAGE_MAGAZINE: "BM_SCRAP_TARGET_04",

			/**
			 * 스크랩 카드 목록
			 */
			scrapList: scrapList,
			/**
			 * 스크랩 이미지 목록
			 */
			scrapImageList: scrapImageList,
			/**
			 * 스크랩 등록
			 */
			addScrap: addScrap,
			/**
			 * 스크랩 수정
			 */
			editScrap: editScrap,
			/**
			 * 스크랩 삭제
			 */
			deleteScrap: deleteScrap,
			/**
			 * 스크랩 폴더 등록
			 */
			addScrapFolder: addScrapFolder,
			/**
			 * 스크랩 폴더 수정
			 */
			editScrapFolder: editScrapFolder,
			/**
			 * 스크랩 폴더 삭제
			 */
			deleteScrapFolder: deleteScrapFolder,
		}
		
		return callerObj;	
	};
	
	function scrapList(attr) {
		Super.callApi('/apis/scraps', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('scrapListResult', [status, result]);
			} else {
				Super.handleError('scrapList', result);
				$(callerObj).trigger('scrapListResult', [status, result]);
			}
		}, false);
	};
	
	function scrapImageList(folderNumber) {
		Super.callApi('/apis/scraps/folders/'+folderNumber, 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('scrapImageListResult', [status, result]);
			} else {
				Super.handleError('scrapImageList', result);
				$(callerObj).trigger('scrapImageListResult', [status, result]);
			}
		}, false);
	};

	function addScrap(folderNumber, targetCode, targetNumber) {
		if (targetCode == callerObj.SCRAP_TARGET_CODE_CARD_GOODS || targetCode == callerObj.SCRAP_TARGET_CODE_CARD_MAGAZINE) folderNumber = 0;

		Super.callApi('/apis/scraps', 'POST', {
			"folderNumber": folderNumber,
			"scrapTargetCd": targetCode,
			"scrapTargetNumber": targetNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addScrapResult', [status, result]);
			} else {
				Super.handleError('addScrap', result);
				$(callerObj).trigger('addScrapResult', [status, result]);
			}
		}, false);
	};

	function editScrap(scrapNumber, folderNumber) {
		Super.callApi('/apis/scraps/'+scrapNumber, 'PUT', {
			"folderNumber": folderNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('editScrapResult', [status, result]);
			} else {
				Super.handleError('editScrap', result);
				$(callerObj).trigger('editScrapResult', [status, result]);
			}
		}, false);
	};

	function deleteScrap(scrapNumber) {
		Super.callApi('/apis/scraps/'+scrapNumber, 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('deleteScrapResult', [status, result]);
			} else {
				Super.handleError('deleteScrap', result);
				$(callerObj).trigger('deleteScrapResult', [status, result]);
			}
		}, false);
	};

	function addScrapFolder(folderName) {
		Super.callApi('/apis/scraps', 'POST', {
			"folderName": folderName,
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addScrapFolderResult', [status, result]);
			} else {
				Super.handleError('addScrapFolder', result);
				$(callerObj).trigger('addScrapFolderResult', [status, result]);
			}
		}, false);
	};

	function editScrapFolder(folderNumber, folderName) {
		Super.callApi('/apis/scraps/'+folderNumber, 'PUT', {
			"folderName": folderName
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('editScrapFolderResult', [status, result]);
			} else {
				Super.handleError('editScrapFolder', result);
				$(callerObj).trigger('editScrapFolderResult', [status, result]);
			}
		}, false);
	};

	function deleteScrapFolder(folderNumber) {
		Super.callApi('/apis/scraps/folders/'+folderNumber, 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('deleteScrapFolderResult', [status, result]);
			} else {
				Super.handleError('deleteScrapFolder', result);
				$(callerObj).trigger('deleteScrapFolderResult', [status, result]);
			}
		}, false);
	};
}


