(function (trackMetric) {
'use strict';

angular.module('angulartics').directive('ngModel', function () {
	return {
		priority: 3,
		require: '?'+trackMetric,
		link: function (scope, iElement, iAttrs, trackMetricCtrl) {
			if (!trackMetricCtrl) return;
			trackMetricCtrl.setParams(scope[iAttrs.ngModel]);
		}
	};
});

})(angulartics.prefixed('metric'));