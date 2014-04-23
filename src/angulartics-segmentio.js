/**
 * @license Angulartics v0.15.17
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.segment.io
 * Enables analytics support for Segment.io (http://segment.io)
 */
angular.module('angulartics.segment.io', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {
  $analyticsProvider.registerPageTrack(function (path) {
    try {
        analytics.pageview(path);
    } catch (e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
    }
  });

  $analyticsProvider.registerEventTrack(function (action, properties) {
    try {
      analytics.track(action, properties);
    } catch (e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
    }
  });
}]);
})(angular);
