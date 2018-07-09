/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.branch.cordova
 * Enables analytics support for Branch (https://branch.io/)
 */
angular.module('angulartics.branch.cordova', ['angulartics'])

.provider('branchCordova', function () {
  var BranchCordova = [
  '$q', '$log', 'ready', 'debug',
  function ($q, $log, ready, debug) {
    var deferred = $q.defer();
    var deviceReady = false;

    window.addEventListener('deviceReady', function () {
      deviceReady = true;
      deferred.resolve();
    });

    setTimeout(function () {
      if (!deviceReady) {
        deferred.resolve();
      }
    }, 3000);

    function success() {
      if (debug) {
        $log.info(arguments);
      }
    }

    function failure(err) {
      if (debug) {
        $log.error(err);
      }
    }

    this.init = function () {
      return deferred.promise.then(function () {

        var branch = window.Branch;
        if (typeof branch != 'undefined') {
          ready(branch, success, failure);
        } else if (debug) {
          $log.error('Branch Plugin for Cordova is not available');
        }
      });
    };
  }];

  return {
    $get: ['$injector', function ($injector) {
      return $injector.instantiate(BranchCordova, {
        ready: this._ready || angular.noop,
        debug: this.debug
      });
    }],
    ready: function (fn) {
      this._ready = fn;
    }
  };
})

.config(['$analyticsProvider', 'branchCordovaProvider', function ($analyticsProvider, branchCordovaProvider) {
  branchCordovaProvider.ready(function (branch, success, failure) {
    $analyticsProvider.registerSetUsername(function (userId) {
      branch.setIdentity(userId);
    });
    $analyticsProvider.registerSetAlias(function (userId) {
      branch.setIdentity(userId);
    });
    $analyticsProvider.registerSetUserProperties(function (properties) {
      branch.updateUser(properties);
    });
    $analyticsProvider.registerEventTrack(function (action, properties) {
      branch.userCompletedAction(action, properties);
    });
  });
}])

.run(['branchCordova', function (branchCordova) {
  branchCordova.init();
}]);

})(angular);
