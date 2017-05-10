/**
 * (c) 2015 Mozio, inc https://github.com/mozioinc
 * Contributed by http://github.com/caioflandau
 * License: MIT
 */
(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.sessioncam
   * Enables automatic virtual pageview support for SessionCam
   */
  angular.module('angulartics.sessioncam', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {

    // Notify SessionCam on route change
    $analyticsProvider.registerPageTrack(function (path) {
      var sessionCamRecorder = window.sessionCamRecorder;
      if(sessionCamRecorder && sessionCamRecorder.createVirtualPageLoad) {
        sessionCamRecorder.createVirtualPageLoad(path);
      }
    });
  }]);
})(angular);
