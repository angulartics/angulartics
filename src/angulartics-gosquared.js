/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.gosquared
 * Enables analytics support for GoSquared (https://www.gosquared.com)
 */
angular.module('angulartics.gosquared', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  $analyticsProvider.settings.pageTracking.trackRelativePath = true;

  // Set the default settings for this module
  $analyticsProvider.settings.gosquared = {
    // Whether to send person details along with events.
    sendPersonDetailsWithEvents: false
  };

  angulartics.waitForVendorApi('_gs', 500, function (_gs) {
    $analyticsProvider.registerPageTrack(function (path) {
      _gs('track');
    });
  });

  /**
   * Track Event in GoSquared
   * @name eventTrack
   *
   * @param {string} action Required 'action' (string) associated with the event
   * @param {object} properties
   *
   * @link https://www.gosquared.com/docs/tracking/events/
   */
  angulartics.waitForVendorApi('_gs', 500, function (_gs) {
    $analyticsProvider.registerEventTrack(function (action, properties) {
      properties.details = $analyticsProvider.settings.gosquared.sendPersonDetailsWithEvents;
      _gs('event', action, properties);
    });
  });

  /**
   * Identify a User in GoSquared
   * @name eventTrack
   *
   * @param {object} properties
   *
   * @link https://www.gosquared.com/docs/tracking/identify/
   */
  angulartics.waitForVendorApi('_gs', 500, function (_gs) {
    $analyticsProvider.registerSetUserProperties(function (properties) {
      _gs('identify', properties);
    });
  });

  /**
   * Identify a User in GoSquared
   * @name eventTrack
   *
   * @param {object} properties
   *
   * @link https://www.gosquared.com/docs/tracking/identify/
   */
  angulartics.waitForVendorApi('_gs', 500, function (_gs) {
    $analyticsProvider.registerSetUserPropertiesOnce(function (properties) {
      _gs('identify', properties);
    });
  });

}]);
})(angular);
