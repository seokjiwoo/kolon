/* global $ */

module.exports = ClassMagazineController().getInstance();

function ClassMagazineController() {
	var SuperClass = require('./APIController.js');
	var Super = SuperClass();
	
	var model = require('../model/CardListModel.js');

	var instance;
	var callerObj;
	
	return {
		getInstance: function() {
			if (!instance) instance = MagazineController();
			return instance;
		}
	};
	
	function MagazineController() {
		callerObj = {
			/**
			 * 인기 매거진 리스트
			 */
			getListPopular: getListPopular
		}
		
		return callerObj;	
	};
	
	function getListPopular() {
		Super.callApi('/apis/magazines/popular', 'GET', {}, function(status, result) {
			if (status == 200) {
				model.topFixedList(result.data.magazines);
				$(callerObj).trigger('getListPopularResult', [200]);
			} else {
				Super.handleError('getListPopular', result);
				$(callerObj).trigger('getListPopularResult', [result.status]);
			}
		}, false);
	};
}

