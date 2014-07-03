/**
 * @license Angulartics v0.15.19
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
.provider('$analytics', function () {
  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      autoBasePath: false,
      basePath: ''
    },
    eventTracking: {
    },
    bufferFlushDelay: 0
  };
  
  var knownHandlers = [
    'pageTrack',
    'eventTrack',
    'setUsername',
    'setUserProperties',
    'setUserPropertiesOnce',
    'setSuperProperties',
    'setSuperPropertiesOnce'
  ];
  var cache = angulartics.cache = {};
  var handlers = {};

  var bufferedHandler = function(handlerName){
    return function(){
      if(angulartics.waitForVendorCount){
        if(!cache[handlerName]){ cache[handlerName] = []; }
        cache[handlerName].push(arguments);
      }
    };
  };
  
  var updateHandlers = function(handlerName, fn){
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
  };

  var api = {
    settings: settings
  };

  // Will run setTimeout if delay is > 0
  // Runs immediately if no delay to make sure cache/buffer
  // is flushed before anything else.
  var onTimeout = function(fn, delay){
    if(delay){
      setTimeout(fn, delay);
    } else {
      fn();
    }
  };

  var provider = {
    $get: function() { return api; },
    api: api,
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) { this.settings.pageTracking.basePath = (value) ? angular.element('base').attr('href').slice(0, -1) : ''; },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },    
  };

  provider.register = function(handlerName, fn){
    api[handlerName] = updateHandlers(handlerName, fn);
    var handlerSettings = settings[handlerName];
    var delay = (handlerSettings) ? handlerSettings.bufferFlushDelay : settings.bufferFlushDelay;
    angular.forEach(cache[handlerName], function (args, index) {
      onTimeout(function () { fn.apply(this, args); }, index * delay);
    });
  };

  // Set up register functions for each known handler
  var capitalize = function (input) {
      return input.replace(/^./, function (match) {
          return match.toUpperCase();
      });
  };

  var installHandler = function(handlerName){
    var registerName = 'register'+capitalize(handlerName);
    provider[registerName] = function(fn){
      provider.register(handlerName, fn);
    };
    api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
  };
  angular.forEach(knownHandlers, installHandler);

  settings.addHandler = function(handlerName){
    if(knownHandlers.indexOf(handlerName)){
      knownHandlers.push(handlerName);
      installHandler(handlerName);
    }
  };

  return provider;
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
