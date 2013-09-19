/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/hekike
 * License: MIT
 */

/*globals _kmq, angular */

(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.sanoma.km
   * Enables analytics support for KISSmetrics (http://kissmetrics.com)
   */
  angular.module('angulartics.km', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

      // KM already supports buffered invocations so we don't need
      // to wrap these inside angulartics.waitForVendorApi

      var keyPattern = (/(km_([\w\W])+$)|^(?!([A-z]{0,2}_)([\w\W])+$)/),
        kmPattern = /km_([\w\W])+$/;

      $analyticsProvider.registerPageTrack(function (path) {
        _kmq.push(['record', 'Pageview', { 'Page': path }]);
      });

      $analyticsProvider.registerEventTrack(function (action, properties) {
        var track = {};

        angular.forEach(properties, function eachProperties(prop, key) {
          if (keyPattern.test(key)) {

            if (kmPattern.test(key)) {
              key = key.substr(3);
            }

            track[key] = prop;
          }
        });

        _kmq.push(['record', action, track]);
      });

    }]);

}(angular));