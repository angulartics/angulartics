/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://angulartics.github.io/
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
.directive('analyticsOn', ['$analytics', analyticsOn])
.config(['$provide', exceptionTrack]);

function $analytics() {
  var vm = this;

  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      trackRoutes: true,
      trackStates: true,
      autoBasePath: false,
      basePath: '',
      excludedRoutes: [],
      queryKeysWhitelisted: [],
      queryKeysBlacklisted: [],
      filterUrlSegments: [],
      clearIds: false,
      clearHash: false,
      clearQueryParams: false,
      idsRegExp: /^\d+$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    },
    eventTracking: {},
    bufferFlushDelay: 1000, // Support only one configuration for buffer flush delay to simplify buffering
    trackExceptions: false,
    optOut: false,
    developerMode: false // Prevent sending data in local/development environment
  };

  // List of known handlers that plugins can register themselves for
  var knownHandlers = [
    'pageTrack',
    'eventTrack',
    'exceptionTrack',
    'transactionTrack',
    'setAlias',
    'setUsername',
    'setUserProperties',
    'setUserPropertiesOnce',
    'setSuperProperties',
    'setSuperPropertiesOnce',
    'incrementProperty',
    'userTimings',
    'clearCookies'
  ];
  // Cache and handler properties will match values in 'knownHandlers' as the buffering functons are installed.
  var cache = {};
  var handlers = {};
  var handlerOptions = {};

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
  function updateHandlers(handlerName, fn, options){
    if(!handlers[handlerName]){
      handlers[handlerName] = [];
    }
    handlers[handlerName].push(fn);
    handlerOptions[fn] = options;
    return function(){
      if(!this.settings.optOut) {
        var handlerArgs = Array.prototype.slice.apply(arguments);
        return this.$inject(['$q', angular.bind(this, function($q) {
          return $q.all(handlers[handlerName].map(function(handlerFn) {
            var options = handlerOptions[handlerFn] || {};
            if (options.async) {
              var deferred = $q.defer();
              var currentArgs = angular.copy(handlerArgs);
              currentArgs.unshift(deferred.resolve);
              handlerFn.apply(this, currentArgs);
              return deferred.promise;
            } else{
              return $q.when(handlerFn.apply(this, handlerArgs));
            }
          }, this));
        })]);
      }
    };
  }

  // The api (returned by this provider) gets populated with handlers below.
  var api = {
    settings: settings
  };

  // Opt in and opt out functions
  api.setOptOut = function(optOut) {
    vm.settings.optOut = optOut;
    triggerRegister();
  };

  api.getOptOut = function() {
    return vm.settings.optOut;
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
    $get: ['$injector', function($injector) {
      return apiWithInjector($injector);
    }],
    api: api,
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    trackStates: function (value) { this.settings.pageTracking.trackStates = value; },
    trackRoutes: function (value) { this.settings.pageTracking.trackRoutes = value; },
    excludeRoutes: function(routes) { this.settings.pageTracking.excludedRoutes = routes; },
    queryKeysWhitelist: function(keys) { this.settings.pageTracking.queryKeysWhitelisted = keys; },
    queryKeysBlacklist: function(keys) { this.settings.pageTracking.queryKeysBlacklisted = keys; },
    filterUrlSegments: function(filters) { this.settings.pageTracking.filterUrlSegments = filters; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) {
      this.settings.pageTracking.basePath = (value) ? angular.element(document).find('base').attr('href') : '';
    },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
    trackExceptions: function (value) { this.settings.trackExceptions = value; },
    developerMode: function(value) { this.settings.developerMode = value; },
    clearIds: function(value) { this.settings.pageTracking.clearIds = value; },
    clearHash: function(value) { this.settings.pageTracking.clearHash = value; },
    clearQueryParams: function(value) { this.settings.pageTracking.clearQueryParams = value; },
    idsRegExp: function(value) { this.settings.pageTracking.idsRegExp = value; }
  };

  // General function to register plugin handlers. Flushes buffers immediately upon registration according to the specified delay.
  function register(handlerName, fn, options){
    // Do not add a handler if developerMode is true
    if (settings.developerMode) {
        return;
    }
    api[handlerName] = updateHandlers(handlerName, fn, options);
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

  //provide a method to inject services into handlers
  var apiWithInjector = function(injector) {
    return angular.extend(api, {
      '$inject': injector.invoke
    });
  };

  // Adds to the provider a 'register#{handlerName}' function that manages multiple plugins and buffer flushing.
  function installHandlerRegisterFunction(handlerName){
    var registerName = 'register'+capitalize(handlerName);
    provider[registerName] = function(fn, options){
      register(handlerName, fn, options);
    };
    api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
  }

  function startRegistering(_provider, _knownHandlers, _installHandlerRegisterFunction) {
    angular.forEach(_knownHandlers, _installHandlerRegisterFunction);

    for (var key in _provider) {
      vm[key] = _provider[key];
    }
  }

  // Allow $angulartics to trigger the register to update opt in/out
  var triggerRegister = function() {
    startRegistering(provider, knownHandlers, installHandlerRegisterFunction);
  };

  // Initial register
  startRegistering(provider, knownHandlers, installHandlerRegisterFunction);

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

  function arrayDifference(a1, a2) {
    var result = [];
    for (var i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        result.push(a1[i]);
      }
    }
    return result;
  }

  function filterQueryString(url, keysMatchArr, thisType){
    if (/\?/.test(url) && keysMatchArr.length > 0) {
      var urlArr = url.split('?');
      var urlBase = urlArr[0];
      var pairs = urlArr[1].split('&');
      var matchedPairs = [];

      for (var i = 0; i < keysMatchArr.length; i++) {
        var listedKey = keysMatchArr[i];
        for (var j = 0; j < pairs.length; j++) {
          if ((listedKey instanceof RegExp && listedKey.test(pairs[j])) || pairs[j].indexOf(listedKey) > -1) matchedPairs.push(pairs[j]);
        }
      }

      var matchedPairsArr = (thisType == 'white' ? matchedPairs : arrayDifference(pairs,matchedPairs));
      if(matchedPairsArr.length > 0){
        return urlBase + '?' + matchedPairsArr.join('&');
      }else{
        return urlBase;
      }
    } else {
      return url;
    }
  }

  function whitelistQueryString(url){
    return filterQueryString(url, $analytics.settings.pageTracking.queryKeysWhitelisted, 'white');
  }

  function blacklistQueryString(url){
    return filterQueryString(url, $analytics.settings.pageTracking.queryKeysBlacklisted, 'black');
  }

  function filterUrlSegments(url){
    var segmentFiltersArr = $analytics.settings.pageTracking.filterUrlSegments;

    if (segmentFiltersArr.length > 0) {
      var urlArr = url.split('?');
      var urlBase = urlArr[0];

      var segments = urlBase.split('/');

      for (var i = 0; i < segmentFiltersArr.length; i++) {
        var segmentFilter = segmentFiltersArr[i];

        for (var j = 1; j < segments.length; j++) {
          /* First segment will be host/protocol or base path. */
          if ((segmentFilter instanceof RegExp && segmentFilter.test(segments[j])) || segments[j].indexOf(segmentFilter) > -1) {
            segments[j] = 'FILTERED';
          }
        }
      }

      return segments.join('/');
    } else {
      return url;
    }
  }

  function clearUrl(url){
    if ($analytics.settings.pageTracking.clearIds || $analytics.settings.pageTracking.clearQueryParams ||
      $analytics.settings.pageTracking.clearHash) {
      return url
        .split('/')
        .map(function(part){return $analytics.settings.pageTracking.clearQueryParams ? part.split('?')[0] : part;})
        .map(function(part){return $analytics.settings.pageTracking.clearHash ? part.split('#')[0] : part;})
        .filter(function(part){return !$analytics.settings.pageTracking.clearIds || !part.match($analytics.settings.pageTracking.idsRegExp);})
        .join('/');
    }
    return url;
  }

  function pageTrack(url, $location) {
    if (!matchesExcludedRoute(url)) {
      url = clearUrl(url);
      url = whitelistQueryString(url);
      url = blacklistQueryString(url);
      url = filterUrlSegments(url);
      $analytics.pageTrack(url, $location);
    }
  }

  var noRoutesOrStates;
  var $route;
  var route;

  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    /* Only track the 'first page' if there are no routes or states on the page */
    noRoutesOrStates = true;
    if ($injector.has('$route')) {
       $route = $injector.get('$route');
       if ($route) {
        for (route in $route.routes) {
          noRoutesOrStates = false;
          break;
        }
       } else if ($route === null){
        noRoutesOrStates = false;
       }
    } else if ($injector.has('$state')) {
      var $state = $injector.get('$state');
      if ($state.get().length > 1) noRoutesOrStates = false;
    }
    if (noRoutesOrStates) {
      if ($analytics.settings.pageTracking.autoBasePath) {
        $analytics.settings.pageTracking.basePath = $window.location.pathname;
      }
      $injector.invoke(['$location', function ($location) {
        if ($analytics.settings.pageTracking.trackRelativePath) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          pageTrack(url, $location);
        } else {
          pageTrack($location.absUrl(), $location);
        }
      }]);
    }
  }

  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    if ($analytics.settings.pageTracking.autoBasePath) {
      /* Add the full route to the base. */
      $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
    }
    noRoutesOrStates = true;

    if ($analytics.settings.pageTracking.trackRoutes) {
      if ($injector.has('$route')) {
        $route = $injector.get('$route');
        if ($route) {
          for (route in $route.routes) {
            noRoutesOrStates = false;
            break;
          }
        } else if ($route === null){
          noRoutesOrStates = false;
        }
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route||current).redirectTo) return;
          $injector.invoke(['$location', function ($location) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          }]);
        });
      }
    }

    if ($analytics.settings.pageTracking.trackStates) {
      if ($injector.has('$state') && !$injector.has('$transitions')) {
        noRoutesOrStates = false;
        $rootScope.$on('$stateChangeSuccess', function (event, current) {
          $injector.invoke(['$location', function ($location) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          }]);
        });
      }
      if ($injector.has('$state') && $injector.has('$transitions')) {
        noRoutesOrStates = false;
        $injector.invoke(['$transitions', function($transitions) {
          $transitions.onSuccess({}, function($transition$) {
            var transitionOptions = $transition$.options();

            // only track for transitions that would have triggered $stateChangeSuccess
            if (transitionOptions.notify) {
              $injector.invoke(['$location', function ($location) {
                var url = $analytics.settings.pageTracking.basePath + $location.url();
                pageTrack(url, $location);
              }]);
            }
          });
        }]);
      }
    }

    if (noRoutesOrStates) {
      $rootScope.$on('$locationChangeSuccess', function (event, current) {
        if (current && (current.$$route || current).redirectTo) return;
        $injector.invoke(['$location', function ($location) {
          if ($analytics.settings.pageTracking.trackRelativePath) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          } else {
            pageTrack($location.absUrl(), $location);
          }
        }]);
      });
    }
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

      angular.element($element[0]).on(eventType, function ($event) {
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

function exceptionTrack($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
    return function (error, cause) {
      var result = $delegate(error, cause);
      var $analytics = $injector.get('$analytics');
      if ($analytics.settings.trackExceptions) {
        $analytics.exceptionTrack(error, cause);
      }
      return result;
    };
  }]);
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
