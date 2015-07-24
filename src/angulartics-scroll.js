/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function (angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.scroll
 * Provides an implementation of jQuery Waypoints (http://imakewebthings.com/jquery-waypoints/)
 * for use as a valid DOM event in analytics-on.
 */
angular.module('angulartics.scroll', ['angulartics'])
.factory('$waypoint', function () {
  return function(options) {
    return new Waypoint(options);
  };
})
.directive('analyticsOn', ['$analytics', '$waypoint', function ($analytics, $waypoint) {
  function isProperty (name) {
    return name.substr(0, 8) === 'scrollby';
  }
  function cast (value) {
    if (value === '' || value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      return value;
    }
  }

  return {
    restrict: 'A',
    priority: 5,
    scope: false,
    link: function ($scope, $element, $attrs) {
      if ($attrs.analyticsOn !== 'scrollby') return;

      var properties = {
        handler: function () {
          $element.triggerHandler('scrollby');
          if (this.options.triggeronce) {
            this.destroy();
          }
        },
        element: $element[0],
        continuous: false,
        triggeronce: true
      };
      angular.forEach($attrs.$attr, function (attr, name) {
        if (isProperty(attr)) {
          properties[name.slice(8,9).toLowerCase()+name.slice(9)] = cast($attrs[name]);
        }
      });

      $waypoint(properties);
    }
  };
}]);
})(angular);
