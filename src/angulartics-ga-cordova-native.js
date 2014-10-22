/*
  This is a plugin written for angulartics (http://luisfarzati.github.io/angulartics/) that 
  utilizes danwilson's google analytic plugin for cordova app (https://github.com/danwilson/google-analytics-plugin)
*/
(function(angular) {
  'use strict';

  /* This is a plugin for Angulartics (https://github.com/luisfarzati/angulartics) using dan wilsons lib (https://github.com/danwilson/google-analytics-plugin */
  angular.module('angulartics.google-analytics-plugin', ['angulartics'])
  // Define and angularJS provider here so we can inject it in the .config function of our app
  .provider('googleAnalyticsPlugin', function () {
    var googleAnalyticsPlugin = ['$q','$timeout','trackingId','userId','debug','ready', function ($q, $timeout, trackingId, userId, debug, ready) {
      var deferred = $q.defer();

      // Wait for deviceready to fire, although this is redundant with bootstrap code, it is
      // nice to have so we can make this a standalone module and drop it into other projects
      document.addEventListener('deviceready', function () {
        $timeout(function() {
          deferred.resolve();
        })
      });

      // Main initialization codes; this function is run on setup
      this.init = function () {
        var defer = $q.defer();
        return deferred.promise.then(function () {
          var isWebView = !(!window.cordova && !window.PhoneGap && !window.phonegap);
          if(analytics && isWebView) {
            analytics.startTrackerWithId(trackingId);
            debug && analytics.debugMode();
            userId && analytics.setUserId(userId);
            defer.resolve();
          } else {
            console.log("analytics package not found or not in webview mode");
            defer.reject();
          }
        }, function (err) {
          defer.reject();
        }).then(function() {
          ready(analytics);
        });
      };
    }];

    return {
      // used in .config phase for initialization of the factory
      $get: ['$injector', function ($injector) {
        return $injector.instantiate(googleAnalyticsPlugin, {
          ready: this._ready || angular.noop,
          debug: this.debug || false,
          userId: this.userId || false,
          trackingId: this.trackingId
        });
      }],
      // Entry point function for angulartics
      ready: function(fn) {
        this._ready = fn;
      }
    };
  })

  .config(['$analyticsProvider','googleAnalyticsPluginProvider', function ($analyticsProvider, googleAnalyticsPluginProvider) {
    googleAnalyticsPluginProvider.ready(function (analytics) {
      // Register pageTrack with the angulartics API
      $analyticsProvider.registerPageTrack(function (path) {
        analytics.trackView(path);
      });

      // Register eventTrack with angulartics API
      $analyticsProvider.registerEventTrack(function (action, properties) {
        analytics.trackEvent(properties.category, action, properties.label, properties.value);
      });
    });

  }])

  .run(['googleAnalyticsPlugin', function (googleAnalyticsPlugin) {
    // initialize the plugin right on run time
    googleAnalyticsPlugin.init();
  }]);

})(angular);