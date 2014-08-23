/**
 * @license Angulartics v0.16.3
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
.config(['$analyticsProvider', function ($analyticsProvider) {

  // KM already supports buffered invocations so we don't need
  // to wrap these inside angulartics.waitForVendorApi

  // Creates the _kqm array if it doesn't exist already
  // Useful if you want to load angulartics before kissmetrics
  window._kmq = _kmq || [];

  $analyticsProvider.registerPageTrack(function (path, name) {
    window._kmq.push(['record', 'Pageview', { 'Page': path, 'Name': name }]);
  });

  $analyticsProvider.registerEventTrack(function (action, properties) {
    window._kmq.push(['record', action, properties]);
  });

}]);
})(angular);
