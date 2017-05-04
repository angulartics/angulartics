/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Heap Analytics update contributed by https://github.com/rgbj
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.heap
 * Enables analytics support for Heap (https://heapanalytics.com/)
 */
angular.module('angulartics.heap', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  $analyticsProvider.settings.trackRelativePath = true;

  $analyticsProvider.registerEventTrack(function (action, properties) {
    dispatchToHeap('track', action, properties);
  });

  $analyticsProvider.registerSetUsername(function (username, properties) {
    if(properties) {
      dispatchToHeap('identify', properties);
    }
    else {
      dispatchToHeap('identify', {handle: username});
    }
  });

  $analyticsProvider.registerSetUserProperties(function (properties) {
    dispatchToHeap('setEventProperties', properties);
  });

  var dispatchToHeap = (function () {
    // Dispatch command to Heap library, and fail gracefully if it isn't loaded
    //  heap.command(arg1, arg2) becomes: dispatchToHeap('command', arg1, arg2)
    return function() {
      var command = arguments[0];
      var args = Array.prototype.splice.call(arguments, 1);

      if (window.heap) {
        window.heap[command].apply(this, args);
      }
    };
  })();

}]);
})(angular);
