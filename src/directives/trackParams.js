!function (trackParams, trackMetric) {
'use strict';

angular.module('angulartics').directive(trackParams, function ($parse) {
	return {
		priority: 2,
		require: trackMetric,
		link: function (scope, iElement, iAttrs, trackMetricCtrl) {
			trackMetricCtrl.setParams($parse(iAttrs[trackParams])(scope));
		}
	};
});

}(angulartics.prefixed('params'), angulartics.prefixed('metric'));