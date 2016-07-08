/* jshint node: true, strict: true */

module.exports = ClassFollowController().getInstance();

function ClassFollowController() {
	'use strict';

	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var instance;
	var callerObj;

	var $ = window.jQuery;
	
	return {
		getInstance: function() {
			if (!instance) instance = FollowController();
			return instance;
		}
	};
	
	function FollowController() {
		callerObj = {
			/**
			 * 팔로우 리스트
			 */
			followsList : followsList,
			/**
			 * 팔로우 등록
			 */
			addFollows : addFollows,
			/**
			 * 팔로우 삭제
			 */
			deleteFollows : deleteFollows
		};		
		return callerObj;
	}


	function followsList() {
		Super.callApi('/apis/follows', 'GET', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('followsListResult', [status, result]);
			} else {
				Super.handleError('followsList', result);
				$(callerObj).trigger('followsListResult', [status, result]);
			}
		}, true);
	}

	function addFollows(followTargetCode, followTargetNumber, followTargetSectionCode, elements) {
		Super.callApi('/apis/follows', 'POST', {
			'followTargetCode' : followTargetCode,
			'followTargetNumber' : followTargetNumber,
			'followTargetSectionCode' : followTargetSectionCode
		}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('addFollowsResult', [status, result, elements]);
			} else {
				Super.handleError('addFollows', result);
				$(callerObj).trigger('addFollowsResult', [status, result, elements]);
			}
		}, true);
	}

	function deleteFollows(followNumber, elements) {
		Super.callApi('/apis/follows/' + followNumber, 'DELETE', {}, function(status, result) {
			if (status == 200) {
				$(callerObj).trigger('deleteFollowsResult', [status, result, elements]);
			} else {
				Super.handleError('deleteFollows', result);
				$(callerObj).trigger('deleteFollowsResult', [status, result, elements]);
			}
		}, true);
	}
}

