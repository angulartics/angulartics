angular.module('angulartics').provider('analytics', function () {
	angular.extend(this, window.analytics);
	this.$get = function () {
		return window.analytics;
	};
});