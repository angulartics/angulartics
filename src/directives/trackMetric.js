!function (trackMetric) {
'use strict';

angular.module('angulartics').directive(trackMetric, function (analytics, angulartics) {
	return {
		controller: function ($attrs) {
			var metricName = $attrs[trackMetric] || function error() { throw 'No metric specified'; };
			var metricParams = { data: undefined };

			/**
			 * Adds or replaces parameters.
			 *
			 * @param {Object} params
			 */
			this.setParams = function (params) {
				metricParams.data = angular.extend({}, metricParams.data, params);
			}

			/**
			 * Triggers the underlying analytics track function.
			 */
			this.hit = function () {
				var metricEval = angulartics.metric(metricName);
				var data = metricEval && metricEval(metricParams.data) || metricParams.data;
				var trackArgs = [metricName].concat(data && [data] || []);
				angulartics.log && console.log(metricName, metricData, data);
				analytics.track.apply(analytics, trackArgs);
			};
		}
	};
});

}(angulartics.prefixed('metric'));