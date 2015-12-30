/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular, analytics) {
'use strict';

var angulartics = window.angulartics || (window.angulartics = {});
angulartics.waitForVendorCount = 0;
angulartics.waitForVendorApi = function (objectName, delay, containsField, registerFn, onTimeout) {
  if (!onTimeout) { angulartics.waitForVendorCount++; }
  if (!registerFn) { registerFn = containsField; containsField = undefined; }
  if (!Object.prototype.hasOwnProperty.call(window, objectName) || (containsField !== undefined && window[objectName][containsField] === undefined)) {
    setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, containsField, registerFn, true); }, delay);
  }
  else {
    angulartics.waitForVendorCount--;
    registerFn(window[objectName]);
  }
};

/**
 * @ngdoc overview
 * @name angulartics
 */
angular.module('angulartics', [])
.provider('$analytics', $analytics)
.run(['$rootScope', '$window', '$analytics', '$injector', $analyticsRun])
.directive('analyticsOn', ['$analytics', analyticsOn]);

function $analytics() {
  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      autoBasePath: false,
      basePath: '',
      excludedRoutes: []
    },
    eventTracking: {},
    bufferFlushDelay: 1000, // Support only one configuration for buffer flush delay to simplify buffering
    developerMode: false // Prevent sending data in local/development environment
  };

  // List of known handlers that plugins can register themselves for
  var knownHandlers = [
    'pageTrack',
    'eventTrack',
    'exceptionTrack',
    'setAlias',
    'setUsername',
    'setUserProperties',
    'setUserPropertiesOnce',
    'setSuperProperties',
    'setSuperPropertiesOnce',
    'userTimings'
  ];
  // Cache and handler properties will match values in 'knownHandlers' as the buffering functons are installed.
  var cache = {};
  var handlers = {};

  // General buffering handler
  function bufferedHandler(handlerName){
    return function(){
      if(angulartics.waitForVendorCount){
        if(!cache[handlerName]){ cache[handlerName] = []; }
        cache[handlerName].push(arguments);
      }
    };
  }

  // As handlers are installed by plugins, they get pushed into a list and invoked in order.
  function updateHandlers(handlerName, fn){
    if(!handlers[handlerName]){
      handlers[handlerName] = [];
    }
    handlers[handlerName].push(fn);
    return function(){
      var handlerArgs = arguments;
      angular.forEach(handlers[handlerName], function(handler){
        handler.apply(this, handlerArgs);
      }, this);
    };
  }

  // The api (returned by this provider) gets populated with handlers below.
  var api = {
    settings: settings
  };

  // Will run setTimeout if delay is > 0
  // Runs immediately if no delay to make sure cache/buffer is flushed before anything else.
  // Plugins should take care to register handlers by order of precedence.
  function onTimeout(fn, delay){
    if(delay){
      setTimeout(fn, delay);
    } else {
      fn();
    }
  }

  var provider = {
    $get: function() { return api; },
    api: api,
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    excludeRoutes: function(routes) { this.settings.pageTracking.excludedRoutes = routes; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) {
      this.settings.pageTracking.basePath = (value) ? angular.element(document).find('base').attr('href') : '';
    },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
    developerMode: function(value) { this.settings.developerMode = value; }
  };

  // General function to register plugin handlers. Flushes buffers immediately upon registration according to the specified delay.
  function register(handlerName, fn){
    api[handlerName] = updateHandlers(handlerName, fn);
    var handlerSettings = settings[handlerName];
    var handlerDelay = (handlerSettings) ? handlerSettings.bufferFlushDelay : null;
    var delay = (handlerDelay !== null) ? handlerDelay : settings.bufferFlushDelay;
    angular.forEach(cache[handlerName], function (args, index) {
      onTimeout(function () { fn.apply(this, args); }, index * delay);
    });
  }

  function capitalize(input) {
      return input.replace(/^./, function (match) {
          return match.toUpperCase();
      });
  }

  // Adds to the provider a 'register#{handlerName}' function that manages multiple plugins and buffer flushing.
  function installHandlerRegisterFunction(handlerName){
    var registerName = 'register'+capitalize(handlerName);
    provider[registerName] = function(fn){
      register(handlerName, fn);
    };
    api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
  }

  // Set up register functions for each known handler
  angular.forEach(knownHandlers, installHandlerRegisterFunction);
  return provider;
}

