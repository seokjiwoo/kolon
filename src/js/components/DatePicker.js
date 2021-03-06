/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'components/DatePicker.js';

	// 기본 옵션 선언
	var defParams = {
		type : 'default',							// type options : default, range
		default : {
			wrap : '.js-picker',					// wrap : className or jQuery Element
			picker : '.js-picker',					// container : className or jQuery Element
			altField : '.js-alt',					// alt : className or jQuery Element
			button : '.js-btn',						// show/hide button : className or jQuery Element
			dateFormat : 'yy.mm.dd',				// DateFormat : 2016.06.14
			minDate : 0,							// 선택 일자는 ' 금일 ' 이후로만 선택되도록 설정
			onSelect : $.noop, 						// 일자 선택시 callback 설정
			changeYear: true,
			changeMonth: true
		},
		range : {
			from : {
				wrap : '.js-range-picker',
				picker : '.js-picker-from',
				altField : '.js-alt-from',
				button : '.js-btn-from',
				dateFormat : 'yy.mm.dd',
				minDate : 0,
				onSelect : $.noop,
				changeYear: true,
				changeMonth: true
			},
			to : {
				wrap : '.js-range-picker',
				picker : '.js-picker-to',
				altField : '.js-alt-to',
				button : '.js-btn-to',
				dateFormat : 'yy.mm.dd',
				defaultDate : +30,
				onSelect : $.noop,
				changeYear: true,
				changeMonth: true
			}
		},
		cssClass : {
			SHOW_HIDE : 'cal-show'
		},
		dataAttr : {
			IS_FROM : 'is-from'
		}
	},
	/**
	 * Default Type DatePicker 설정
	 */
	DefaultPicker = function() {
		return {
			init : function() {
				debug.log(fileName, 'DefaultPicker init');

				this.setElements();
				this.setDatePicker();
				this.setBindEvents();
			},
			setElements : function() {
				this.defOpts = opts.default;
				this.wrap = $(this.defOpts.wrap);

				debug.log('this.wrap', this.wrap);

				this.altField = getJqueryElement(this.wrap, this.defOpts.altField);
				this.button = getJqueryElement(this.wrap, this.defOpts.button);
				this.picker = getJqueryElement(this.wrap, this.defOpts.picker);
			},
			setBindEvents : function() {
				debug.log(fileName, 'DefaultPicker setBindEvents');

				this.altField.on('click', $.proxy(this.onPickerToggler, this));
				this.button.on('click', $.proxy(this.onPickerToggler, this));
			},
			onPickerToggler : function(e) {
				debug.log(fileName, 'DefaultPicker onPickerToggler', e);

				e.preventDefault();
				this.picker.toggleClass(opts.cssClass.SHOW_HIDE);

				if (this.picker.hasClass(opts.cssClass.SHOW_HIDE)) {
					if (this.picker.closest('#colorbox').size()) {
						var calendar = this.picker.closest('.calendar');
						calendar.off('mousedownoutside', $.proxy(this.onPickerHide, this))
									.on('mousedownoutside', $.proxy(this.onPickerHide, this));
						return;
					}

					this.wrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this))
								.on('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
				}
			},
			onPickerHide : function(e) {
				debug.log(fileName, 'DefaultPicker onPickerHide', e);

				if (e && e.target) {
					var target = $(e.target);
					if (target.closest(this.wrap).size()) {
						return;
					}
				}

				this.picker.closest('.calendar').off('mousedownoutside', $.proxy(this.onPickerHide, this));
				this.wrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
				this.picker.removeClass(opts.cssClass.SHOW_HIDE);
			},
			// datepicker 설정
			setDatePicker : function() {
				debug.log(fileName, 'DefaultPicker setDatePicker', opts.type);

				if (!this.defOpts.onSelect || this.defOpts.onSelect === $.noop) {
					this.defOpts.onSelect = $.proxy(this.onPickerSelect, this);
				}
				this.picker.datepicker(this.defOpts);
			},
			// 일자 선택 callback
			onPickerSelect : function(selectedDate, inst) {
				debug.log(fileName, 'DefaultPicker onPickerSelect', selectedDate, inst);
				this.picker.trigger('onSelect', [selectedDate, inst]);
				this.onPickerHide();
			}
		};
	},
	/**
	 * Range Type DatePicker 설정
	 */
	RangePicker = function() {
		return {
			init : function() {
				debug.log(fileName, 'RangePicker init');

				this.setElements();
				this.setDatePicker();
				this.setBindEvents();
			},
			setElements : function() {
				this.fromOpts = opts.range.from;
				this.fromWrap = $(this.fromOpts.wrap);
				this.fromAltField = getJqueryElement(this.fromwrap, this.fromOpts.altField);
				this.fromButton = getJqueryElement(this.fromwrap, this.fromOpts.button);
				this.fromPicker = getJqueryElement(this.fromwrap, this.fromOpts.picker);				
				if (!this.fromOpts.onSelect || this.fromOpts.onSelect === $.noop) {
					this.fromOpts.onSelect = $.proxy(this.onPickerSelect, this);
				}

				this.toOpts = opts.range.to;
				this.toWrap = $(this.toOpts.wrap);
				this.toAltField = getJqueryElement(this.toWrap, this.toOpts.altField);
				this.toButton = getJqueryElement(this.toWrap, this.toOpts.button);
				this.toPicker = getJqueryElement(this.toWrap, this.toOpts.picker);
				if (!this.toOpts.onSelect || this.toOpts.onSelect === $.noop) {
					this.toOpts.onSelect = $.proxy(this.onPickerSelect, this);
				}
			},
			setBindEvents : function() {
				debug.log(fileName, 'RangePicker setBindEvents');

				this.fromAltField.on('click', $.proxy(this.onPickerToggler, this)).data(opts.dataAttr.IS_FROM, true);
				this.fromButton.on('click', $.proxy(this.onPickerToggler, this)).data(opts.dataAttr.IS_FROM, true);

				this.toAltField.on('click', $.proxy(this.onPickerToggler, this)).data(opts.dataAttr.IS_FROM, false);
				this.toButton.on('click', $.proxy(this.onPickerToggler, this)).data(opts.dataAttr.IS_FROM, false);
			},
			onPickerToggler : function(e) {
				debug.log(fileName, 'RangePicker onPickerToggler', e);

				e.preventDefault();

				var target = $(e.currentTarget),
				isFrom = target.data(opts.dataAttr.IS_FROM),
				wrap = (isFrom) ? this.fromWrap : this.toWrap,
				picker = (isFrom) ? this.fromPicker : this.toPicker;

				if (isFrom) {
					this.toWrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
					this.toPicker.removeClass(opts.cssClass.SHOW_HIDE);
				} else {
					this.fromWrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
					this.fromPicker.removeClass(opts.cssClass.SHOW_HIDE);
				}

				picker.toggleClass(opts.cssClass.SHOW_HIDE);

				if (picker.hasClass(opts.cssClass.SHOW_HIDE)) {
					if (wrap.closest('#colorbox').size()) {
						var calendar = (isFrom) ? this.fromPicker.closest('.calendar') : this.toPicker.closest('.calendar');

						calendar.off('mousedownoutside', $.proxy(this.onPickerHide, this))
									.on('mousedownoutside', $.proxy(this.onPickerHide, this));
						return;
					}

					wrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this))
							.on('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
				}
			},
			onPickerHide : function(e) {
				debug.log(fileName, 'RangePicker onPickerHide', e);

				var wrap = (this.fromPicker.is(':visible')) ? this.fromWrap : this.toWrap,
				picker = (this.fromPicker.is(':visible')) ? this.fromPicker : this.toPicker,
				calendar = (this.fromPicker.is(':visible')) ? this.fromPicker.closest('.calendar') : this.toPicker.closest('.calendar');

				if (e && e.target) {
					var target = $(e.target);
					if (target.closest(this.wrap).size()) {
						return;
					}
				}

				calendar.off('mousedownoutside', $.proxy(this.onPickerHide, this));
				wrap.off('focusoutside mousedownoutside', $.proxy(this.onPickerHide, this));
				picker.removeClass(opts.cssClass.SHOW_HIDE);
			},
			// datepicker 설정
			setDatePicker : function() {
				debug.log(fileName, 'RangePicker setDatePicker', opts.type, this.fromOpts, this.toOpts);

				this.fromPicker.datepicker(this.fromOpts).data(opts.dataAttr.IS_FROM, true);
				this.toPicker.datepicker(this.toOpts).data(opts.dataAttr.IS_FROM, false);

				// 초기 - from/to 최소/최대 선택 일자 설정
				this.fromPicker.datepicker('option', 'maxDate', new Date(this.toPicker.datepicker('getDate')));
				this.toPicker.datepicker('option', 'minDate', new Date(this.fromPicker.datepicker('getDate')));
			},
			// 일자 선택 callback
			onPickerSelect : function(selectedDate, inst) {
				debug.log(fileName, 'RangePicker onPickerSelect', selectedDate, inst);

				var picker = $(inst.dpDiv).closest('.hasDatepicker'),
				isFrom = picker.data(opts.dataAttr.IS_FROM);

				// from/to 선택 일자에 따른 최소/선택 일자 설정
				if (isFrom) {
					this.toPicker.datepicker('option', 'minDate', new Date(selectedDate));
				} else {
					this.fromPicker.datepicker('option', 'maxDate', new Date(selectedDate));
				}

				picker.trigger('onSelect', [selectedDate, inst]);

				this.onPickerHide();
			}
		};
	},
	callerObj = {
		/**
		 * 초기화
		 */
		'init' : init
	},
	opts;

	return callerObj;

	/**
	 * Init
	 */
	function init(options) {
		opts = $.extend({}, defParams, options);

		debug.log(fileName, 'init', opts, opts.type);

		switch(opts.type) {
			case 'range':
				new RangePicker().init();
				break;
			default:
				new DefaultPicker().init();
				break;
		}
	}

	function hasJqueryElement(target) {
		return (target instanceof $ && target.size());
	}

	// jQuery Element Flag 에 따라 wrap 기준으로 element 선택
	function getJqueryElement(wrap, target) {
		return (hasJqueryElement(target)) ? target : wrap.find(target);
	}
};