/* global $ */

module.exports = ClassOpinionsController().getInstance();

function ClassOpinionsController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = OpinionsController();
			return instance;
		}
	};
	
	function OpinionsController() {
		callerObj = {
			/**
			 * 의견묻기 리스트 조회
			 */
			opinionsList: opinionsList,
			/**
			 * 의견묻기 스크랩 폴더 목록
			 */
			scrapedOpinionsList: scrapedOpinionsList,
			/**
			 * 의견묻기 등록 (첨부 파일 목록, 스크랩 번호 목록 처리 안 되어 있음!)
			 */
			postOpinion: postOpinion,
			/**
			 * 의견묻기 답변 등록
			 */
			postAnswer: postAnswer
		}
		
		return callerObj;	
	};
	
	function opinionsList() {
		Super.callApi('/apis/opinions', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('opinionsListResult', [200]);
			} else {
				Super.handleError('opinionsList', result);
			}
		}, false);
	};
	
	function scrapedOpinionsList() {
		Super.callApi('/apis/opinions/scraps', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('scrapedOpinionsListResult', [200]);
			} else {
				Super.handleError('scrapedOpinionsList', result);
			}
		}, false);
	};
	
	function postOpinion(sectionId, title, content) {
		Super.callApi('/apis/opinions', 'POST', {
			"attachFiles": [
				0
			],
			"content": content,
			"opinionSectionCd": sectionId,
			"scrapNumbers": [
				0
			],
			"title": title
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('postOpinionResult', [200, result.data]);
			} else {
				Super.handleError('postOpinion', result);
				$(callerObj).trigger('postOpinionResult', [result.status]);
			}
		}, false);
	};
	
	function postAnswer(opinionNumber, answer) {
		Super.callApi('/apis/opinions/'+opinionNumber+'/answer', 'POST', {
			"answer": answer,
			"opinionNumber": opinionNumber
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('postAnswerResult', [200, result.data]);
			} else {
				Super.handleError('postAnswer', result);
				$(callerObj).trigger('postAnswerResult', [result.status]);
			}
		}, false);
	};
}

