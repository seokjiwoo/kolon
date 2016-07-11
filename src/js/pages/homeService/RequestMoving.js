/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'homeService/RequestMoving.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	DropDownMenu = require('../../components/DropDownMenu.js'),
	DatePickerClass = require('../../components/DatePicker.js'),
	DatePicker = DatePickerClass();

	var controller = require('../../controller/LivingServiceController.js');
	$(controller).on('movingAddressListResult', movingAddressListHandler);
	$(controller).on('movingCompanyListResult', movingCompanyListHandler);
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);
	
		setDatePicker();

		controller.movingAddressList();

		$('#addressDrop1').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			controller.movingAddressList(data.values[0]);
		});

		$('#addressDrop2').on(DropDownMenu.EVENT.CHANGE, function(e, data) {
			controller.movingCompanyList(data.values[0]);
		});
	}

	function setDatePicker() {
		var datePicker = $('.js-picker');
		DatePicker.init({
			wrap : datePicker,
			picker : datePicker.find('.js-picker'),
			altField : datePicker.find('.js-alt'),
			button : datePicker.find('.js-btn'),
		});
	};

	function movingAddressListHandler(e, status, result) {
		if (result.sidoList != undefined) {
			var tags = '<ul class="drop" data-prevent="true"><li><a href="#">시/도</a></li>';
			for (var key in result.sidoList) {
				var each = result.sidoList[key];
				tags += '<li><a href="#" data-value="'+each.regionCode+'">'+each.sidoName+'</a></li>';
			}
			tags += '</ul>';

			$('#addressDrop1').html(tags);
		} else if (result.sigunguList != undefined) {
			console.log(result.sigunguList);

			var tags = '<ul class="drop" data-prevent="true"><li><a href="#">시군구</a></li>';
			for (var key in result.sigunguList) {
				var each = result.sigunguList[key];
				tags += '<li><a href="#" data-value="'+each.regionCode+'">'+each.sigunguName+'</a></li>';
			}
			tags += '</ul>';

			$('#addressDrop2').html(tags);
		}

		DropDownMenu.refresh();
	};

	function movingCompanyListHandler(e, status, result) {
		if (status == 200) {
			//
		} else {
			alert('/apis/living/moving/company/ - '+status+':'+result.message);
		}
	}
};