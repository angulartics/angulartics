/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.woopra
 * Enables analytics support for Woopra (http://www.woopra.com)
 */
angular.module('angulartics.woopra', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {
  $analyticsProvider.registerPageTrack(function (path) {
    woopra.track('pv', {
      url: path
    });
  });

  $analyticsProvider.registerEventTrack(function (action, properties) {
    woopra.track(action, properties);
  });

  $analyticsProvider.registerTrackForm(function (eventName, formName, options) {
    woopra.trackForm(eventName, formName, options);
  });

  $analyticsProvider.registerSetUsername(function (email) {
    woopra
      .identify('email', email)
      .push();
  });

  $analyticsProvider.registerSetUserProperties(function (properties) {
    if (properties.email) {
      woopra
        .identify(properties)
        .push();
    }
  });
}]);
})(angular);
