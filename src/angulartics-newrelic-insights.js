/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Contributed by Jakub Hampl http://gampleman.eu
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.newrelic.insights
 * Enables analytics support for New Relic Insights
 */
angular.module('angulartics.newrelic.insights', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {
  angulartics.waitForVendorApi('newrelic', 100, function(newrelic) {
    $analyticsProvider.registerEventTrack(function(action, properties) {
      newrelic.addPageAction(action, properties);
    });
    $analyticsProvider.registerSetUsername(function(name) {
      newrelic.setCustomAttribute('username', name);
    });
    $analyticsProvider.registerSetAlias(function(name) {
      newrelic.setCustomAttribute('alias', name);
    });
    $analyticsProvider.registerSetUserProperties(function(properties) {
      angular.forEach(properties, function(value, key) {
        newrelic.setCustomAttribute(key, value);
      });
    });
  });
}]);
})(angular);
