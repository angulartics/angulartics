(function(angular) {
  'use strict';

  angular.module('angulartics.mixpanel', ['angulartics'])
    .config(['$analyticsProvider', function($analyticsProvider) {

      $analyticsProvider.registerPageTrack(function(path) {
        mixpanel.track_pageview(path);
      });

      $analyticsProvider.registerEventTrack(function(action, properties) {
        mixpanel.track(action, properties);
      });
    }]);
})(angular);
