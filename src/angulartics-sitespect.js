/**
 * @license Angulartics v0.19.2
 * (c) 2014 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function (angular) {
	'use strict';

	/**
	 * @ngdoc overview
	 * @name angulartics.sitespect
	 * Enables analytics sitespect implementation of angulartics
	 */
	angular.module('angulartics.sitespect', ['angulartics'])
	.config(['$analyticsProvider', function ($analyticsProvider) {

				$analyticsProvider.registerPageTrack(function (path) {
					try {
						SS.EventTrack.rp('page-view', path);
					} catch (err) {
						console.warn("core.js not loaded");
						console.log('page-view', path)
					}
				});

				/**
				 * Track Event
				 * @name eventTrack
				 */
				$analyticsProvider.registerEventTrack(function (action, properties) {
					var JSONToQueryString = function (a) {
						var params = Object.keys(a).map(function (k) {
								return encodeURIComponent(k) + '=' + encodeURIComponent(a[k])
							}).join('&');
							return params;
					}
					try {
						SS.EventTrack.rp("event=true&" + JSONToQueryString(properties));
					} catch (err) {
						console.warn("core.js not loaded");
						console.log("event=true&" + JSONToQueryString(properties));
					}
				});

			}
		]);
})(angular);
