/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Contributed by http://github.com/L42y
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.mixpanel
 * Enables analytics support for Mixpanel (http://mixpanel.com)
 */
angular.module('angulartics.mixpanel', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {
  angulartics.waitForVendorApi('mixpanel', 500, '__loaded', function (mixpanel) {
    $analyticsProvider.registerPageTrack(function (path) {
      mixpanel.track( "Page Viewed", { "page": path } );
    });
  });

  angulartics.waitForVendorApi('mixpanel', 500, '__loaded', function (mixpanel) {
    $analyticsProvider.registerEventTrack(function (action, properties) {
      mixpanel.track(action, properties);
    });
  });

  angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
    $analyticsProvider.registerSetUsername(function (userId) {
      mixpanel.identify(userId);
    });
  });

  angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
    $analyticsProvider.registerSetUserProperties(function (properties) {
      mixpanel.people.set(properties);
    });
  });

  angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
    $analyticsProvider.registerSetUserPropertiesOnce(function (properties) {
      mixpanel.people.set_once(properties);
    });
  });
}]);
})(angular);
