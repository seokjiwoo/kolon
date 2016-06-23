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
	fileName = 'compoents/DoughnutChart.js';

	var opts = {
		wrap : 'body',
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
		self.opts = $.extend({}, opts, options);

		debug.log(fileName, 'init', self.opts, isSupport);

		if (!isSupport.svg) {
			debug.warn('SVG 를 지원하지 않는 환경입니다.');
			return;
		}

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
		var t = 2 * Math.PI,
		width, height, outerRadius, innerRadius,
		arc, svg, background, dataGraph, graphOpts,
		opts, container, drawOpts, viewBox, translate;

		debug.log(fileName, 'createChart');

		$.each(self.graphs, function() {
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
				;(function(dataGraph, drawOpts) {
					var container = drawOpts.container;

					new win.Waypoint.Inview({
						element: container.get(0),
						entered: function(/*direction*/) {
							container.addClass(self.opts.cssClass.isEntered)
									.removeClass(self.opts.cssClass.isExited);

							dataGraph.transition().duration(drawOpts.graphOpts.speed).ease(drawOpts.graphOpts.easing).call(arcTween, drawOpts);
						},
						exited: function(/*direction*/) {
							container.removeClass(self.opts.cssClass.isEntered)
									.addClass(self.opts.cssClass.isExited);

							dataGraph.transition().duration(0).ease(drawOpts.graphOpts.easing).call(arcTween, drawOpts, true);
						}
					});
				})(dataGraph, drawOpts);
			} else {
				dataGraph.transition()
						.duration(graphOpts.speed)
						.ease(graphOpts.easing)
						.call(arcTween, drawOpts);
			}
		});
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

	function destory() {
	}

}