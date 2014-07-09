/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular, analytics) {
'use strict';

var angulartics = window.angulartics || (window.angulartics = {});
angulartics.waitForVendorApi = function (objectName, delay, containsField, registerFn) {
  if (!registerFn) { registerFn = containsField; containsField = undefined; }
  if (!Object.prototype.hasOwnProperty.call(window, objectName) || (containsField !== undefined && window[objectName][containsField] === undefined)) {
    setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, containsField, registerFn); }, delay);
  }
  else {
    registerFn(window[objectName]);
  }
};

/**
 * @ngdoc overview
 * @name angulartics
 */
angular.module('angulartics', [])
.provider('$analytics', function () {
  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      autoBasePath: false,
      basePath: '',
      bufferFlushDelay: 1000
    },
    eventTracking: {
      bufferFlushDelay: 1000
    }
  };

  var cache = {
    pageviews: [],
    events: [],
    setUsername: [],
    setUserProperties: [],
    setUserPropertiesOnce: []
  };

  var bufferedPageTrack = function (path) {
    cache.pageviews.push(path);
  };
  var bufferedEventTrack = function (event, properties) {
    cache.events.push({name: event, properties: properties});
  };
  var bufferedSetUsername = function (name) {
    cache.setUsername.push(name);
  };
  var bufferedSetUserProperties = function (properties) {
    cache.setUserProperties.push(properties);
  };
  var bufferedSetUserPropertiesOnce = function (properties) {
    cache.setUserPropertiesOnce.push(properties);
  };

  var api = {
    settings: settings,
    pageTrack: bufferedPageTrack,
    eventTrack: bufferedEventTrack,
    setUsername: bufferedSetUsername,
    setUserProperties: bufferedSetUserProperties,
    setUserPropertiesOnce: bufferedSetUserPropertiesOnce
  };

  var registerPageTrack = function (fn) {
    api.pageTrack = fn;
    angular.forEach(cache.pageviews, function (path, index) {
      setTimeout(function () { api.pageTrack(path); }, index * settings.pageTracking.bufferFlushDelay);
    });
  };
  var registerEventTrack = function (fn) {
    api.eventTrack = fn;
    angular.forEach(cache.events, function (event, index) {
      setTimeout(function () { api.eventTrack(event.name, event.properties); }, index * settings.eventTracking.bufferFlushDelay);
    });
  };
  var registerSetUsername = function (fn) {
    api.setUsername = fn;
    angular.forEach(cache.setUsername, function (name, index) {
      setTimeout(function () { api.setUsername(name); }, index * settings.pageTracking.bufferFlushDelay);
    });
  };
  var registerSetUserProperties = function (fn) {
    api.setUserProperties = fn;
    angular.forEach(cache.setUserProperties, function (properties, index) {
      setTimeout(function () { api.setUserProperties(properties); }, index * settings.pageTracking.bufferFlushDelay);
    });
  };
  var registerSetUserPropertiesOnce = function (fn) {
    api.setUserPropertiesOnce = fn;
    angular.forEach(cache.setUserPropertiesOnce, function (properties, index) {
      setTimeout(function () { api.setUserPropertiesOnce(properties); }, index * settings.pageTracking.bufferFlushDelay);
    });
  };

  return {
    $get: function() { return api; },
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) { this.settings.pageTracking.basePath = (value) ? angular.element('base').attr('href').slice(0, -1) : ''; },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
    registerPageTrack: registerPageTrack,
    registerEventTrack: registerEventTrack,
    registerSetUsername: registerSetUsername,
    registerSetUserProperties: registerSetUserProperties,
    registerSetUserPropertiesOnce: registerSetUserPropertiesOnce
  };
})

.run(['$rootScope', '$location', '$window', '$analytics', '$injector', function ($rootScope, $location, $window, $analytics, $injector) {
  
    
  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    /* Only track the 'first page' if there are no routes or states on the page */
    var noRoutesOrStates = true;
    if ($injector.has('$route')) {
       var $route = $injector.get('$route');
       for (var route in $route.routes) {
         noRoutesOrStates = false;
         break;
       }
    } else if ($injector.has('$state')) {
      var $state = $injector.get('$state');
      for (var state in $state.states) {
        noRoutesOrStates = false;
        break;
      }
    } else {
      noRoutesOrStates = false;
    }
    if (noRoutesOrStates) {
      if ($analytics.settings.pageTracking.autoBasePath) {
        $analytics.settings.pageTracking.basePath = $window.location.pathname;
      }
      if ($analytics.settings.trackRelativePath) {
        var url = $analytics.settings.pageTracking.basePath + $location.url();
        $analytics.pageTrack(url);
      } else {
   $analytics.pageTrack($location.absUrl());
      }
    }
  }
  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    if ($analytics.settings.pageTracking.autoBasePath) {
      /* Add the full route to the base. */
      $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
    }
    if ($injector.has('$route')) {
      $rootScope.$on('$routeChangeSuccess', function (event, current) {
        if (current && (current.$$route||current).redirectTo) return;
        var url = $analytics.settings.pageTracking.basePath + $location.url();
        $analytics.pageTrack(url);
      });
    }
    if ($injector.has('$state')) {
      $rootScope.$on('$stateChangeSuccess', function (event, current) {
        var url = $analytics.settings.pageTracking.basePath + $location.url();
        $analytics.pageTrack(url);
      });
    }
  }
}])

.directive('analyticsOn', ['$analytics', function ($analytics) {
  function isCommand(element) {
    return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
      element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
  }

  function inferEventType(element) {
    if (isCommand(element)) return 'click';
    return 'click';
  }

  function inferEventName(element) {
    if (isCommand(element)) return element.innerText || element.value;
    return element.id || element.name || element.tagName;
  }

  function isProperty(name) {
    return name.substr(0, 9) === 'analytics' && ['On', 'Event'].indexOf(name.substr(9)) === -1;
  }

  return {
    restrict: 'A',
    scope: false,
    link: function ($scope, $element, $attrs) {
      var eventType = $attrs.analyticsOn || inferEventType($element[0]);

      angular.element($element[0]).bind(eventType, function () {
        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
        var properties = {};
        angular.forEach($attrs.$attr, function(attr, name) {
            if (isProperty(name)) {
                properties[name.slice(9).toLowerCase()] = $attrs[name];
            }
        });

        $analytics.eventTrack(eventName, properties);
      });
    }
  };
}]);
})(angular);
