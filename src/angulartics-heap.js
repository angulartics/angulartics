/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Heap Analytics update contributed by https://github.com/rgbj
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.heap
 * Enables analytics support for Heap (https://heapanalytics.com/)
 */
angular.module('angulartics.heap', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  $analyticsProvider.settings.trackRelativePath = true;

  $analyticsProvider.registerEventTrack(function (action, properties) {
    heap.track(action, properties);
  });

  $analyticsProvider.registerSetUsername(function (username, properties) {
    if(properties) {
      heap.identify(properties);
    }
    else {
      heap.identify({handle: username});
    }
  });

  $analyticsProvider.registerSetUserProperties(function (properties) {
    heap.setEventProperties(properties);
  });

}]);
})(angular);
