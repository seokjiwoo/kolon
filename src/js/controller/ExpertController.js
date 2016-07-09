/* global $ */

module.exports = ClassExpertController().getInstance();

function ClassExpertController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = ExpertController();
			return instance;
		}
	};
	
	function ExpertController() {
		callerObj = {
			/**
			 * 전문가 리스트
			 */
			expertList: expertList,
			/**
			 * 전문가 상세
			 */
			expertDetail: expertDetail
		}
		
		return callerObj;	
	};
	
	function expertList() {
		Super.callApi('/apis/experts', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('expertListResult', [200, result.data]);
			} else {
				Super.handleError('expertList', result);
				$(callerObj).trigger('expertListResult', [status, result]);
			}
		}, true);
	};
	
	function expertDetail(id) {
		Super.callApi('/apis/experts/'+id, 'GET', {}, function(status, result) {
			if (status != 200) {
				$(callerObj).trigger('expertDetailResult', [200, result]);
			} else {
				Super.handleError('expertDetail', result);
				$(callerObj).trigger('expertDetailResult', [status, result]);
			}
		}, true);
	};
	
}

