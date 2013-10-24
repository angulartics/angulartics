(function (TRACK_METRIC, TRACK_ON) {
'use strict';

angular.module('angulartics').directive(TRACK_ON, function () {
	return {
		require: TRACK_METRIC,
		link: function (scope, element, attrs, metricCtrl) {
			element.bind(attrs[TRACK_ON], metricCtrl.hit);
		}
	};
});

})(angulartics.prefixed('metric'), angulartics.prefixed('on'));