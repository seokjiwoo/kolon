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
		destroy : destroy,
		refresh : refresh,
		append : append,
		EVENT : {
			REFRESH : 'HORIZON_BAR_CHART-REFRESH',
			DESTROY : 'HORIZON_BAR_CHART-DESTROY',
			INIT : 'HORIZON_BAR_CHART-INIT',
			APPEND : 'HORIZON_BAR_CHART-APPEND'
		}
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
		removeBindEvents();
		setBindEvents();
		createChart();
	}

	function setElements() {
		self.wrap = $(self.opts.wrap);
		self.graphs = self.wrap.find(self.opts.graphs);
		self.waypoints = [];
	}

	function setBindEvents() {
		$('body').on(self.EVENT.REFRESH, $.proxy(refresh, self))
					.on(self.EVENT.DESTROY, $.proxy(destory, self))
					.on(self.EVENT.INIT, $.proxy(init, self))
					.on(self.EVENT.APPEND, $.proxy(append, self));

		$(self).on(self.EVENT.REFRESH, $.proxy(refresh, self))
				.on(self.EVENT.DESTROY, $.proxy(destory, self))
				.on(self.EVENT.INIT, $.proxy(init, self))
				.on(self.EVENT.APPEND, $.proxy(append, self));
	}

	function removeBindEvents() {
		$('body').off(self.EVENT.REFRESH, $.proxy(refresh, self))
					.off(self.EVENT.DESTROY, $.proxy(destory, self))
					.off(self.EVENT.INIT, $.proxy(init, self))
					.off(self.EVENT.APPEND, $.proxy(append, self));

		$(self).off(self.EVENT.REFRESH, $.proxy(refresh, self))
				.off(self.EVENT.DESTROY, $.proxy(destory, self))
				.off(self.EVENT.INIT, $.proxy(init, self))
				.off(self.EVENT.APPEND, $.proxy(append, self));
	}

	function createChart(elements) {
		debug.log(fileName, 'createChart');

		var container, opts, graphOpts, drawOpts;
		$.each(elements || self.graphs, function() {
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

	function append(e, insert) {
		if (!insert || !insert.insertElements) {
			return;
		}

		var graphs = [];
		$.each(insert.insertElements, function() {
			if ($(this).hasClass(self.opts.graphs.split('.')[1])) {
				graphs.push($(this));
			} else if ($(this).find(self.opts.graphs).size()) {
				graphs.push($(this).find(self.opts.graphs));
			}
		});
		createChart(graphs);
	}

	function setWaypoint(drawOpts) {
		var container = drawOpts.container,
		waypoint;

		waypoint = new win.Waypoint.Inview({
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
		self.waypoints.push(waypoint);
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

	function destroy() {
		removeBindEvents();
		$.each(self.waypoints, function(index, waypoint) {
			waypoint.destroy();
		});
	}

	function refresh() {
		destroy();
		init();
	}

}