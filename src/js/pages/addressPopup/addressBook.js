/* jshint node: true, strict: true */
/* global $ */

module.exports = function() {
	'use strict';
	var debug = require('../../utils/Console.js');
	
	var util = require('../../utils/Util.js');
	var controller = require('../../controller/AddressController.js');
	$(controller).on('addressListResult', addressListHandler);
	$(controller).on('deleteAddressResult', deleteAddressHandler);

	var SuperClass = require('../Page.js'),
	Super = SuperClass();

	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		controller.addressList();
	};

	function addressListHandler(e, status, list) {
		$.map(list.items, function(each) {
			debug.log(each);
			each.rowClass = '';
			each.basicAddressMark = '';
			if (each.addressSectionCode == 'BM_ADDR_SECTION_02') {
				each.rowClass = 'basic';
				each.basicAddressMark = '<em>기본배송지</em><br/>';
			} else {
				each.deleteAddressTag = 'Y';
			}
			each.cellPhoneNumber = util.mobileNumberFormat(each.cellPhoneNumber);
		});

		var template = window.Handlebars.compile($('#address-templates').html());
		var elements = $(template(list));
		$('#addressTable').empty().append(elements);

		$('.selectAddress').click(function(e){
			e.preventDefault();
			debug.log('select', $(this).data('addressSeq'));
			window.opener.selectAddressData($(this).data('addressSeq'));
			window.close();
		});
		$('.editAddress').click(function(e){
			e.preventDefault();
			location.href='addressForm.html?seq='+$(this).data('addressSeq');
		});
		$('.deleteAddress').click(function(e){
			e.preventDefault();
			if (confirm('삭제하시겠습니까?')) {
				controller.deleteAddress($(this).data('addressSeq'));
			}
		});
	};

	function deleteAddressHandler(e) {
		location.reload(true);
	};

	//
}