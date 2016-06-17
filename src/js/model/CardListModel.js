/* global $ */

module.exports = ClassCardListModel().getInstance();

function ClassCardListModel() {
	var instance;
	var callerObj;

	var topFixedList;
	
	return {
		getInstance: function() {
			if (!instance) instance = LoginModel();
			return instance;
		}
	};
	
	function LoginModel() {
		callerObj = {
			topFixedList: function(value) { 
				if (value != undefined) topFixedList = value;
				return topFixedList;
			}
		}
		
		return callerObj;	
	};
}

