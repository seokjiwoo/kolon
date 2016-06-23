/* jshint node: true, strict: true */
module.exports = DoughnutChart().getInstance();

/**
 * @requires d3
 * @requires waypoints
 */
function DoughnutChart() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'compoents/HorizonBarChart.js';

	var opts = {
		wrap : 'body',
		graphs : '.js-graph-horizonbar',
		percentTxt : '.js-graph-percent',
		dataBar : '.js-graph-data',
		dataAttr : {
			opts : 'graph-opts'
		},
		graphOpts : {
			easing : 'easeOutQuad',							// 애니메이션 easing / @see http://gsgd.co.uk/sandbox/jquery/easing/
			percent : 100,									// 그래프 퍼센트
			speed : 2000,									// 애니메이션 속도
			onScreen : true,								// 화면에 위치시 애니메이션 실행
			toFixed : 0										// 소수점 처리
		},
		cssClass : {
			isEntered : 'is-entered',
			isExited : 'is-exited'
		}
	};

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
		self.opts = $.extend({}, opts, options);

		debug.log(fileName, 'init', self.opts);

		setElements();
		setBindEvents();
		createChart();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.graphs = self.wrap.find(self.opts.graphs);
	}

	function setBindEvents() {

	}

	function createChart() {
		debug.log(fileName, 'createChart');

		var container, opts, graphOpts, drawOpts;
		$.each(self.graphs, function() {
			container = $(this);
			opts = container.data(self.opts.dataAttr.opts);

			graphOpts = {};
			graphOpts = $.extend({}, self.opts.graphOpts, opts);

			debug.log(fileName, 'createChart > graphs', container, graphOpts);

			drawOpts = {
				container : container,
				graphOpts : graphOpts
			};
			
			if (graphOpts.onScreen) {
				setWaypoint(drawOpts);
			} else {
				tweenChart(drawOpts);
			}
		});
	}

	function setWaypoint(drawOpts) {
		var container = drawOpts.container;
		new win.Waypoint.Inview({
			element: container.get(0),
			entered: function(/*direction*/) {
				container.addClass(self.opts.cssClass.isEntered)
						.removeClass(self.opts.cssClass.isExited);
						
				tweenChart(drawOpts);
			},
			exited: function(/*direction*/) {
				container.removeClass(self.opts.cssClass.isEntered)
						.addClass(self.opts.cssClass.isExited);

				tweenChart(drawOpts, true);
			}
		});
	}

	function tweenChart(drawOpts, exited) {
		var container = drawOpts.container,
		percentTxt = container.find(self.opts.percentTxt),
		dataBar = container.find(self.opts.dataBar),
		graphOpts = drawOpts.graphOpts,
		percent = graphOpts.percent,
		speed = graphOpts.speed,
		txt;

		if (exited) {
			percent = 0;
			speed = 0;
		}

		dataBar.stop().animate({ width : (percent) + '%' }, {
			duration : speed,
			easing : graphOpts.easing,
			step : function(now) {
				if (percentTxt.size()) {
					txt = now;

					if (graphOpts.toFixed || graphOpts.toFixed === 0) {
						txt = txt.toFixed(graphOpts.toFixed);
					}

					percentTxt.text(txt);
				}
			}
		});
	}

	function destory() {
	}

}