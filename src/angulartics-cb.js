(function(angular) {
'use strict';

angular.module('angulartics.cb', ['angulartics'])
  .config(['$analyticsProvider', function($analyticsProvider) {

    $analyticsProvider.registerPageTrack(function(path) {
    	var pSUPERFLY = window.pSUPERFLY || 0;
  		if(pSUPERFLY != 0) {
  			window.pSUPERFLY.virtualPage(path);
  		}
    });

    $analyticsProvider.registerEventTrack(function(action, properties) {
      //Chartbeat doesn't have event tacking
    });

  }]);

})(angular);
