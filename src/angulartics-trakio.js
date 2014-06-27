/**
 * @license Angulartics v0.15.19
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.trak.io
 * Enables analytics support for Trak.io (http://trak.io)
 */
angular.module('angulartics.trak.io', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {
  $analyticsProvider.registerPageTrack(function (path) {
    trak.io.page_view(path);
  });

  $analyticsProvider.registerEventTrack(function (action, properties) {
    trak.io.track(action, properties);
  });

}]);
})(angular);