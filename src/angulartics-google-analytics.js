/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/hekike
 * License: MIT
 */

/*globals window, ga, _gaq, angular  */

(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.google.analytics
   * Enables analytics support for Google Analytics (http://google.com/analytics)
   */
  angular.module('angulartics.google.analytics', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

      // GA already supports buffered invocations so we don't need
      // to wrap these inside angulartics.waitForVendorApi

      var keyPattern = (/(ga_([\w\W])+$)|^(?!([A-z]{0,2}_)([\w\W])+$)/),
        gaPattern = /ga_([\w\W])+$/;

      $analyticsProvider.registerPageTrack(function (path) {
        if (window._gaq) {
          _gaq.push(['_trackPageview', path]);
        }
        if (window.ga) {
          ga('send', 'pageview', path);
        }
      });

      $analyticsProvider.registerEventTrack(function (action, properties) {
        var track = {},
          category,
          label;

        angular.forEach(properties, function eachProperties(prop, key) {
          if (keyPattern.test(key)) {

            if (gaPattern.test(key)) {
              key = key.substr(3);
            }

            track[key] = prop;
          }
        });

        category = track.category;
        delete track.category;

        label = track.label;
        delete track.label;

        if (window._gaq) {
          _gaq.push(['_trackEvent', category, action, label, track.value]);
        }
        if (window.ga) {
          ga('send', 'event', category, action, label, track.value);
        }
      });

    }]);

}(angular));