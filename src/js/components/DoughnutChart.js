/* jshint node: true, strict: true */
module.exports = DoughnutChart().getInstance();

function DoughnutChart() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/DoughnutChart.js';

	var opts = {
		wrap : '.js-graph-area',
		target : '.js-graph-doughnut',
		dataAttr : {
			opts : 'graph-opts'
		}
	},
	isSupport = (function() {
		return {
			svg : function() {
				return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
			}
		};
	})();

	var callerObj = {
		init : init,
		destory : destory
	},
	instance, self;
	
	return {
		getInstance: function() {
			if (!instance) instance = callerObj;
			return instance;
		}
	};
	
	function init(options) {
		self = callerObj;
		self.opts = $.extend(true, opts, options);

		debug.log(fileName, 'init', self.opts, isSupport);

		setElements();
		setBindEvents();
	}

	function setElements() {
	}

	function setBindEvents() {

	}

	function destory() {
	}

}