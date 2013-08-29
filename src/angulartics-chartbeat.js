(function(angular) {
  'use strict';

  angular.module('angulartics.chartbeat', ['angulartics'])
    .config(['$analyticsProvider',
      function($analyticsProvider) {

        $analyticsProvider.registerPageTrack(function(path) {
          pSUPERFLY.virtualPage(path);

        });

        $analyticsProvider.registerEventTrack(function(action, properties) {
          // Chartbeat doesn't have event tracking
        });

      }
    ]);

})(angular);