function $analyticsRun($rootScope, $window, $analytics, $injector) {
  function matchesExcludedRoute(url) {
    for (var i = 0; i < $analytics.settings.pageTracking.excludedRoutes.length; i++) {
      var excludedRoute = $analytics.settings.pageTracking.excludedRoutes[i];
      if ((excludedRoute instanceof RegExp && excludedRoute.test(url)) || url.indexOf(excludedRoute) > -1) {
        return true;
      }
    }
    return false;
  }

  function pageTrack(url, $location) {
    if (!matchesExcludedRoute(url)) {
      $analytics.pageTrack(url, $location);
    }
  }

  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    $injector.invoke(['$location', function ($location) {
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
        for (var state in $state.get()) {
          noRoutesOrStates = false;
          break;
        }
      }
      if (noRoutesOrStates) {
        if ($analytics.settings.pageTracking.autoBasePath) {
          $analytics.settings.pageTracking.basePath = $window.location.pathname;
        }
        if ($analytics.settings.pageTracking.trackRelativePath) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          pageTrack(url, $location);
        } else {
          pageTrack($location.absUrl(), $location);
        }
      }
    }]);
  }

  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    $injector.invoke(['$location', function ($location) {
      if ($analytics.settings.pageTracking.autoBasePath) {
        /* Add the full route to the base. */
        $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
      }
      var noRoutesOrStates = true;
      if ($injector.has('$route')) {
        var $route = $injector.get('$route');
        for (var route in $route.routes) {
          noRoutesOrStates = false;
          break;
        }
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route||current).redirectTo) return;
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          pageTrack(url, $location);
        });
      }
      if ($injector.has('$state')) {
        noRoutesOrStates = false;
        $rootScope.$on('$stateChangeSuccess', function (event, current) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          pageTrack(url, $location);
        });
      }
      if (noRoutesOrStates) {
        $rootScope.$on('$locationChangeSuccess', function (event, current) {
          if (current && (current.$$route || current).redirectTo) return;
          if ($analytics.settings.pageTracking.trackRelativePath) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          } else {
            pageTrack($location.absUrl(), $location);
          }
        });
      }
    }]);
  }
  if ($analytics.settings.developerMode) {
    angular.forEach($analytics, function(attr, name) {
      if (typeof attr === 'function') {
        $analytics[name] = function(){};
      }
    });
  }
}

function analyticsOn($analytics) {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      var eventType = $attrs.analyticsOn || 'click';
      var trackingData = {};

      angular.forEach($attrs.$attr, function(attr, name) {
        if (isProperty(name)) {
          trackingData[propertyName(name)] = $attrs[name];
          $attrs.$observe(name, function(value){
            trackingData[propertyName(name)] = value;
          });
        }
      });

      angular.element($element[0]).bind(eventType, function ($event) {
        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
        trackingData.eventType = $event.type;

        if($attrs.analyticsIf){
          if(! $scope.$eval($attrs.analyticsIf)){
            return; // Cancel this event if we don't pass the analytics-if condition
          }
        }
        // Allow components to pass through an expression that gets merged on to the event properties
        // eg. analytics-properites='myComponentScope.someConfigExpression.$analyticsProperties'
        if($attrs.analyticsProperties){
          angular.extend(trackingData, $scope.$eval($attrs.analyticsProperties));
        }
        $analytics.eventTrack(eventName, trackingData);
      });
    }
  };
}

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
  return name.substr(0, 9) === 'analytics' && ['On', 'Event', 'If', 'Properties', 'EventType'].indexOf(name.substr(9)) === -1;
}

function propertyName(name) {
  var s = name.slice(9); // slice off the 'analytics' prefix
  if (typeof s !== 'undefined' && s!==null && s.length > 0) {
    return s.substring(0, 1).toLowerCase() + s.substring(1);
  }
  else {
    return s;
  }
}
})(angular);
