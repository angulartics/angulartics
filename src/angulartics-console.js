/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Contributed by http://github.com/hekike
 * License: MIT
 */

/*globals console */

(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.sanoma.console
   * Enables analytics support for Console
   */
  angular.module('angulartics.console', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

      $analyticsProvider.registerPageTrack(function (path) {
        console.log('Page track', {
          path: path
        });
      });

      $analyticsProvider.registerEventTrack(function (action, properties) {
        console.log('Event track', {
          action: action,
          properties: properties
        });
      });

    }]);

})(angular);