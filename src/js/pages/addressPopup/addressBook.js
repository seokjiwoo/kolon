/* jshint node: true, strict: true */
/* global $ */

module.exports = function() {
	'use strict';
	
	var util = require('../../utils/Util.js');
	var controller = require('../../controller/AddressController.js');
	$(controller).on('addressListResult', addressListHandler);

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
			console.log(each);
			each.rowClass = '';
			each.basicAddressMark = '';
			if (false) {
				each.rowClass = 'basic';
				each.basicAddressMark = '<em>기본배송지</em>';
			}
			each.cellPhoneNumber = util.mobileNumberFormat(each.cellPhoneNumber);
		});

		var template = window.Handlebars.compile($('#address-templates').html());
		var elements = $(template(list.items));
		$('#addressTable').empty().append(elements);

		$('.selectAddress').click(function(e){
			e.preventDefault();
			console.log('select', $(this).data('addressSeq'));
		});
		$('.editAddress').click(function(e){
			e.preventDefault();
			location.href='addressAdd.html?seq='+$(this).data('addressSeq');
		});
		$('.deleteAddress').click(function(e){
			e.preventDefault();
			if (confirm('삭제하시겠습니까?')) {
				console.log('delete', $(this).data('addressSeq'));
			}
		});
	};
}