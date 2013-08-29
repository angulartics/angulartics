(function(angular) {
  'use strict';

  angular.module('angulartics.segment.io', ['angulartics'])
    .config(['$analyticsProvider',
      function($analyticsProvider) {

        $analyticsProvider.registerPageTrack(function(path) {
          analytics.pageview(path);
        });

        $analyticsProvider.registerEventTrack(function(action, properties) {
          analytics.track(action, properties);
        });

      }
    ]);

})(angular);