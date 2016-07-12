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
	util = require('../utils/Util.js'),
	fileName = 'compoents/DoughnutChart.js';

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	DOUGHNUTCHART_EVENT = events.DOUGHNUT_CHART;

	var opts = {
		wrap : 'body',
		svgName : 'd3-graph-doughnut',
		graphs : '.js-graph-doughnut',
		percentTxt : '.js-graph-percent',
		dataAttr : {
			opts : 'graph-opts'
		},
		graphOpts : {
			color : {
				background : '#eff1f3', 					// 그래프 배경색
				graph : '#f9cd58'							// 표현되는 그래프 색상
			},
			attr : {
				width : '100%',								// svg 속성 - width
				height : '100%',							// svg 속성 - height
				viewBox : '',								// svg 속성 - viewBox
				preserveAspectRatio : 'xMinYMin',			// svg 속성 - preserveAspectRatio
				translate : ''								// svg 속성 - translate
			},
			easing : 'quadOut',								// 애니메이션 easing / @see http://bl.ocks.org/mbostock/248bac3b8e354a9103c4
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
		EVENT : DOUGHNUTCHART_EVENT
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

		debug.log(fileName, 'init', self.opts, util.isSupport().svg);

		if (!util.isSupport().svg) {
			debug.warn('SVG 를 지원하지 않는 환경입니다.');
			return;
		}

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
		eventManager.on(self.EVENT.REFRESH, $.proxy(refresh, self))
					.on(self.EVENT.DESTROY, $.proxy(destroy, self))
					.on(self.EVENT.INIT, $.proxy(init, self))
					.on(self.EVENT.APPEND, $.proxy(append, self));

		$(self).on(self.EVENT.REFRESH, $.proxy(refresh, self))
				.on(self.EVENT.DESTROY, $.proxy(destroy, self))
				.on(self.EVENT.INIT, $.proxy(init, self))
				.on(self.EVENT.APPEND, $.proxy(append, self));
	}

	function removeBindEvents() {
		eventManager.off(self.EVENT.REFRESH, $.proxy(refresh, self))
					.off(self.EVENT.DESTROY, $.proxy(destroy, self))
					.off(self.EVENT.INIT, $.proxy(init, self))
					.off(self.EVENT.APPEND, $.proxy(append, self));

		$(self).off(self.EVENT.REFRESH, $.proxy(refresh, self))
				.off(self.EVENT.DESTROY, $.proxy(destroy, self))
				.off(self.EVENT.INIT, $.proxy(init, self))
				.off(self.EVENT.APPEND, $.proxy(append, self));
	}

	function createChart(elements) {
		var t = 2 * Math.PI,
		width, height, outerRadius, innerRadius,
		arc, svg, background, dataGraph, graphOpts,
		opts, container, drawOpts, viewBox, translate;

		debug.log(fileName, 'createChart');

		$.each(elements || self.graphs, function() {
			container = $(this);
			opts = container.data(self.opts.dataAttr.opts);

			graphOpts = {};
			graphOpts = $.extend({}, self.opts.graphOpts, opts);

			width = (graphOpts.attr.width === '100%') ? container.outerWidth() : graphOpts.attr.width;
			height = (graphOpts.attr.height === '100%') ? container.outerHeight() : graphOpts.attr.height;
			outerRadius = Math.min(width, height) / 2;
			innerRadius = (outerRadius / 5) * 4;

			arc = win.d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(outerRadius)
							.cornerRadius(outerRadius - innerRadius)
							.startAngle(0);

			viewBox = graphOpts.viewBox || ('0 0 ' + Math.min(width,height) + ' ' + Math.min(width,height));
			translate = [];
			if (graphOpts.attr.translate && $.isArray(graphOpts.attr.translate) && graphOpts.attr.translate.length >= 1) {
				translate = graphOpts.attr.translate;
			} else {
				translate = [ Math.min(width,height) / 2, Math.min(width,height) / 2 ];
			}

			svg = win.d3.select(container.get(0)).append('svg')
					.attr('name', self.opts.svgName)
					.attr('width', graphOpts.attr.width)
					.attr('height', graphOpts.attr.height)
					.attr('viewBox', viewBox)
					.attr('preserveAspectRatio', graphOpts.attr.preserveAspectRatio)
					.append('g')
					.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');

			background = svg.append('path')
							.datum({endAngle: t})
							.style('fill', graphOpts.color.background)
							.attr('d', arc);

			dataGraph = svg.append('path')
							.datum({endAngle: 0 * t})
							.style('fill', graphOpts.color.graph)
							.attr('d', arc);

			drawOpts = {
				arc : arc,
				container : container,
				graphOpts : graphOpts, 
				newAngle : getDataPercent(graphOpts.percent) * t
			};

			debug.log(fileName, 'createChart > graphs', container, graphOpts, drawOpts);

			if (graphOpts.onScreen) {
				setWaypoint(dataGraph, drawOpts);
			} else {
				dataGraph.transition()
						.duration(graphOpts.speed)
						.ease(graphOpts.easing)
						.call(arcTween, drawOpts);
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

	function setWaypoint(dataGraph, drawOpts) {
		var container = drawOpts.container,
		waypoint;

		waypoint = new win.Waypoint.Inview({
			element: container.get(0),
			entered: function(direction) {
				if (direction === 'up') {
					return;
				}

				container.addClass(self.opts.cssClass.isEntered)
						.removeClass(self.opts.cssClass.isExited);

				dataGraph.transition().duration(drawOpts.graphOpts.speed).ease(drawOpts.graphOpts.easing).call(arcTween, drawOpts);
			},
			exited: function(direction) {
				if (direction === 'down') {
					return;
				}
				
				container.removeClass(self.opts.cssClass.isEntered)
						.addClass(self.opts.cssClass.isExited);

				dataGraph.transition().duration(0).ease(drawOpts.graphOpts.easing).call(arcTween, drawOpts, true);
			}
		});

		self.waypoints.push(waypoint);
	}

	function getDataPercent(percent) {
		return percent / 100;
	}

	function arcTween(transition, drawOpts, exited) {
		var container = drawOpts.container,
		newAngle = drawOpts.newAngle,
		graphOpts = drawOpts.graphOpts,
		arc = drawOpts.arc,
		percentTxt = container.find(self.opts.percentTxt),
		txt;

		if (exited) {
			newAngle = 0;
		}

		transition.attrTween('d', function(d) {
			var interpolate = win.d3.interpolate(d.endAngle, newAngle);
			return function(t) {
				d.endAngle = interpolate(t);
				if (percentTxt.size()) {
					txt = (t * graphOpts.percent);

					if (graphOpts.toFixed || graphOpts.toFixed === 0) {
						txt = txt.toFixed(graphOpts.toFixed);
					}

					percentTxt.text(txt);
				}
				return arc(d);
			};
		});
	}

	function destroy() {
		removeBindEvents();
		$.each(self.waypoints, function(index, waypoint) {
			waypoint.destroy();
		});

		$.each(self.graphs, function() {
			var svg = $(this).find('[name="' + self.opts.svgName + '"]');
			if (svg.size()) {
				svg.remove();
			}
		});
	}

	function refresh() {
		destroy();
		init();
	}

}