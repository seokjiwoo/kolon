/* global $ */

module.exports = ClassPersonalCardController().getInstance();

function ClassPersonalCardController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = PersonalCardController();
			return instance;
		}
	};
	
	function PersonalCardController() {
		callerObj = {
			/**
			 * 카드 리스트
			 */
			personalCard: personalCard,
			/**
			 * 주소 드롭다운 항목 리스트
			 */
			getAddressItems: getAddressItems,
			/**
			 * 거주형태 드롭다운 항목 리스트
			 */
			getDwellingItem: getDwellingItem,
			/**
			 * 개인화 카드 답변
			 */
			answer: answer,
		}
		
		return callerObj;	
	};
	
	/**
	 * 카드 리스트
	 */
	function personalCard(attr) {
		Super.callApi('/apis/me/personal', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('personalCardResult', [200, result.data.myPersonalResponse]);
			} else {
				Super.handleError('personalCard', result);
				$(callerObj).trigger('personalCardResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 주소 드롭다운 항목 리스트
	 */
	function getAddressItems(target, sido, sigungu) {
		Super.callApi('/apis/me/personal/region', 'GET', {
			sido: sido,
			sigungu: sigungu
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addressItemsResult', [200, result.data, target]);
			} else {
				Super.handleError('addressItems', result);
				$(callerObj).trigger('addressItemsResult', [status, result]);
			}
		}, true);
	};

	/**
	 * 거주형태 드롭다운 항목 리스트
	 */
	function getDwellingItem(target) {
		Super.callApi('/apis/me/personal/dwelling', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('dwellingItemsResult', [200, result.data, target]);
			} else {
				Super.handleError('dwellingItems', result);
				$(callerObj).trigger('dwellingItemsResult', [status, result]);
			}
		}, true);
	}
	
	/**
	 * 개인화 카드 답변
	 */
	function answer(cardId, answerType, answerObject) {
		Super.callApi('/apis/me/personal/'+cardId+'?personalType='+answerType, 'POST', answerObject, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('answerResult', [200, result.data]);
			} else {
				Super.handleError('answer', result);
				$(callerObj).trigger('answerResult', [status, result]);
			}
		}, true);
	}
}

