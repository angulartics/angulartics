(function(angular) {
'use strict';

angular.module('angulartics.cb', ['angulartics'])
  .config(['$analyticsProvider', function($analyticsProvider) {

    $analyticsProvider.registerPageTrack(function(path) {
      pSUPERFLY.virtualPage(path);
    	
    });

    $analyticsProvider.registerEventTrack(function(action, properties) {
      //Chartbeat doesn't have event tacking
    });

  }]);

})(angular);
