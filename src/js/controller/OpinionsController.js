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
			 * 의견 주제 코드 리스트 
			 */
			opinionsClass: opinionsClass,
			/**
			 * 의견묻기 리스트 조회
			 */
			opinionsList: opinionsList,
			/**
			 * 의견묻기 전문가 리스트
			 */
			opinionsExpertList: opinionsExpertList,
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
			postAnswer: postAnswer,
			/**
			 * 의견묻기 답변 유용함 체크
			 */
			pollAnswer: pollAnswer
		}
		
		return callerObj;	
	};

	function opinionsClass() {
		Super.callApi('/apis/opinions/clesses', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('opinionsClassResult', [status, result.data.opinionThemes]);
			} else {
				Super.handleError('opinionsClass', result);
				$(callerObj).trigger('opinionsClassResult', [status, result]);
			}
		}, true);
	}
	
	function opinionsList() {
		Super.callApi('/apis/opinions', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('opinionsListResult', [status, result.data.opinions]);
			} else {
				Super.handleError('opinionsList', result);
				$(callerObj).trigger('opinionsListResult', [status, result]);
			}
		}, true);
	};

	function opinionsExpertList() {
		Super.callApi('/apis/opinions/experts', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('opinionsExpertsListResult', [status, result.data.opinionExperts]);
			} else {
				Super.handleError('opinionsExpertList', result);
				$(callerObj).trigger('opinionsExpertsListResult', [status, result]);
			}
		}, true);
	}
	
	function scrapedOpinionsList() {
		Super.callApi('/apis/opinions/scraps', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('scrapedOpinionsListResult', [200, result.data]);
			} else {
				Super.handleError('scrapedOpinionsList', result);
				$(callerObj).trigger('scrapedOpinionsListResult', [200, result.data]);
			}
		}, true);
	};
	
	function postOpinion(sectionId, title, content, uploadImageArray, scrapNumbers) {
		Super.callApi('/apis/opinions', 'POST', {
			"attachFiles": uploadImageArray,
			"content": content,
			"opinionClassNumber": sectionId,
			"scrapNumbers": scrapNumbers,
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
			"answer": answer
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('postAnswerResult', [200, result.data]);
			} else {
				Super.handleError('postAnswer', result);
				$(callerObj).trigger('postAnswerResult', [status, result]);
			}
		}, false);
	};

	function pollAnswer(answerNumber) {
		Super.callApi('/apis/opinions/answers/'+answerNumber, 'POST', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('pollAnswerResult', [200, result.data]);
			} else {
				Super.handleError('pollAnswer', result);
				$(callerObj).trigger('pollAnswerResult', [status, result]);
			}
		}, false);
	};
}

