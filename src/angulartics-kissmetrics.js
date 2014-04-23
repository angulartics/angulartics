/**
 * @license Angulartics v0.15.17
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.kissmetrics
 * Enables analytics support for KISSmetrics (http://kissmetrics.com)
 */
angular.module('angulartics.kissmetrics', ['angulartics'])
.config(['$analyticsProvider', '$window', function ($analyticsProvider, $window) {

  // KM already supports buffered invocations so we don't need
  // to wrap these inside angulartics.waitForVendorApi

  // Creates the _kqm array if it doesn't exist already
  // Useful if you want to load angulartics before kissmetrics
  $window._kmq = _kmq || [];

  $analyticsProvider.registerPageTrack(function (path) {
    $window._kmq.push(['record', 'Pageview', { 'Page': path }]);
  });

  $analyticsProvider.registerEventTrack(function (action, properties) {
    $window._kmq.push(['record', action, properties]);
  });

}]);
})(angular);
