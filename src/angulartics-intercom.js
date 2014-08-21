/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.intercom
 * Enables analytics support for Intercom (https://www.intercom.io/)
 */
angular.module('angulartics.intercom', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  /**
   * Track Event in Intercom
   * @name eventTrack
   *
   * @param {string} action Required 'action' (string) associated with the event
   * @param {object} properties = metadata
   *
   * @link http://doc.intercom.io/api/?javascript#submitting-events
   *
   * @example
   *   Intercom('trackEvent', 'invited-friend');
   */
  $analyticsProvider.registerEventTrack(function (action, properties) {

    if(window.Intercom) {
      Intercom('trackEvent', action, properties);
    }

  });

}]);
})(angular);

