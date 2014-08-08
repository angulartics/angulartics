
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.multi
 * Enables support for multiple trackers - must be the first provider referenced
 *
 *
 */
angular.module('angulartics.multi', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

    var overrides = ['registerPageTrack', 'registerEventTrack'], callbacks = {};

    angular.forEach(overrides, function (meth) {

        callbacks[meth] = [];

        $analyticsProvider[meth](function () {
            var args = Array.prototype.slice.call(arguments);
            angular.forEach(callbacks[meth], function (callback) {
                callback.apply(null, args);
            });
        });

        $analyticsProvider[meth] = callbacks[meth].push.bind(callbacks[meth]);

    });

}]);
})(angular);
